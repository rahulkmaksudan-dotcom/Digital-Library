import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Globe, BookOpen } from 'lucide-react';
import { authorService } from '../../api';
import { Author } from '../../types';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useToast } from '../../context/ToastContext';

export const AdminAuthors: React.FC = () => {
  const { showToast } = useToast();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    biography: '',
    photoUrl: '',
    website: '',
  });

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    setLoading(true);
    try {
      const data = await authorService.getAll();
      setAuthors(data);
    } catch (err: any) {
      showToast('Failed to load authors', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setSelectedAuthor(null);
    setFormData({ name: '', biography: '', photoUrl: '', website: '' });
    setModalOpen(true);
  };

  const openEditModal = (a: Author) => {
    setIsEditing(true);
    setSelectedAuthor(a);
    setFormData({
      name: a.name,
      biography: a.biography || '',
      photoUrl: a.photoUrl || '',
      website: a.website || '',
    });
    setModalOpen(true);
  };

  const handleSaveAuthor = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing && selectedAuthor) {
        await authorService.update(selectedAuthor.id, formData);
        showToast('Author details updated successfully', 'success');
      } else {
        await authorService.create(formData);
        showToast('New academic textbook author registered', 'success');
      }
      setModalOpen(false);
      fetchAuthors();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to save author', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAuthor = async () => {
    if (!selectedAuthor) return;
    setSubmitting(true);
    try {
      await authorService.delete(selectedAuthor.id);
      showToast('Author profile removed', 'info');
      setDeleteModalOpen(false);
      setSelectedAuthor(null);
      fetchAuthors();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete author', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Curriculum Authors Directory ({authors.length})
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Registered engineering textbook authors, university professors, and researchers.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-dps-600 hover:bg-dps-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Register Author</span>
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 flex justify-center">
          <LoadingSpinner size="lg" text="Loading author profiles..." />
        </div>
      ) : authors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12">
          <EmptyState
            title="No authors found"
            description="Register textbook authors to link them with catalog books."
            actionText="Add Author"
            onAction={openCreateModal}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {authors.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-dps-300 transition space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-black flex items-center justify-center">
                    {a.name.charAt(0)}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(a)}
                      className="p-1.5 text-slate-400 hover:text-dps-600 hover:bg-slate-100 rounded-lg transition"
                      title="Edit Author"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAuthor(a);
                        setDeleteModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Author"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-3">{a.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-3">
                  {a.biography || 'Distinguished academic author in engineering and computer science.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Author ID: #{a.id}</span>
                {a.website && (
                  <a
                    href={a.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-dps-600 hover:underline flex items-center gap-1"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Website</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Author Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit Author Profile' : 'Register New Textbook Author'}
        maxWidth="sm"
      >
        <form onSubmit={handleSaveAuthor} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Author Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dr. B. S. Grewal"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-dps-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Academic Biography / Affiliation
            </label>
            <textarea
              rows={3}
              placeholder="Professor of Mathematics, IIT Delhi..."
              value={formData.biography}
              onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-dps-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Author Website / Scholar Profile (Optional)
            </label>
            <input
              type="url"
              placeholder="https://scholar.google.com/..."
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-dps-500"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-dps-600 hover:bg-dps-700 rounded-xl shadow-xs"
            >
              {submitting ? 'Saving...' : isEditing ? 'Update Author' : 'Register Author'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Delete Author Profile"
        message={`Are you sure you want to remove author "${selectedAuthor?.name}"? Existing catalog books linked to this author will remain preserved.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        type="danger"
        loading={submitting}
        onConfirm={handleDeleteAuthor}
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelectedAuthor(null);
        }}
      />
    </div>
  );
};

