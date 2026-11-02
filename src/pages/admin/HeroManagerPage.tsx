import React, { useEffect, useState } from 'react';
import { heroService } from '../../services/heroService';
import type { HeroSection } from '../../types/database.types';
import { Button } from '../../components/common/Button';
import { Input, Textarea } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ImageUpload } from '../../components/common/ImageUpload';
import { TableSkeleton } from '../../components/common/Skeleton';
import { resolveImageUrl } from '../../lib/utils';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Eye, EyeOff, Sparkles, ExternalLink } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const HeroManagerPage: React.FC = () => {
  const { user } = useAuth();
  const [slides, setSlides] = useState<HeroSection[]>([]);
  const [loading, setLoading] = useState(true);

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSection | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imagePath, setImagePath] = useState('');
  const [buttonText, setButtonText] = useState('Watch Sermons');
  const [buttonUrl, setButtonUrl] = useState('#sermons');
  const [isPublished, setIsPublished] = useState(true);
  const [sortOrder, setSortOrder] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<HeroSection | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Preview state
  const [previewSlide, setPreviewSlide] = useState<HeroSection | null>(null);

  const fetchSlides = async () => {
    setLoading(true);
    try {
      const data = await heroService.getAllHeroSections();
      setSlides(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load hero slides');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const openCreateModal = () => {
    setEditingSlide(null);
    setTitle('');
    setDescription('');
    setImagePath('https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1920&q=80');
    setButtonText('Watch Sermons');
    setButtonUrl('#sermons');
    setIsPublished(true);
    setSortOrder(slides.length + 1);
    setIsModalOpen(true);
  };

  const openEditModal = (slide: HeroSection) => {
    setEditingSlide(slide);
    setTitle(slide.title);
    setDescription(slide.description);
    setImagePath(slide.image_path);
    setButtonText(slide.button_text || '');
    setButtonUrl(slide.button_url || '');
    setIsPublished(slide.is_published);
    setSortOrder(slide.sort_order);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Title and description are required');
      return;
    }
    if (!imagePath.trim()) {
      toast.error('Please upload or provide an image');
      return;
    }

    setIsSaving(true);
    try {
      if (editingSlide) {
        await heroService.updateHeroSection(editingSlide.id, {
          title,
          description,
          image_path: imagePath,
          button_text: buttonText || null,
          button_url: buttonUrl || null,
          is_published: isPublished,
          sort_order: sortOrder,
        });
        toast.success('Hero slide updated successfully');
      } else {
        await heroService.createHeroSection({
          title,
          description,
          image_path: imagePath,
          button_text: buttonText || null,
          button_url: buttonUrl || null,
          is_published: isPublished,
          sort_order: sortOrder,
          created_by: user?.id || null,
        });
        toast.success('New hero slide created successfully');
      }
      setIsModalOpen(false);
      fetchSlides();
    } catch (err: any) {
      console.error('Failed to save hero slide:', err);
      if (err.message?.includes('row-level security') || err.message?.includes('JWT') || err.code === '42501') {
        toast.error('Admin session expired or unauthenticated. Please re-login at /admin/login to publish.');
      } else {
        toast.error(err.message || 'Failed to save hero slide');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async (slide: HeroSection) => {
    try {
      await heroService.updateHeroSection(slide.id, {
        is_published: !slide.is_published,
      });
      toast.success(slide.is_published ? 'Slide unpublished' : 'Slide published');
      fetchSlides();
    } catch (err: any) {
      console.error('Failed to update publishing status:', err);
      if (err.message?.includes('row-level security') || err.message?.includes('JWT') || err.code === '42501') {
        toast.error('Admin session expired or unauthenticated. Please re-login to publish.');
      } else {
        toast.error(err.message || 'Failed to update publishing status');
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await heroService.deleteHeroSection(deleteTarget.id);
      toast.success('Hero slide deleted');
      setDeleteTarget(null);
      fetchSlides();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete slide');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="font-inter text-2xl font-bold text-navy-900 flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-sky-500" />
            Hero Slides Management
          </h1>
          <p className="text-sm text-navy-500 mt-1">
            Create, edit, reorder, preview and publish homepage hero slides and background photos
          </p>
        </div>
        <Button
          variant="primary"
          onClick={openCreateModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Hero Slide
        </Button>
      </div>

      {/* Loading state */}
      {loading && <TableSkeleton rows={3} />}

      {/* Slides Cards List */}
      {!loading && slides.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-soft overflow-hidden flex flex-col justify-between"
            >
              <div className="relative h-48 w-full bg-slate-900">
                <img
                  src={resolveImageUrl(slide.image_path)}
                  alt={slide.title}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-xs ${
                      slide.is_published
                        ? 'bg-emerald-500/90 text-white'
                        : 'bg-amber-500/90 text-white'
                    }`}
                  >
                    {slide.is_published ? 'Published' : 'Draft / Unpublished'}
                  </span>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-navy-950/70 text-slate-200 backdrop-blur-xs">
                    Order: #{slide.sort_order}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-inter text-lg font-bold text-navy-900 line-clamp-1">
                    {slide.title}
                  </h3>
                  <p className="text-xs text-navy-600 line-clamp-2 mt-1">
                    {slide.description}
                  </p>
                </div>

                {slide.button_text && (
                  <div className="text-xs text-sky-600 font-medium flex items-center gap-1">
                    <span>Button: "{slide.button_text}" → {slide.button_url}</span>
                  </div>
                )}

                {/* Actions Bar */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setPreviewSlide(slide)}
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                    >
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleTogglePublish(slide)}
                      leftIcon={slide.is_published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    >
                      {slide.is_published ? 'Unpublish' : 'Publish'}
                    </Button>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(slide)}
                      leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setDeleteTarget(slide)}
                      title="Delete Slide"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && slides.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-navy-800">No Hero Slides Yet</h3>
          <p className="text-sm text-navy-500 mt-1 mb-6">
            Create your first hero slide to customize the website's main welcoming header.
          </p>
          <Button variant="primary" onClick={openCreateModal}>
            Add First Slide
          </Button>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSlide ? 'Edit Hero Slide' : 'Create New Hero Slide'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Slide Headline"
            placeholder="e.g. Walking Together in Grace & Truth"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Textarea
            label="Description / Subtitle"
            rows={3}
            placeholder="Experience heartfelt worship, genuine fellowship..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          {/* Supabase Storage Image Upload */}
          <ImageUpload
            bucket="site-assets"
            folder="hero"
            label="Hero Background Photo (Supabase Storage)"
            currentImageUrl={imagePath}
            onImageUploaded={(url) => setImagePath(url)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="CTA Button Text"
              placeholder="e.g. Watch Sermons"
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value)}
            />
            <Input
              label="CTA Button Link"
              placeholder="e.g. #sermons or https://..."
              value={buttonUrl}
              onChange={(e) => setButtonUrl(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <Input
              label="Display Order (Sort Order)"
              type="number"
              min={1}
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value) || 1)}
            />

            <div className="pt-5 flex items-center gap-2">
              <input
                id="isPublished"
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 text-sky-500 rounded border-slate-300 focus:ring-sky-400"
              />
              <label htmlFor="isPublished" className="text-sm font-medium text-navy-800">
                Publish immediately on public site
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
              {editingSlide ? 'Save Changes' : 'Create Slide'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={!!previewSlide}
        onClose={() => setPreviewSlide(null)}
        title="Hero Slide Preview"
        maxWidth="2xl"
      >
        {previewSlide && (
          <div className="space-y-4">
            <div className="relative h-72 sm:h-80 w-full rounded-xl overflow-hidden bg-navy-950 flex items-center justify-center text-center p-6 text-white">
              <img
                src={resolveImageUrl(previewSlide.image_path)}
                alt={previewSlide.title}
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />
              <div className="relative z-10 space-y-3 max-w-lg">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-300 px-2.5 py-1 bg-white/10 rounded-full">
                  Preview Mode
                </span>
                <h3 className="font-inter text-2xl sm:text-3xl font-bold">
                  {previewSlide.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-200">
                  {previewSlide.description}
                </p>
                {previewSlide.button_text && (
                  <div className="pt-2">
                    <Button variant="primary" size="sm">
                      {previewSlide.button_text}
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setPreviewSlide(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Hero Slide?"
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"? This cannot be undone.`}
      />
    </div>
  );
};
