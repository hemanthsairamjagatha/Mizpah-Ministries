import React, { useEffect, useState } from 'react';
import { aboutGodService } from '../../services/aboutGodService';
import type { AboutGodCard } from '../../types/database.types';
import { Button } from '../../components/common/Button';
import { Input, Textarea } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ImageUpload } from '../../components/common/ImageUpload';
import { TableSkeleton } from '../../components/common/Skeleton';
import { resolveImageUrl } from '../../lib/utils';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Eye, EyeOff, Church, BookOpen } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const AboutGodManagerPage: React.FC = () => {
  const { user } = useAuth();
  const [cards, setCards] = useState<AboutGodCard[]>([]);
  const [loading, setLoading] = useState(true);

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<AboutGodCard | null>(null);

  // Fields
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [imagePath, setImagePath] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [sortOrder, setSortOrder] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<AboutGodCard | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // View Modal
  const [viewingCard, setViewingCard] = useState<AboutGodCard | null>(null);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const data = await aboutGodService.getAllAboutGodCards();
      setCards(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch cards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const openCreateModal = () => {
    setEditingCard(null);
    setTitle('');
    setShortDescription('');
    setFullDescription('');
    setImagePath('https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=800&q=80');
    setIsPublished(true);
    setSortOrder(cards.length + 1);
    setIsModalOpen(true);
  };

  const openEditModal = (card: AboutGodCard) => {
    setEditingCard(card);
    setTitle(card.title);
    setShortDescription(card.short_description);
    setFullDescription(card.full_description);
    setImagePath(card.image_path);
    setIsPublished(card.is_published);
    setSortOrder(card.sort_order);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !shortDescription.trim() || !fullDescription.trim()) {
      toast.error('Title, short description, and full description are required');
      return;
    }
    if (!imagePath.trim()) {
      toast.error('Please upload an image for this card');
      return;
    }

    setIsSaving(true);
    try {
      if (editingCard) {
        await aboutGodService.updateAboutGodCard(editingCard.id, {
          title,
          short_description: shortDescription,
          full_description: fullDescription,
          image_path: imagePath,
          is_published: isPublished,
          sort_order: sortOrder,
        });
        toast.success('Card updated successfully');
      } else {
        await aboutGodService.createAboutGodCard({
          title,
          short_description: shortDescription,
          full_description: fullDescription,
          image_path: imagePath,
          is_published: isPublished,
          sort_order: sortOrder,
          created_by: user?.id || null,
        });
        toast.success('Card created successfully');
      }
      setIsModalOpen(false);
      fetchCards();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save card');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async (card: AboutGodCard) => {
    try {
      await aboutGodService.updateAboutGodCard(card.id, {
        is_published: !card.is_published,
      });
      toast.success(card.is_published ? 'Card unpublished' : 'Card published');
      fetchCards();
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await aboutGodService.deleteAboutGodCard(deleteTarget.id);
      toast.success('Card deleted');
      setDeleteTarget(null);
      fetchCards();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete card');
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
            <Church className="w-6 h-6 text-sky-500" />
            "About God" Cards Management
          </h1>
          <p className="text-sm text-navy-500 mt-1">
            Manage the theological information cards displayed on the public home page
          </p>
        </div>
        <Button
          variant="primary"
          onClick={openCreateModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Faith Card
        </Button>
      </div>

      {loading && <TableSkeleton rows={3} />}

      {/* Grid of Cards */}
      {!loading && cards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-soft overflow-hidden flex flex-col justify-between"
            >
              <div className="relative h-44 w-full bg-slate-100">
                <img
                  src={resolveImageUrl(card.image_path)}
                  alt={card.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      card.is_published
                        ? 'bg-emerald-500/90 text-white'
                        : 'bg-amber-500/90 text-white'
                    }`}
                  >
                    {card.is_published ? 'Published' : 'Draft'}
                  </span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-navy-950/70 text-slate-200">
                    Order: #{card.sort_order}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-inter text-lg font-bold text-navy-900 line-clamp-1">
                    {card.title}
                  </h3>
                  <p className="text-xs text-navy-600 line-clamp-2 mt-1">
                    {card.short_description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setViewingCard(card)}
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleTogglePublish(card)}
                      leftIcon={card.is_published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    >
                      {card.is_published ? 'Hide' : 'Show'}
                    </Button>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(card)}
                      leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setDeleteTarget(card)}
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
      {!loading && cards.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-navy-800">No About God Cards Found</h3>
          <p className="text-sm text-navy-500 mt-1 mb-6">
            Create cards describing God the Father, Jesus Christ, and the Holy Spirit.
          </p>
          <Button variant="primary" onClick={openCreateModal}>
            Create First Card
          </Button>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCard ? 'Edit About God Card' : 'Create New About God Card'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Card Title"
            placeholder="e.g. God the Father"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Input
            label="Short Summary (shown on card)"
            placeholder="e.g. The Almighty Creator whose providence guides our lives."
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            required
          />

          <Textarea
            label="Full Description (shown in read more popup)"
            rows={5}
            placeholder="We believe in one God eternally existing in three persons..."
            value={fullDescription}
            onChange={(e) => setFullDescription(e.target.value)}
            required
          />

          <ImageUpload
            bucket="about-images"
            folder="cards"
            label="Card Image (Supabase Storage)"
            currentImageUrl={imagePath}
            onImageUploaded={(url) => setImagePath(url)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <Input
              label="Sort Order"
              type="number"
              min={1}
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value) || 1)}
            />

            <div className="pt-5 flex items-center gap-2">
              <input
                id="isPublishedCard"
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 text-sky-500 rounded border-slate-300 focus:ring-sky-400"
              />
              <label htmlFor="isPublishedCard" className="text-sm font-medium text-navy-800">
                Published on live site
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
              {editingCard ? 'Save Changes' : 'Create Card'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Full Modal */}
      <Modal
        isOpen={!!viewingCard}
        onClose={() => setViewingCard(null)}
        title={viewingCard?.title}
        maxWidth="lg"
      >
        {viewingCard && (
          <div className="space-y-4">
            <div className="max-h-72 w-full rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center">
              <img
                src={resolveImageUrl(viewingCard.image_path)}
                alt={viewingCard.title}
                className="w-full h-auto max-h-72 object-contain"
              />
            </div>
            <p className="text-sm italic font-medium text-sky-600">
              {viewingCard.short_description}
            </p>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-navy-700 leading-relaxed whitespace-pre-line">
              {viewingCard.full_description}
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setViewingCard(null)}>
                Close
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
        title="Delete Card?"
        message={`Are you sure you want to permanently delete the card "${deleteTarget?.title}"?`}
      />
    </div>
  );
};
