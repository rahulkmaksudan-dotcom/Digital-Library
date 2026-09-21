import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileText,
  Download,
  Filter,
  Search,
  Upload,
  GraduationCap,
  BookmarkCheck,
  Award,
  Layers,
  Calendar,
  Building,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { DigitalResource, ResourceType } from '../../types';
import { resourceService } from '../../api';
import { Pagination } from '../../components/Pagination';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Modal } from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const DigitalResourcesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [resources, setResources] = useState<DigitalResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Filter params
  const activeTab = searchParams.get('tab') || 'ALL'; // ALL, NOTES, SYLLABUS, QUESTION_PAPER, LAB_MANUAL, STUDY_MATERIAL
  const department = searchParams.get('department') || '';
  const semester = searchParams.get('semester') ? Number(searchParams.get('semester')) : undefined;
  const query = searchParams.get('query') || '';
  const page = searchParams.get('page') ? Number(searchParams.get('page')) : 0;
  const pageSize = 12;

  const [searchInput, setSearchInput] = useState(query);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Upload Form State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadDepartment, setUploadDepartment] = useState('Computer Engineering');
  const [uploadSubject, setUploadSubject] = useState('');
  const [uploadSemester, setUploadSemester] = useState(3);
  const [uploadType, setUploadType] = useState<ResourceType>('NOTES');

  const { isAuthenticated, user } = useAuth();
  const { success, error, info } = useToast();

  const departmentsList = [
    'Computer Engineering',
    'Information Technology',
    'AI & ML',
    'Electronics',
    'Mechanical',
    'Civil',
  ];

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        const resType = activeTab === 'ALL' ? undefined : activeTab;
        const res = await resourceService.getPublicResources({
          resourceType: resType,
          department: department || undefined,
          semester: semester || undefined,
          query: query || undefined,
          page,
          size: pageSize,
        });

        setResources(res.content);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);
      } catch (err) {
        console.error('Error fetching resources:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [activeTab, department, semester, query, page]);

  const updateFilters = (newParams: Record<string, string | null>) => {
    const current = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([k, v]) => {
      if (v === null || v === '') {
        current.delete(k);
      } else {
        current.set(k, v);
      }
    });
    if (!newParams.page) {
      current.set('page', '0');
    }
    setSearchParams(current);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ query: searchInput.trim() || null });
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      error('Please select a file to upload');
      return;
    }
    if (!uploadTitle.trim()) {
      error('Title is required');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', uploadTitle.trim());
      formData.append('description', uploadDescription.trim());
      formData.append('department', uploadDepartment);
      formData.append('subject', uploadSubject.trim());
      formData.append('semester', String(uploadSemester));
      formData.append('resourceType', uploadType);
      formData.append('category', uploadDepartment);
      formData.append('academicYear', '2025-2026');

      await resourceService.uploadResource(formData);
      success('Material uploaded successfully! It will appear publicly once approved by library staff.');
      setUploadModalOpen(false);
      setUploadFile(null);
      setUploadTitle('');
      setUploadDescription('');
      setUploadSubject('');
    } catch (err: any) {
      error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const tabs: { key: string; label: string; icon: any }[] = [
    { key: 'ALL', label: 'All Resources', icon: Layers },
    { key: 'NOTES', label: 'Lecture Notes', icon: FileText },
    { key: 'SYLLABUS', label: 'Syllabus & Schemes', icon: GraduationCap },
    { key: 'QUESTION_PAPER', label: 'Question Papers', icon: BookmarkCheck },
    { key: 'LAB_MANUAL', label: 'Lab Manuals', icon: Award },
    { key: 'STUDY_MATERIAL', label: 'Study Material', icon: FileText },
  ];

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'PDF';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-dps-600 bg-dps-50 px-2.5 py-1 rounded-md">
            Digital Knowledge Repository
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
            Academic Resources & Courseware
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse verified academic resources across engineering departments at Thakur Shree DPS College.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (!isAuthenticated) {
                info('Please sign in to upload resources');
              } else {
                setUploadModalOpen(true);
              }
            }}
            className="px-4 py-2.5 bg-dps-600 hover:bg-dps-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-dps-600/30 transition flex items-center gap-2 flex-shrink-0"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Resource</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200/80 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => updateFilters({ tab: tab.key === 'ALL' ? null : tab.key })}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                isActive
                  ? 'bg-dps-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm mb-8 flex flex-wrap items-center justify-between gap-4 text-xs">
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-sm relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by subject, topic or title..."
            className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-dps-500/20"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Department Filter */}
          <select
            value={department}
            onChange={(e) => updateFilters({ department: e.target.value || null })}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="">All Departments</option>
            {departmentsList.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Semester Filter */}
          <select
            value={semester || ''}
            onChange={(e) => updateFilters({ semester: e.target.value || null })}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>

          {(department || semester || query) && (
            <button
              onClick={() => {
                setSearchInput('');
                setSearchParams(new URLSearchParams(activeTab !== 'ALL' ? { tab: activeTab } : {}));
              }}
              className="text-slate-500 hover:text-rose-600 font-medium px-2 py-1 transition"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Resources Grid */}
      {loading ? (
        <LoadingSpinner size="lg" text="Loading academic resources..." />
      ) : resources.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No digital resources available"
          description="There are currently no approved resources matching your selected criteria. Try changing the department or semester filter."
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((res) => (
              <div
                key={res.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-dps-50 text-dps-700 rounded-md">
                      {res.resourceType.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Sem {res.semester || 'All'}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 leading-snug group-hover:text-dps-600 transition">
                    {res.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                    {res.description || 'Academic curriculum reference material.'}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 font-medium text-slate-600">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>{res.department}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <span>{res.subject}</span>
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Download className="w-3 h-3 text-slate-400" />
                    <span>{res.downloadsCount} downloads ({formatFileSize(res.fileSize)})</span>
                  </div>

                  <a
                    href={resourceService.getDownloadUrl(res.fileName)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-dps-50 hover:bg-dps-100 text-dps-700 font-semibold text-xs rounded-xl transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={pageSize}
            onPageChange={(p) => updateFilters({ page: String(p) })}
          />
        </div>
      )}

      {/* Upload Resource Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Academic Resource"
        subtitle="Contribute verified study materials, lecture notes or lab manuals"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select File (PDF, DOCX, PPTX - Max 25MB) *</label>
            <input
              type="file"
              required
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-dps-50 file:text-dps-700 hover:file:bg-dps-100 cursor-pointer border border-slate-200 rounded-xl p-2"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Resource Title *</label>
            <input
              type="text"
              required
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              placeholder="e.g. Data Structures & Algorithms Handout 2026"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dps-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Resource Type *</label>
              <select
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value as ResourceType)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
              >
                <option value="NOTES">Lecture Notes</option>
                <option value="SYLLABUS">Syllabus</option>
                <option value="QUESTION_PAPER">Question Paper</option>
                <option value="LAB_MANUAL">Lab Manual</option>
                <option value="STUDY_MATERIAL">Study Material</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department *</label>
              <select
                value={uploadDepartment}
                onChange={(e) => setUploadDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
              >
                {departmentsList.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject Name *</label>
              <input
                type="text"
                required
                value={uploadSubject}
                onChange={(e) => setUploadSubject(e.target.value)}
                placeholder="e.g. Operating Systems"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Semester *</label>
              <select
                value={uploadSemester}
                onChange={(e) => setUploadSemester(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              placeholder="Brief summary of syllabus units, author, or experiment scope..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none resize-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setUploadModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-5 py-2 bg-dps-600 hover:bg-dps-700 text-white font-bold rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Submit Resource'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

