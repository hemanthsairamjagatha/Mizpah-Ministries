import React, { useEffect, useState } from 'react';
import { aboutGodService } from '../../services/aboutGodService';
import type { GospelText } from '../../types/database.types';
import { Button } from '../../components/common/Button';
import { Input, Textarea } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { TableSkeleton } from '../../components/common/Skeleton';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Eye, EyeOff, BookOpen, FileText } from 'lucide-react';

export const AboutGodManagerPage: React.FC = () => {
  // Gospel Cards state (Cards of "The Gospel")
  const [cards, setCards] = useState<GospelText[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<GospelText | null>(null);
  const [scripture, setScripture] = useState('');
  const [priority, setPriority] = useState<number>(1);
  const [isPublished, setIsPublished] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GospelText | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Gospel Cards
  const fetchCards = async () => {
    setLoading(true);
    try {
      const data = await aboutGodService.getAllGospelTexts();
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

  // ---------------- Handlers (Only Card Content - No Heading/Sub-label inputs) ----------------
  const openCreateModal = () => {
    setEditingCard(null);
    setScripture(
      'Isaiah 9:6. For unto us a child is born, unto us a son is given: and the government shall be upon his shoulder: and his name shall be called Wonderful, Counsellor, The mighty God, The everlasting Father, The Prince of Peace.'
    );
    setPriority(cards.length + 1);
    setIsPublished(true);
    setIsModalOpen(true);
  };

  const openEditModal = (card: GospelText) => {
    setEditingCard(card);
    setScripture(card.scripture);
    setPriority(card.priority ?? 1);
    setIsPublished(card.is_published);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanScripture = scripture.replace(/^Text\s*:\s*/i, '').trim();
    if (!cleanScripture) {
      toast.error('Card text is required');
      return;
    }

    setIsSaving(true);
    try {
      if (editingCard) {
        await aboutGodService.updateGospelText(editingCard.id, {
          heading: 'The Gospel',
          label: 'Text :',
          scripture: cleanScripture,
          priority: Number(priority) || 1,
          is_published: isPublished,
        });
        toast.success('Card updated successfully');
      } else {
        await aboutGodService.createGospelText({
          heading: 'The Gospel',
          label: 'Text :',
          scripture: cleanScripture,
          priority: Number(priority) || 1,
          is_published: isPublished,
        });
        toast.success('Card added successfully');
      }
      setIsModalOpen(false);
      fetchCards();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save card');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async (card: GospelText) => {
    try {
      await aboutGodService.updateGospelText(card.id, {
        is_published: !card.is_published,
      });
      toast.success(
        card.is_published ? 'Card hidden from live site' : 'Card published to live site'
      );
      fetchCards();
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await aboutGodService.deleteGospelText(deleteTarget.id);
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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="font-inter text-2xl font-bold text-navy-900 flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-sky-500" />
            "The Gospel" Cards
          </h1>
          <p className="text-sm text-navy-500 mt-1">
            Manage the cards displayed under "The Gospel" on the live website. Each card contains a scripture text.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={openCreateModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Card
        </Button>
      </div>

      {/* Info Notice Banner */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-sky-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-600" />
            Section: The Gospel &nbsp;•&nbsp; Sub-heading: Text :
          </h3>
          <p className="text-xs text-sky-700 mt-0.5">
            The section title "The Gospel" and "Text :" are automatically shown on the website. You only need to add and edit the cards below.
          </p>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && <TableSkeleton rows={2} />}

      {/* List of Cards */}
      {!loading && cards.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {cards.map((card, index) => (
            <div
              key={card.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-soft p-6 flex flex-col justify-between space-y-4 hover:border-sky-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-sm font-bold text-navy-900">Card #{index + 1}</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                    Priority: #{card.priority ?? (index + 1)}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      card.is_published
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {card.is_published ? 'Published on live site' : 'Draft / Hidden'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleTogglePublish(card)}
                    leftIcon={
                      card.is_published ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )
                    }
                  >
                    {card.is_published ? 'Hide' : 'Show'}
                  </Button>
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

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                <p className="text-xs uppercase font-bold tracking-wider text-slate-500 mb-1.5">
                  Card Text / Scripture Passage
                </p>
                <p
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: '16px' }}
                  className="font-inter text-[16px] font-semibold text-slate-800 leading-relaxed"
                >
                  "{card.scripture}"
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && cards.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-navy-800">No Cards Found</h3>
          <p className="text-sm text-navy-500 mt-1 mb-6">
            Add a scripture card for "The Gospel" section.
          </p>
          <Button variant="primary" onClick={openCreateModal}>
            Add First Card
          </Button>
        </div>
      )}

      {/* Add / Edit Card Modal - ONLY asks for Card Text and Published toggle */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCard ? 'Edit Gospel Card' : 'Add Gospel Card'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Priority Number"
            type="number"
            min={1}
            value={priority}
            onChange={(e) => setPriority(parseInt(e.target.value) || 1)}
            helperText="Determines display order on the website (e.g. 1 appears first, then 2, 3)."
            required
          />

          <Textarea
            label="Scripture Verse / Card Text"
            rows={6}
            placeholder="e.g. Isaiah 9:6. For unto us a child is born, unto us a son is given: and the government shall be upon his shoulder: and his name shall be called Wonderful, Counsellor, The mighty God, The everlasting Father, The Prince of Peace."
            value={scripture}
            onChange={(e) => setScripture(e.target.value)}
            required
            helperText="The scripture text displayed on this card under 'The Gospel' section."
          />

          <div className="pt-2 flex items-center gap-2">
            <input
              id="isPublishedCard"
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 text-sky-500 rounded border-slate-300 focus:ring-sky-400 cursor-pointer"
            />
            <label
              htmlFor="isPublishedCard"
              className="text-sm font-medium text-navy-800 cursor-pointer"
            >
              Published on live website
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
              {editingCard ? 'Save Changes' : 'Create Card'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Card Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Card?"
        message="Are you sure you want to delete this card? It will be removed from the live website."
      />
    </div>
  );
};
