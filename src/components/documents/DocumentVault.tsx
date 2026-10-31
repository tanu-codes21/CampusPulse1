'use client';

import React, { useState } from 'react';
import {
  FolderLock,
  FileText,
  Upload,
  Search,
  Download,
  Trash2,
  Eye,
  Plus,
  File,
  X,
  Tag,
  CheckCircle,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { DocumentItem, DocumentCategory } from '@/types';
import { NeoCard } from '../common/NeoCard';
import { NeoButton } from '../common/NeoButton';
import { NeoInput } from '../common/NeoInput';
import { Badge } from '../common/Badge';

export const DocumentVault: React.FC = () => {
  const { documents, addDocument, deleteDocument } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  // Form states
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<DocumentCategory>('Study Material');
  const [docTags, setDocTags] = useState('');
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: number;
    type: string;
    url: string;
  } | null>(null);

  const categories: DocumentCategory[] = [
    'Timetable',
    'Syllabus',
    'Study Material',
    'Circular',
    'Important Document',
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFile({
          name: file.name,
          size: file.size,
          type: file.type || 'application/pdf',
          url: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !selectedFile) {
      alert('Please provide a document title and select a file to upload.');
      return;
    }

    await addDocument({
      title: docTitle,
      category: docCategory,
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      fileType: selectedFile.type,
      fileUrl: selectedFile.url,
      tags: docTags ? docTags.split(',').map((t) => t.trim()) : [],
    });

    setDocTitle('');
    setDocTags('');
    setSelectedFile(null);
    setIsUploadModalOpen(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-accent-purple border border-purple-200/50">
              <FolderLock className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-neo-primary dark:text-white">
              Document Vault
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neo-secondary dark:text-neo-darkSecondary mt-1">
            Secure, organized storage for academic timetables, course syllabus, circulars, and study notes.
          </p>
        </div>

        <NeoButton
          variant="accent-purple"
          size="md"
          onClick={() => setIsUploadModalOpen(true)}
        >
          <Upload className="w-4 h-4" />
          Upload Document
        </NeoButton>
      </div>

      {/* Filter and Search Bar */}
      <NeoCard className="p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <NeoInput
              placeholder="Search vault documents by name, course code or tag..."
              icon={<Search className="w-4 h-4" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-60">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl bg-neo-bg dark:bg-neo-darkBg text-neo-primary dark:text-neo-darkPrimary border border-neo-border px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent-purple/60"
            >
              <option value="All">All Vault Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </NeoCard>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <FolderLock className="w-12 h-12 text-neo-secondary/40 mx-auto mb-3" />
            <p className="text-base font-bold text-neo-primary dark:text-white">
              No documents found
            </p>
            <p className="text-xs text-neo-secondary mt-1">
              Upload course syllabus, timetable PDFs, or formula cheat sheets to your vault.
            </p>
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <NeoCard
              key={doc.id}
              accent="purple"
              hoverEffect
              className="flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="purple">{doc.category}</Badge>
                  <span className="text-[11px] font-mono text-neo-secondary">
                    {formatFileSize(doc.fileSize)}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-accent-purple border border-purple-200/50 shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-sm text-neo-primary dark:text-white truncate">
                      {doc.title}
                    </h3>
                    <p className="text-[11px] text-neo-secondary truncate font-mono mt-0.5">
                      {doc.fileName}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                {doc.tags && doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {doc.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-neo-bg dark:bg-neo-darkBg text-neo-secondary border border-neo-border"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-neo-border/60 flex items-center justify-between text-xs">
                <span className="text-[10px] text-neo-secondary">
                  Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="p-1.5 rounded-lg text-neo-secondary hover:text-accent-purple"
                    title="Preview Document"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <a
                    href={doc.fileUrl}
                    download={doc.fileName}
                    className="p-1.5 rounded-lg text-neo-secondary hover:text-accent-purple"
                    title="Download File"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => {
                      if (confirm('Delete this document from your vault?')) {
                        deleteDocument(doc.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-neo-secondary hover:text-rose-500"
                    title="Delete Document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </NeoCard>
          ))
        )}
      </div>

      {/* UPLOAD MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleUploadSubmit}
            className="w-full max-w-lg bg-neo-card dark:bg-neo-darkCard rounded-3xl p-6 border border-neo-border shadow-neo-raised-lg space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neo-border">
              <h2 className="text-lg font-bold text-neo-primary dark:text-white">
                Upload to Document Vault
              </h2>
              <button type="button" onClick={() => setIsUploadModalOpen(false)}>
                <X className="w-5 h-5 text-neo-secondary" />
              </button>
            </div>

            <NeoInput
              label="Document Title"
              placeholder="e.g. 6th Sem B.Tech Syllabus Copy"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neo-secondary mb-1.5">
                Category
              </label>
              <select
                value={docCategory}
                onChange={(e) => setDocCategory(e.target.value as DocumentCategory)}
                className="w-full rounded-xl bg-neo-bg dark:bg-neo-darkBg text-neo-primary dark:text-neo-darkPrimary border border-neo-border px-3 py-2 text-xs font-semibold"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <NeoInput
              label="Tags (comma-separated)"
              placeholder="e.g. syllabus, cse, notes"
              value={docTags}
              onChange={(e) => setDocTags(e.target.value)}
            />

            <div className="border-2 border-dashed border-neo-border rounded-2xl p-5 text-center bg-neo-bg/50">
              {selectedFile ? (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-emerald-600 flex items-center justify-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Ready: {selectedFile.name}
                  </p>
                  <p className="text-[11px] text-neo-secondary">{formatFileSize(selectedFile.size)}</p>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-xs text-rose-500 font-bold hover:underline"
                  >
                    Select different file
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <Upload className="w-8 h-8 text-accent-purple mx-auto mb-2" />
                  <p className="text-xs font-bold text-neo-primary dark:text-white">
                    Select PDF or Document Image
                  </p>
                  <input
                    type="file"
                    accept=".pdf,image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
              )}
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-neo-border">
              <NeoButton variant="secondary" type="button" onClick={() => setIsUploadModalOpen(false)}>
                Cancel
              </NeoButton>
              <NeoButton variant="accent-purple" type="submit">
                Upload File
              </NeoButton>
            </div>
          </form>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-neo-card dark:bg-neo-darkCard rounded-3xl p-6 border border-neo-border shadow-neo-raised-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neo-border">
              <div>
                <h3 className="font-extrabold text-base text-neo-primary dark:text-white">
                  {previewDoc.title}
                </h3>
                <p className="text-xs text-neo-secondary font-mono">{previewDoc.fileName}</p>
              </div>
              <button onClick={() => setPreviewDoc(null)}>
                <X className="w-5 h-5 text-neo-secondary" />
              </button>
            </div>

            <div className="min-h-[350px] max-h-[500px] flex items-center justify-center bg-neo-bg dark:bg-neo-darkBg rounded-2xl border border-neo-border p-4 overflow-hidden">
              {previewDoc.fileType.includes('image') || previewDoc.fileUrl.startsWith('data:image') ? (
                <img
                  src={previewDoc.fileUrl}
                  alt={previewDoc.title}
                  className="max-h-[450px] object-contain rounded-xl"
                />
              ) : (
                <div className="text-center space-y-3">
                  <FileText className="w-16 h-16 text-accent-purple mx-auto" />
                  <p className="text-sm font-bold text-neo-primary dark:text-white">
                    PDF Document File Ready
                  </p>
                  <p className="text-xs text-neo-secondary max-w-md">
                    Encrypted and stored in the CampusPulse Document Vault.
                  </p>
                  <a
                    href={previewDoc.fileUrl}
                    download={previewDoc.fileName}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-purple text-white text-xs font-bold shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF File
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <NeoButton variant="secondary" onClick={() => setPreviewDoc(null)}>
                Close Preview
              </NeoButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

