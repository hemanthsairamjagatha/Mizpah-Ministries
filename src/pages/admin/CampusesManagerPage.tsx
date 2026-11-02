import React, { useEffect, useState } from 'react';
import { campusService } from '../../services/campusService';
import type { Campus } from '../../types/database.types';
import { Button } from '../../components/common/Button';
import { Input, Textarea } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { CardSkeleton } from '../../components/common/Skeleton';
import { toast } from 'sonner';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Star,
  Eye,
  EyeOff,
  Phone,
  Mail,
  ExternalLink,
  Building,
} from 'lucide-react';

export const CampusesManagerPage: React.FC = () => {
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampus, setEditingCampus] = useState<Campus | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [campusPageName, setCampusPageName] = useState('');
  const [campusPageUrl, setCampusPageUrl] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<Campus | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCampuses = async () => {
    setLoading(true);
    try {
      const data = await campusService.getAllCampuses();
      setCampuses(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load campuses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampuses();
  }, []);

  const openCreateModal = () => {
    setEditingCampus(null);
    setName('');
    setAddress('');
    setPhone('');
    setEmail('');
    setCampusPageName('');
    setCampusPageUrl('');
    setMapUrl('');
    setIsPrimary(campuses.length === 0);
    setIsPublished(true);
    setIsModalOpen(true);
  };

  const openEditModal = (campus: Campus) => {
    setEditingCampus(campus);
    setName(campus.name || '');
    setAddress(campus.address || '');
    setPhone(campus.phone || '');
    setEmail(campus.email || '');
    setCampusPageName(campus.campus_page_name || '');
    setCampusPageUrl(campus.campus_page_url || '');
    setMapUrl(campus.map_url || '');
    setIsPrimary(!!campus.is_primary);
    setIsPublished(campus.is_published !== false);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Campus name is required');
      return;
    }
    if (!address.trim()) {
      toast.error('Office address is required');
      return;
    }

    setIsSaving(true);
    try {
      if (editingCampus) {
        await campusService.updateCampus(editingCampus.id, {
          name: name.trim(),
          address: address.trim(),
          phone: phone.trim() || null,
          email: email.trim() || null,
          campus_page_name: campusPageName.trim() || null,
          campus_page_url: campusPageUrl.trim() || null,
          map_url: mapUrl.trim() || null,
          is_primary: isPrimary,
          is_published: isPublished,
        });
        toast.success('Campus location updated successfully');
      } else {
        await campusService.createCampus({
          name: name.trim(),
          address: address.trim(),
          phone: phone.trim() || null,
          email: email.trim() || null,
          campus_page_name: campusPageName.trim() || null,
          campus_page_url: campusPageUrl.trim() || null,
          map_url: mapUrl.trim() || null,
          is_primary: isPrimary,
          is_published: isPublished,
          sort_order: campuses.length,
        });
        toast.success('New campus location created successfully');
      }
      setIsModalOpen(false);
      fetchCampuses();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save campus');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await campusService.deleteCampus(deleteTarget.id);
      toast.success('Campus location deleted');
      setDeleteTarget(null);
      fetchCampuses();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete campus');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePublish = async (campus: Campus) => {
    try {
      const newStatus = !campus.is_published;
      await campusService.togglePublish(campus.id, newStatus);
      toast.success(newStatus ? 'Campus published on website' : 'Campus set to draft');
      fetchCampuses();
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle status');
    }
  };

  const handleSetPrimary = async (campus: Campus) => {
    try {
      await campusService.setPrimaryCampus(campus.id);
      toast.success(`${campus.name} is now the primary campus`);
      fetchCampuses();
    } catch (err: any) {
      toast.error(err.message || 'Failed to set primary campus');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-sky-500" />
            <span>Campus Information Management</span>
          </h1>
          <p className="text-sm text-navy-600 mt-1">
            Configure church campus locations, office addresses, contact details, and campus page links shown on the Contact page.
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={openCreateModal}
          className="shrink-0"
        >
          Add Campus
        </Button>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      {/* Empty State */}
      {!loading && campuses.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-14 h-14 bg-sky-50 text-sky-500 rounded-full flex items-center justify-center mx-auto">
            <Building className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-navy-900">No Campuses Configured</h3>
          <p className="text-sm text-navy-600 max-w-md mx-auto">
            You haven't added any church campus locations yet. Add your main sanctuary or branch campus so visitors can view your address, phone, email, and campus details on the website.
          </p>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={openCreateModal}
          >
            Add First Campus
          </Button>
        </div>
      )}

      {/* Campuses Grid */}
      {!loading && campuses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campuses.map((campus) => (
            <div
              key={campus.id}
              className={`bg-white rounded-2xl border ${
                campus.is_primary ? 'border-sky-300 ring-2 ring-sky-100 shadow-md' : 'border-slate-200 shadow-xs'
              } p-6 flex flex-col justify-between space-y-4 transition-all`}
            >
              <div className="space-y-3">
                {/* Header row: Primary Badge & Status */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {campus.is_primary && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                        <Star className="w-3 h-3 fill-sky-500 text-sky-500" />
                        <span>Primary Campus</span>
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        campus.is_published
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {campus.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleTogglePublish(campus)}
                    title={campus.is_published ? 'Unpublish campus' : 'Publish campus'}
                    className="text-slate-400 hover:text-navy-700 p-1 transition-colors"
                  >
                    {campus.is_published ? (
                      <Eye className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </div>

                {/* Campus Name */}
                <h3 className="text-xl font-bold text-navy-900 leading-snug">
                  {campus.name}
                </h3>

                {/* Campus Details */}
                <div className="space-y-2 text-xs sm:text-sm text-navy-700 pt-1 border-t border-slate-100">
                  <div className="flex items-start gap-2 pt-2">
                    <MapPin className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                    <span className="leading-relaxed whitespace-pre-line">{campus.address}</span>
                  </div>

                  {campus.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-sky-500 shrink-0" />
                      <a href={`tel:${campus.phone}`} className="hover:underline text-navy-800">
                        {campus.phone}
                      </a>
                    </div>
                  )}

                  {campus.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-sky-500 shrink-0" />
                      <a href={`mailto:${campus.email}`} className="hover:underline text-navy-800 truncate">
                        {campus.email}
                      </a>
                    </div>
                  )}

                  {campus.map_url && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                      <a
                        href={campus.map_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-sky-600 hover:underline inline-flex items-center gap-1 truncate"
                      >
                        <span>View Map Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {campus.campus_page_name && (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-sky-500 shrink-0" />
                      <span className="font-medium text-sky-600">
                        {campus.campus_page_name} {campus.campus_page_url ? `(${campus.campus_page_url})` : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {!campus.is_primary ? (
                  <button
                    onClick={() => handleSetPrimary(campus)}
                    className="text-xs font-semibold text-slate-500 hover:text-sky-600 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Star className="w-3.5 h-3.5" />
                    <span>Make Primary</span>
                  </button>
                ) : (
                  <span className="text-xs text-sky-600 font-semibold">Current Main</span>
                )}

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                    onClick={() => openEditModal(campus)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                    onClick={() => setDeleteTarget(campus)}
                    className="hover:bg-rose-50 hover:text-rose-600 text-rose-500"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCampus ? 'Edit Campus Location' : 'Add New Campus Location'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          {/* Campus Name */}
          <Input
            label="Campus Name *"
            placeholder="e.g. Mizpah Ministries Nellore or Main Campus"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          {/* Office Address */}
          <Textarea
            label="Office Address *"
            placeholder="e.g. 123 Sanctuary Way, Nellore, Andhra Pradesh 524001, India"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            required
            helperText="Enter full address. This is displayed multiline under Office Address on the Contact page."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone */}
            <Input
              label="Contact Phone"
              placeholder="e.g. +91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            {/* Email */}
            <Input
              label="Contact Email"
              type="email"
              placeholder="e.g. info@mizpahministriesindia.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Input
            label="Google Maps Location URL (Redirect Link)"
            placeholder="e.g. https://maps.app.goo.gl/... or https://maps.google.com/?q=..."
            value={mapUrl}
            onChange={(e) => setMapUrl(e.target.value)}
            helperText="When visitors click on this campus address or location on the website, they will be redirected to this Google Maps link."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Campus Page Name */}
            <Input
              label="Campus Page Link Name"
              placeholder="e.g. Nellore or Visit Campus"
              value={campusPageName}
              onChange={(e) => setCampusPageName(e.target.value)}
              helperText="Label shown next to arrow link"
            />

            {/* Campus Page URL */}
            <Input
              label="Campus Page URL"
              placeholder="e.g. /#home or https://..."
              value={campusPageUrl}
              onChange={(e) => setCampusPageUrl(e.target.value)}
              helperText="Destination link when clicked"
            />
          </div>

          {/* Options */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-4 justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-navy-800">
              <input
                type="checkbox"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
              />
              <span>Set as Primary / Main Campus</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-sm text-navy-800">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
              />
              <span>Published / Visible on website</span>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : editingCampus ? 'Update Campus' : 'Create Campus'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Campus Location"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This campus will be permanently removed from your website.`}
        confirmLabel="Delete Campus"
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
        isLoading={isDeleting}
        isDestructive={true}
      />
    </div>
  );
};
