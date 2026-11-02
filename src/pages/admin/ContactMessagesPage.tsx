import React, { useEffect, useState } from 'react';
import { contactService } from '../../services/contactService';
import type { ContactMessage } from '../../types/database.types';
import { Button } from '../../components/common/Button';
import { Textarea } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { TableSkeleton } from '../../components/common/Skeleton';
import { formatDate } from '../../lib/utils';
import { toast } from 'sonner';
import {
  MessageSquare,
  Search,
  Trash2,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  MailCheck,
  StickyNote,
  Send,
  Eye,
} from 'lucide-react';

export const ContactMessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected message for details/notes modal
  const [activeMessage, setActiveMessage] = useState<ContactMessage | null>(null);
  const [internalNotes, setInternalNotes] = useState('');
  const [isUpdatingNotes, setIsUpdatingNotes] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await contactService.getContactMessages(statusFilter, searchQuery);
      setMessages(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [statusFilter, searchQuery]);

  const openMessageModal = (msg: ContactMessage) => {
    setActiveMessage(msg);
    setInternalNotes(msg.internal_notes || '');

    // Automatically mark as read if it was unread
    if (msg.status === 'unread') {
      handleStatusChange(msg.id, 'read');
    }
  };

  const handleStatusChange = async (
    id: string,
    newStatus: 'unread' | 'read' | 'replied',
    notes?: string
  ) => {
    try {
      const updated = await contactService.updateMessageStatus(id, newStatus, notes);
      setMessages((prev) => prev.map((m) => (m.id === id ? updated : m)));
      if (activeMessage && activeMessage.id === id) {
        setActiveMessage(updated);
      }
      toast.success(`Message marked as ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update message status');
    }
  };

  const handleSaveNotes = async () => {
    if (!activeMessage) return;
    setIsUpdatingNotes(true);
    try {
      const updated = await contactService.updateMessageStatus(
        activeMessage.id,
        activeMessage.status,
        internalNotes
      );
      setMessages((prev) => prev.map((m) => (m.id === activeMessage.id ? updated : m)));
      setActiveMessage(updated);
      toast.success('Internal notes saved');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save notes');
    } finally {
      setIsUpdatingNotes(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await contactService.deleteMessage(deleteTarget.id);
      toast.success('Contact submission deleted');
      setDeleteTarget(null);
      if (activeMessage?.id === deleteTarget.id) {
        setActiveMessage(null);
      }
      fetchMessages();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete message');
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
            <MessageSquare className="w-6 h-6 text-sky-500" />
            Contact Messages & Inquiries
          </h1>
          <p className="text-sm text-navy-500 mt-1">
            Review incoming prayer requests, visitor inquiries, and follow-up with church guests
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {['all', 'unread', 'read', 'replied'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                statusFilter === st
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-slate-100 text-navy-700 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-navy-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search sender, email, or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white text-navy-900"
          />
        </div>
      </div>

      {loading && <TableSkeleton rows={5} />}

      {/* Messages Table & Mobile Cards */}
      {!loading && messages.length > 0 && (
        <>
          {/* Mobile View: Cards */}
          <div className="block lg:hidden space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => openMessageModal(msg)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                  msg.status === 'unread'
                    ? 'bg-sky-50/50 border-sky-200 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50/70'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-bold text-sm text-navy-900 block truncate">{msg.name}</span>
                    <span className="text-xs text-navy-500 block truncate">{msg.email}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                      msg.status === 'unread'
                        ? 'bg-rose-100 text-rose-700'
                        : msg.status === 'replied'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {msg.status}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-semibold text-navy-800 block line-clamp-1">{msg.subject}</span>
                  <p className="text-xs text-navy-500 line-clamp-2 mt-0.5">{msg.message}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs" onClick={(e) => e.stopPropagation()}>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(msg.created_at)}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openMessageModal(msg)}
                      leftIcon={<Eye className="w-3.5 h-3.5 text-sky-600" />}
                    >
                      Read
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setDeleteTarget(msg)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View: Full Table */}
          <div className="hidden lg:block bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-navy-800">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-navy-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Sender</th>
                  <th className="py-3.5 px-4">Subject & Message</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {messages.map((msg) => (
                  <tr
                    key={msg.id}
                    onClick={() => openMessageModal(msg)}
                    className={`cursor-pointer transition-colors ${
                      msg.status === 'unread' ? 'bg-sky-50/40 font-medium' : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div>
                        <span className="font-semibold text-navy-900 block">{msg.name}</span>
                        <span className="text-xs text-navy-500">{msg.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="max-w-md">
                        <span className="font-semibold text-navy-900 block line-clamp-1">
                          {msg.subject}
                        </span>
                        <span className="text-xs text-navy-500 block line-clamp-1 mt-0.5">
                          {msg.message}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          msg.status === 'unread'
                            ? 'bg-rose-100 text-rose-700'
                            : msg.status === 'replied'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {msg.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-xs text-navy-500">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(msg.created_at)}
                      </span>
                    </td>
                    <td
                      className="py-4 px-4 whitespace-nowrap text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openMessageModal(msg)}
                          leftIcon={<Eye className="w-3.5 h-3.5 text-sky-600" />}
                        >
                          Read
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setDeleteTarget(msg)}
                          title="Delete Message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </>
      )}

      {/* Empty State */}
      {!loading && messages.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <MailCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-navy-800">No Messages Found</h3>
          <p className="text-sm text-navy-500 mt-1">
            There are no messages matching the current filter.
          </p>
        </div>
      )}

      {/* Full Message Details & Internal Notes Modal */}
      <Modal
        isOpen={!!activeMessage}
        onClose={() => setActiveMessage(null)}
        title={activeMessage?.subject}
        maxWidth="lg"
      >
        {activeMessage && (
          <div className="space-y-6">
            {/* Sender Metadata Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <span className="text-navy-500">From:</span>
                <span className="font-semibold text-navy-900">{activeMessage.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-navy-500">Email:</span>
                <a
                  href={`mailto:${activeMessage.email}?subject=Re: ${encodeURIComponent(activeMessage.subject)}`}
                  className="font-medium text-sky-600 hover:underline flex items-center gap-1"
                >
                  <Mail className="w-3.5 h-3.5" />
                  {activeMessage.email}
                </a>
              </div>
              {activeMessage.phone && (
                <div className="flex items-center justify-between">
                  <span className="text-navy-500">Phone:</span>
                  <a
                    href={`tel:${activeMessage.phone}`}
                    className="font-medium text-navy-800 flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5 text-sky-500" />
                    {activeMessage.phone}
                  </a>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-navy-500">Received:</span>
                <span className="text-navy-700">{formatDate(activeMessage.created_at)}</span>
              </div>
            </div>

            {/* Message Body */}
            <div>
              <h4 className="text-xs font-semibold text-navy-400 uppercase tracking-wider mb-2">
                Message Content
              </h4>
              <div className="p-4 rounded-xl bg-white border border-slate-200 text-sm text-navy-800 leading-relaxed whitespace-pre-line">
                {activeMessage.message}
              </div>
            </div>

            {/* Status Selector & Direct Email Reply */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-navy-600">Mark Status:</span>
                {(['unread', 'read', 'replied'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(activeMessage.id, status, internalNotes)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md capitalize transition ${
                      activeMessage.status === status
                        ? 'bg-sky-500 text-white shadow-xs'
                        : 'bg-slate-100 text-navy-700 hover:bg-slate-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <a
                href={`mailto:${activeMessage.email}?subject=Re: ${encodeURIComponent(activeMessage.subject)}`}
                onClick={() => handleStatusChange(activeMessage.id, 'replied')}
              >
                <Button size="sm" variant="primary" leftIcon={<Send className="w-3.5 h-3.5" />}>
                  Reply via Email
                </Button>
              </a>
            </div>

            {/* Admin Internal Notes */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <label className="block text-xs font-semibold text-navy-700 flex items-center gap-1.5">
                <StickyNote className="w-3.5 h-3.5 text-amber-500" />
                <span>Admin Internal Notes (Private)</span>
              </label>
              <Textarea
                rows={3}
                placeholder="Add private pastor/elder notes regarding follow-up, pastoral visits, or prayers..."
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSaveNotes}
                  isLoading={isUpdatingNotes}
                >
                  Save Notes
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Message?"
        message={`Are you sure you want to delete message from ${deleteTarget?.name}?`}
      />
    </div>
  );
};
