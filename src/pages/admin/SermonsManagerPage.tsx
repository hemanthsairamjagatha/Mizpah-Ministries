import React, { useEffect, useState } from 'react';
import { sermonService } from '../../services/sermonService';
import type { Sermon } from '../../types/database.types';
import { Button } from '../../components/common/Button';
import { Input, Textarea } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ImageUpload } from '../../components/common/ImageUpload';
import { TableSkeleton } from '../../components/common/Skeleton';
import { formatDate, getYouTubeThumbnailUrl, getYouTubeEmbedUrl, resolveImageUrl } from '../../lib/utils';
import { toast } from 'sonner';
import {
  Plus,
  Edit2,
  Trash2,
  Tv,
  Search,
  Eye,
  EyeOff,
  ExternalLink,
  Calendar,
  User,
  Play,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const SermonsManagerPage: React.FC = () => {
  const { user } = useAuth();
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSermon, setEditingSermon] = useState<Sermon | null>(null);

  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pastorName, setPastorName] = useState('Pastor Ezekiel.G');
  const [sermonDate, setSermonDate] = useState(new Date().toISOString().split('T')[0]);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [thumbnailPath, setThumbnailPath] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Sermon | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Video preview modal
  const [previewSermon, setPreviewSermon] = useState<Sermon | null>(null);

  const fetchSermons = async () => {
    setLoading(true);
    try {
      const data = await sermonService.getAllSermons(searchQuery);
      setSermons(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch sermons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSermons();
  }, [searchQuery]);

  const openCreateModal = () => {
    setEditingSermon(null);
    setTitle('');
    setDescription('');
    setPastorName('Pastor Ezekiel.G');
    setSermonDate(new Date().toISOString().split('T')[0]);
    setYoutubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    setThumbnailPath('');
    setIsPublished(true);
    setIsModalOpen(true);
  };

  const openEditModal = (s: Sermon) => {
    setEditingSermon(s);
    setTitle(s.title);
    setDescription(s.description);
    setPastorName(s.pastor_name);
    setSermonDate(s.sermon_date);
    setYoutubeUrl(s.youtube_url);
    setThumbnailPath(s.thumbnail_path || '');
    setIsPublished(s.is_published);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !pastorName.trim() || !youtubeUrl.trim()) {
      toast.error('All required fields must be filled out');
      return;
    }

    setIsSaving(true);
    try {
      if (editingSermon) {
        await sermonService.updateSermon(editingSermon.id, {
          title,
          description,
          pastor_name: pastorName,
          sermon_date: sermonDate,
          youtube_url: youtubeUrl,
          thumbnail_path: thumbnailPath || null,
          is_published: isPublished,
        });
        toast.success('Sermon updated successfully');
      } else {
        await sermonService.createSermon({
          title,
          description,
          pastor_name: pastorName,
          sermon_date: sermonDate,
          youtube_url: youtubeUrl,
          thumbnail_path: thumbnailPath || null,
          is_published: isPublished,
          created_by: user?.id || null,
        });
        toast.success('New sermon added to archive');
      }
      setIsModalOpen(false);
      fetchSermons();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save sermon');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async (s: Sermon) => {
    try {
      await sermonService.updateSermon(s.id, { is_published: !s.is_published });
      toast.success(s.is_published ? 'Sermon hidden from public' : 'Sermon published on website');
      fetchSermons();
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await sermonService.deleteSermon(deleteTarget.id);
      toast.success('Sermon deleted');
      setDeleteTarget(null);
      fetchSermons();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete sermon');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="font-inter text-2xl font-bold text-navy-900 flex items-center gap-2.5">
            <Tv className="w-6 h-6 text-sky-500" />
            Sermons Management
          </h1>
          <p className="text-sm text-navy-500 mt-1">
            Manage your audio & video sermon archives, YouTube video streaming links, and preach dates
          </p>
        </div>
        <Button
          variant="primary"
          onClick={openCreateModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add New Sermon
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-navy-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by sermon title, preacher or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white text-navy-900"
          />
        </div>
        <span className="text-xs text-navy-500 font-medium">
          Total Sermons: <strong>{sermons.length}</strong>
        </span>
      </div>

      {loading && <TableSkeleton rows={4} />}

      {/* Sermons Table / Cards */}
      {!loading && sermons.length > 0 && (
        <>
          {/* Mobile View: Responsive Cards */}
          <div className="block md:hidden space-y-3">
            {sermons.map((sermon) => {
              const thumb = sermon.thumbnail_path
                ? resolveImageUrl(sermon.thumbnail_path)
                : getYouTubeThumbnailUrl(sermon.youtube_url) || '/images/hero-church.jpg';

              return (
                <div key={sermon.id} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs">
                  <div className="flex gap-3 items-start">
                    <div
                      onClick={() => setPreviewSermon(sermon)}
                      className="relative w-20 h-14 rounded-lg overflow-hidden bg-black shrink-0 cursor-pointer group"
                    >
                      <img src={thumb} alt={sermon.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Play className="w-4 h-4 text-white fill-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span
                        onClick={() => setPreviewSermon(sermon)}
                        className="font-inter font-bold text-navy-900 text-sm line-clamp-1 cursor-pointer hover:text-sky-600"
                      >
                        {sermon.title}
                      </span>
                      <p className="text-xs text-navy-600 line-clamp-1 mt-0.5">{sermon.pastor_name}</p>
                      <span className="text-[11px] text-slate-400 block mt-0.5">{formatDate(sermon.sermon_date)}</span>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleTogglePublish(sermon)}
                      className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full transition ${
                        sermon.is_published
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {sermon.is_published ? 'Published' : 'Hidden'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setPreviewSermon(sermon)}
                        title="Play Video"
                      >
                        <Play className="w-3.5 h-3.5 text-sky-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(sermon)}
                        leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setDeleteTarget(sermon)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop View: Full Table */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-navy-800">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-navy-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Sermon</th>
                  <th className="py-3.5 px-4">Speaker</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sermons.map((sermon) => {
                  const thumb = sermon.thumbnail_path
                    ? resolveImageUrl(sermon.thumbnail_path)
                    : getYouTubeThumbnailUrl(sermon.youtube_url) || '/images/hero-church.jpg';

                  return (
                    <tr key={sermon.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            onClick={() => setPreviewSermon(sermon)}
                            className="relative w-20 h-13 rounded-lg overflow-hidden bg-black shrink-0 cursor-pointer group"
                          >
                            <img
                              src={thumb}
                              alt={sermon.title}
                              className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Play className="w-4 h-4 text-white fill-white" />
                            </div>
                          </div>
                          <div>
                            <span
                              onClick={() => setPreviewSermon(sermon)}
                              className="font-inter font-bold text-navy-900 hover:text-sky-600 cursor-pointer block line-clamp-1"
                            >
                              {sermon.title}
                            </span>
                            <span className="text-xs text-navy-500 line-clamp-1 mt-0.5">
                              {sermon.description}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-xs font-medium text-navy-700">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-sky-500" />
                          {sermon.pastor_name}
                        </span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-xs text-navy-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(sermon.sermon_date)}
                        </span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <button
                          onClick={() => handleTogglePublish(sermon)}
                          className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-full transition ${
                            sermon.is_published
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {sermon.is_published ? 'Published' : 'Hidden'}
                        </button>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setPreviewSermon(sermon)}
                            title="Play Video"
                          >
                            <Play className="w-3.5 h-3.5 text-sky-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditModal(sermon)}
                            leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => setDeleteTarget(sermon)}
                            title="Delete Sermon"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        </>
      )}

      {/* Empty State */}
      {!loading && sermons.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Tv className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-navy-800">No Sermons Found</h3>
          <p className="text-sm text-navy-500 mt-1 mb-6">
            Upload your first Sunday sermon message to stream online.
          </p>
          <Button variant="primary" onClick={openCreateModal}>
            Add First Sermon
          </Button>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSermon ? 'Edit Sermon Message' : 'Add New Sermon'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Sermon Title"
            placeholder="e.g. The Power of Steadfast Prayer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Preacher / Speaker Name"
              placeholder="e.g. Pastor Ezekiel.G"
              value={pastorName}
              onChange={(e) => setPastorName(e.target.value)}
              required
            />
            <Input
              label="Sermon Date"
              type="date"
              value={sermonDate}
              onChange={(e) => setSermonDate(e.target.value)}
              required
            />
          </div>

          <Input
            label="YouTube Video Link (youtube.com or youtu.be)"
            placeholder="https://www.youtube.com/watch?v=..."
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            helperText="Supports youtube.com/watch?v=..., youtu.be/..., or youtube.com/shorts/..."
            required
          />

          <Textarea
            label="Message Summary / Scripture Points"
            rows={3}
            placeholder="Discover how personal prayer shifts anxiety into unshakeable divine peace..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <ImageUpload
            bucket="sermon-thumbnails"
            folder="thumbnails"
            label="Custom Thumbnail Photo (Optional — auto-fetches YouTube thumbnail if omitted)"
            currentImageUrl={thumbnailPath}
            onImageUploaded={(url) => setThumbnailPath(url)}
          />

          <div className="pt-2 flex items-center gap-2">
            <input
              id="isPublishedSermon"
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 text-sky-500 rounded border-slate-300 focus:ring-sky-400"
            />
            <label htmlFor="isPublishedSermon" className="text-sm font-medium text-navy-800">
              Publish on Live Public Website
            </label>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSaving}
            >
              {editingSermon ? 'Save Changes' : 'Create Sermon'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Video Player Modal */}
      <Modal
        isOpen={!!previewSermon}
        onClose={() => setPreviewSermon(null)}
        title={previewSermon?.title}
        maxWidth="4xl"
      >
        {previewSermon && (
          <div className="space-y-4">
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-black shadow-lg">
              {getYouTubeEmbedUrl(previewSermon.youtube_url) ? (
                <iframe
                  src={getYouTubeEmbedUrl(previewSermon.youtube_url)!}
                  title={previewSermon.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white">
                  <p className="text-sm mb-3">Unable to embed video</p>
                  <a href={previewSermon.youtube_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="primary">Watch on YouTube</Button>
                  </a>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between text-xs text-navy-500">
              <span>Preacher: <strong>{previewSermon.pastor_name}</strong></span>
              <span>Preached on: <strong>{formatDate(previewSermon.sermon_date)}</strong></span>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Sermon?"
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"?`}
      />
    </div>
  );
};
