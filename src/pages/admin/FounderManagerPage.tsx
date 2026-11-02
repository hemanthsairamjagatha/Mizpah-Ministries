import React, { useEffect, useState } from 'react';
import { founderService } from '../../services/founderService';
import type { Founder } from '../../types/database.types';
import { Button } from '../../components/common/Button';
import { Input, Textarea } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ImageUpload } from '../../components/common/ImageUpload';
import { TableSkeleton } from '../../components/common/Skeleton';
import { resolveImageUrl } from '../../lib/utils';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, HeartHandshake, Star, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const FounderManagerPage: React.FC = () => {
  const { user } = useAuth();
  const [founders, setFounders] = useState<Founder[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFounder, setEditingFounder] = useState<Founder | null>(null);

  // Form
  const [name, setName] = useState('');
  const [vision, setVision] = useState('');
  const [biography, setBiography] = useState('');
  const [imagePath, setImagePath] = useState('');
  const [isPrimary, setIsPrimary] = useState(true);
  const [isPublished, setIsPublished] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Founder | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchFounders = async () => {
    setLoading(true);
    try {
      const data = await founderService.getAllFounders();
      setFounders(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load founders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFounders();
  }, []);

  const openCreateModal = () => {
    setEditingFounder(null);
    setName('');
    setVision('');
    setBiography('');
    setImagePath('https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80');
    setIsPrimary(founders.length === 0);
    setIsPublished(true);
    setIsModalOpen(true);
  };

  const openEditModal = (f: Founder) => {
    setEditingFounder(f);
    setName(f.name);
    setVision(f.vision);
    setBiography(f.biography || '');
    setImagePath(f.image_path);
    setIsPrimary(f.is_primary);
    setIsPublished(f.is_published);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !vision.trim()) {
      toast.error('Founder name and vision statement are required');
      return;
    }
    if (!imagePath.trim()) {
      toast.error('Please upload a portrait image');
      return;
    }

    setIsSaving(true);
    try {
      if (editingFounder) {
        await founderService.updateFounder(editingFounder.id, {
          name,
          vision,
          biography: biography || null,
          image_path: imagePath,
          is_primary: isPrimary,
          is_published: isPublished,
        });
        toast.success('Founder updated successfully');
      } else {
        await founderService.createFounder({
          name,
          vision,
          biography: biography || null,
          image_path: imagePath,
          is_primary: isPrimary,
          is_published: isPublished,
          created_by: user?.id || null,
        });
        toast.success('New founder record created');
      }
      setIsModalOpen(false);
      fetchFounders();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save founder record');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePrimary = async (f: Founder) => {
    try {
      await founderService.updateFounder(f.id, { is_primary: true });
      toast.success(`${f.name} set as primary featured founder`);
      fetchFounders();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update primary founder');
    }
  };

  const handleTogglePublish = async (f: Founder) => {
    try {
      await founderService.updateFounder(f.id, { is_published: !f.is_published });
      toast.success(f.is_published ? 'Founder entry unpublished' : 'Founder entry published');
      fetchFounders();
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await founderService.deleteFounder(deleteTarget.id);
      toast.success('Founder record deleted');
      setDeleteTarget(null);
      fetchFounders();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete founder');
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
            <HeartHandshake className="w-6 h-6 text-sky-500" />
            Founder & Pastoral Leadership Management
          </h1>
          <p className="text-sm text-navy-500 mt-1">
            Maintain the church founder information, vision statements, portrait photographs and biography
          </p>
        </div>
        <Button
          variant="primary"
          onClick={openCreateModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Founder / Pastor
        </Button>
      </div>

      {loading && <TableSkeleton rows={2} />}

      {!loading && founders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {founders.map((founder) => (
            <div
              key={founder.id}
              className={`bg-white rounded-2xl border ${
                founder.is_primary ? 'border-sky-300 ring-2 ring-sky-100' : 'border-slate-200/90'
              } shadow-soft overflow-hidden flex flex-col justify-between`}
            >
              <div className="flex flex-col sm:flex-row">
                <div className="w-full sm:w-44 h-56 sm:h-auto shrink-0 bg-slate-100 relative">
                  <img
                    src={resolveImageUrl(founder.image_path, '/images/pastor.png')}
                    alt={founder.name}
                    className="w-full h-full object-cover"
                  />
                  {founder.is_primary && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-sky-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs">
                      <Star className="w-3 h-3 fill-current" />
                      Primary
                    </span>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-inter text-lg font-bold text-navy-900">
                        {founder.name}
                      </h3>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          founder.is_published
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {founder.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    <p className="text-xs italic text-navy-600 mt-1.5 line-clamp-2">
                      “{founder.vision}”
                    </p>

                    {founder.biography && (
                      <p className="text-xs text-navy-500 mt-2 line-clamp-2">
                        {founder.biography}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      {!founder.is_primary && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleTogglePrimary(founder)}
                          leftIcon={<Star className="w-3.5 h-3.5" />}
                        >
                          Make Primary
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleTogglePublish(founder)}
                        leftIcon={founder.is_published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      >
                        {founder.is_published ? 'Hide' : 'Show'}
                      </Button>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(founder)}
                        leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setDeleteTarget(founder)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFounder ? 'Edit Founder Profile' : 'Add Founder Profile'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Founder / Pastor Full Name"
            placeholder="e.g. Pastor Ezekiel.G"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Textarea
            label="Vision Statement / Motto"
            rows={2}
            placeholder="e.g. For every way that someone can be lost, we want to provide a practical way for them to be found..."
            value={vision}
            onChange={(e) => setVision(e.target.value)}
            required
          />

          <Textarea
            label="Full Biography (Optional)"
            rows={4}
            placeholder="Pastor Ezekiel has led Mizpah Ministries with unwavering dedication to the Gospel..."
            value={biography}
            onChange={(e) => setBiography(e.target.value)}
          />

          <ImageUpload
            bucket="founder-images"
            folder="portraits"
            label="Founder Portrait Image (Supabase Storage)"
            currentImageUrl={imagePath}
            onImageUploaded={(url) => setImagePath(url)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2">
              <input
                id="isPrimary"
                type="checkbox"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
                className="w-4 h-4 text-sky-500 rounded border-slate-300 focus:ring-sky-400"
              />
              <label htmlFor="isPrimary" className="text-sm font-medium text-navy-800">
                Primary Founder on Homepage
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="isPublishedFounder"
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 text-sky-500 rounded border-slate-300 focus:ring-sky-400"
              />
              <label htmlFor="isPublishedFounder" className="text-sm font-medium text-navy-800">
                Publish on Live Website
              </label>
            </div>
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
              {editingFounder ? 'Save Changes' : 'Create Profile'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Founder Entry?"
        message={`Are you sure you want to delete ${deleteTarget?.name}?`}
      />
    </div>
  );
};
