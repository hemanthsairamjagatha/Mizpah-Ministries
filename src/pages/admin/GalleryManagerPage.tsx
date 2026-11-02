import React, { useEffect, useState } from 'react';
import { galleryService } from '../../services/galleryService';
import type {
  GalleryCategory,
  GalleryCollectionWithImages,
  GalleryImage,
} from '../../types/database.types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ImageUpload } from '../../components/common/ImageUpload';
import { Lightbox, type LightboxImage } from '../../components/common/Lightbox';
import { TableSkeleton } from '../../components/common/Skeleton';
import { resolveImageUrl, formatDate } from '../../lib/utils';
import { toast } from 'sonner';
import {
  Plus,
  Edit2,
  Trash2,
  Camera,
  Upload,
  Eye,
  EyeOff,
  Images,
  Layers,
  X,
  FileImage,
  Tag,
  Star,
  Loader2,
  Check,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

/**
 * Auto-scrolling collection card preview in admin panel
 */
const AdminCardImage: React.FC<{
  col: GalleryCollectionWithImages;
  count: number;
  isStarred: boolean;
}> = ({ col, count, isStarred }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const images = React.useMemo(() => {
    const list = [col.cover_image_path];
    if (col.images && col.images.length > 0) {
      for (const img of col.images) {
        list.push(img.image_path);
      }
    }
    return list;
  }, [col]);

  React.useEffect(() => {
    if (images.length <= 1 || isHovered) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % images.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [images.length, isHovered]);

  return (
    <div
      className="relative h-48 w-full bg-slate-900 overflow-hidden group select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {images.map((src, idx) => (
        <img
          key={idx}
          src={resolveImageUrl(src)}
          alt={col.title}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${
            idx === activeIdx ? 'opacity-90 scale-100 z-10' : 'opacity-0 scale-105 pointer-events-none z-0'
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent z-10 opacity-70" />

      <div className="absolute top-3 left-3 flex gap-2 z-20">
        {col.category && (
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-white/95 text-navy-800 shadow-xs">
            {col.category.name}
          </span>
        )}
      </div>

      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
        {isStarred && (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-400 text-navy-950 flex items-center gap-1 shadow-md">
            <Star className="w-3 h-3 fill-navy-950 text-navy-950" />
            Featured on Home
          </span>
        )}
        <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-navy-950/80 text-white backdrop-blur-xs flex items-center gap-1">
          <Images className="w-3.5 h-3.5 text-sky-400" />
          {images.length > 1 ? `${activeIdx + 1} / ${count} photos` : `${count} photos`}
        </span>
      </div>
    </div>
  );
};

export const GalleryManagerPage: React.FC = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [collections, setCollections] = useState<GalleryCollectionWithImages[]>([]);
  const [starredIds, setStarredIds] = useState<string[]>(() => galleryService.getStarredCollectionIds());
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Collection Create / Edit Modal
  const [isColModalOpen, setIsColModalOpen] = useState(false);
  const [editingCol, setEditingCol] = useState<GalleryCollectionWithImages | null>(null);

  // Collection Form Fields
  const [colTitle, setColTitle] = useState('');
  const [colSlug, setColSlug] = useState('');
  const [colDate, setColDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [colCategoryId, setColCategoryId] = useState('');
  const [colCoverImage, setColCoverImage] = useState('');
  const [colIsPublished, setColIsPublished] = useState(true);
  const [colIsStarred, setColIsStarred] = useState(true);
  const [colSortOrder, setColSortOrder] = useState(1);
  const [isSavingCol, setIsSavingCol] = useState(false);

  // Manage Sub-images in a Collection Modal
  const [managingCol, setManagingCol] = useState<GalleryCollectionWithImages | null>(null);
  const [isUploadingSubImages, setIsUploadingSubImages] = useState(false);
  const [managingUploadProgress, setManagingUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [isDraggingManagingPhotos, setIsDraggingManagingPhotos] = useState(false);
  const managingFileInputRef = React.useRef<HTMLInputElement>(null);

  // Card Photos inside the Create/Edit Collection Modal
  const [modalSubImages, setModalSubImages] = useState<GalleryImage[]>([]);
  const [stagedFiles, setStagedFiles] = useState<{ file: File; previewUrl: string; name: string }[]>([]);
  const [isUploadingModalPhotos, setIsUploadingModalPhotos] = useState(false);
  const [modalUploadProgress, setModalUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [isDraggingModalPhotos, setIsDraggingModalPhotos] = useState(false);
  const modalFileInputRef = React.useRef<HTMLInputElement>(null);

  // Lightbox Preview
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<LightboxImage[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Delete Collection Confirm
  const [deleteColTarget, setDeleteColTarget] = useState<GalleryCollectionWithImages | null>(null);
  const [isDeletingCol, setIsDeletingCol] = useState(false);

  // Delete Sub-image Confirm
  const [deleteImgTarget, setDeleteImgTarget] = useState<GalleryImage | null>(null);

  // Add / Manage Category Modal
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [isManageCatsModalOpen, setIsManageCatsModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [isSavingCat, setIsSavingCat] = useState(false);
  const [deleteCatTarget, setDeleteCatTarget] = useState<GalleryCategory | null>(null);
  const [isDeletingCat, setIsDeletingCat] = useState(false);

  const handleCreateCategory = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) {
      toast.error('Please enter a category name');
      return;
    }
    setIsSavingCat(true);
    try {
      const created = await galleryService.createCategory(trimmed);
      toast.success(`Category "${created.name}" created!`);
      setNewCatName('');
      setIsAddCatModalOpen(false);
      const freshCats = await galleryService.getCategories();
      setCategories(freshCats);
      setColCategoryId(created.id);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create category');
    } finally {
      setIsSavingCat(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCatTarget) return;
    setIsDeletingCat(true);
    try {
      await galleryService.deleteCategory(deleteCatTarget.id);
      toast.success(`Category "${deleteCatTarget.name}" deleted`);
      setDeleteCatTarget(null);
      const freshCats = await galleryService.getCategories();
      setCategories(freshCats);
      if (selectedCategoryFilter === deleteCatTarget.id) {
        setSelectedCategoryFilter('all');
      }
      if (colCategoryId === deleteCatTarget.id) {
        const next = freshCats.find((c) => c.slug !== 'all');
        setColCategoryId(next?.id || '');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete category');
    } finally {
      setIsDeletingCat(false);
    }
  };

  const handleSeedDefaultCategories = async () => {
    setIsSavingCat(true);
    try {
      const seeded = await galleryService.seedDefaultCategories();
      if (seeded && seeded.length > 0) {
        toast.success('Default church categories loaded!');
        setCategories(seeded);
        const nonAll = seeded.find((c) => c.slug !== 'all') || seeded[0];
        if (nonAll) setColCategoryId(nonAll.id);
      } else {
        toast.error('Could not create default categories. Please verify database permissions.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load default categories');
    } finally {
      setIsSavingCat(false);
    }
  };

  const fetchGalleryData = async () => {
    setLoading(true);
    try {
      const [cats, cols] = await Promise.all([
        galleryService.getCategories(),
        galleryService.getAllCollections(selectedCategoryFilter),
      ]);
      setCategories(cats);
      setCollections(cols);
      if (cats.length > 0 && !colCategoryId) {
        // default to first non-all category
        const first = cats.find((c) => c.slug !== 'all') || cats[0];
        setColCategoryId(first.id);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load gallery data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryData();
  }, [selectedCategoryFilter]);

  const openCreateCollectionModal = () => {
    stagedFiles.forEach((s) => URL.revokeObjectURL(s.previewUrl));
    setStagedFiles([]);
    setModalSubImages([]);
    setEditingCol(null);
    setColTitle('');
    setColSlug('');
    setColDate(new Date().toISOString().split('T')[0]);
    setColCoverImage('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80');
    setColIsPublished(true);
    setColIsStarred(true);
    setColSortOrder(collections.length + 1);
    if (categories.length > 0) {
      const nonAll = categories.find((c) => c.slug !== 'all');
      if (nonAll) setColCategoryId(nonAll.id);
    }
    setIsColModalOpen(true);
  };

  const openEditCollectionModal = (col: GalleryCollectionWithImages) => {
    stagedFiles.forEach((s) => URL.revokeObjectURL(s.previewUrl));
    setStagedFiles([]);
    setModalSubImages(col.images || []);
    setEditingCol(col);
    setColTitle(col.title);
    setColSlug(col.slug);
    setColDate(col.created_at ? col.created_at.split('T')[0] : new Date().toISOString().split('T')[0]);
    setColCategoryId(col.category_id);
    setColCoverImage(col.cover_image_path);
    setColIsPublished(col.is_published);
    setColIsStarred(galleryService.isCollectionStarred(col, starredIds));
    setColSortOrder(col.sort_order);
    setIsColModalOpen(true);
  };

  // Add multiple photos into collection from modal (existing collection or staging)
  const handleModalAddFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArray.length === 0) {
      toast.error('Please select valid image files (JPG, PNG, WEBP)');
      return;
    }

    if (editingCol) {
      setIsUploadingModalPhotos(true);
      setModalUploadProgress({ current: 1, total: fileArray.length });
      try {
        const added = await galleryService.uploadMultipleImagesToCollection(
          editingCol.id,
          fileArray,
          modalSubImages.length,
          (curr, total) => setModalUploadProgress({ current: curr, total })
        );
        toast.success(`Successfully added ${added.length} photo${added.length > 1 ? 's' : ''} to this card!`);
        const updated = await galleryService.getCollectionById(editingCol.id);
        if (updated) {
          setModalSubImages(updated.images || []);
          setEditingCol(updated);
        }
        fetchGalleryData();
      } catch (err: any) {
        toast.error(err.message || 'Failed to upload photos');
      } finally {
        setIsUploadingModalPhotos(false);
        setModalUploadProgress(null);
      }
    } else {
      const newStaged = fileArray.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        name: file.name,
      }));
      setStagedFiles((prev) => [...prev, ...newStaged]);
      toast.info(`Added ${fileArray.length} photo${fileArray.length > 1 ? 's' : ''}. They will be uploaded when you save the collection.`);
    }
  };

  // Delete photo from collection modal
  const handleModalDeleteImage = async (img: GalleryImage) => {
    try {
      await galleryService.deleteGalleryImage(img.id, img.image_path);
      toast.success('Photo removed from card');
      setModalSubImages((prev) => prev.filter((item) => item.id !== img.id));
      if (editingCol) {
        const updated = await galleryService.getCollectionById(editingCol.id);
        if (updated) setEditingCol(updated);
      }
      fetchGalleryData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete photo');
    }
  };

  // Remove staged file before saving
  const handleRemoveStagedFile = (index: number) => {
    setStagedFiles((prev) => {
      const target = prev[index];
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  // Set any photo as the cover photo
  const handleSetCoverPhoto = async (imagePath: string) => {
    setColCoverImage(imagePath);
    if (editingCol) {
      try {
        await galleryService.setCollectionCoverImage(editingCol.id, imagePath);
        toast.success('Updated cover photo for this collection card!');
        const updated = await galleryService.getCollectionById(editingCol.id);
        if (updated) setEditingCol(updated);
        fetchGalleryData();
      } catch (err: any) {
        toast.error(err.message || 'Failed to update cover photo');
      }
    } else {
      toast.success('Selected as cover photo');
    }
  };

  // Set cover photo from the standalone manage modal
  const handleSetCoverFromManaging = async (colId: string, imagePath: string) => {
    try {
      await galleryService.setCollectionCoverImage(colId, imagePath);
      toast.success('Updated cover photo for this collection card!');
      const updated = await galleryService.getCollectionById(colId);
      if (updated) setManagingCol(updated);
      fetchGalleryData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update cover photo');
    }
  };

  const handleTitleChange = (val: string) => {
    setColTitle(val);
    if (!editingCol) {
      // Auto-generate clean slug
      const slug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setColSlug(slug);
    }
  };

  const handleToggleStar = async (col: GalleryCollectionWithImages) => {
    try {
      const res = await galleryService.toggleStarCollection(col);
      setStarredIds(res.updatedIds);
      if (res.isStarred) {
        toast.success(`⭐ "${col.title}" marked as Starred! It is now featured on the Home page.`);
      } else {
        toast.success(`"${col.title}" unstarred and removed from Home page.`);
      }
      fetchGalleryData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle star');
    }
  };

  const handleSaveCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!colTitle.trim() || !colSlug.trim() || !colCategoryId) {
      toast.error('Title, slug and category are required');
      return;
    }
    if (!colCoverImage.trim()) {
      toast.error('Please upload or provide a cover photo');
      return;
    }

    setIsSavingCol(true);
    try {
      if (editingCol) {
        const updated = await galleryService.updateCollection(editingCol.id, {
          title: colTitle,
          slug: colSlug,
          category_id: colCategoryId,
          cover_image_path: colCoverImage,
          is_published: colIsPublished,
          sort_order: colSortOrder,
          created_at: colDate ? new Date(colDate).toISOString() : editingCol.created_at,
        });
        const newStarred = await galleryService.setCollectionStarred(updated, colIsStarred);
        setStarredIds(newStarred);
        toast.success('Gallery collection updated');
      } else {
        const created = await galleryService.createCollection({
          title: colTitle,
          slug: colSlug,
          category_id: colCategoryId,
          cover_image_path: colCoverImage,
          is_published: colIsPublished,
          sort_order: colSortOrder,
          created_by: user?.id || null,
          created_at: colDate ? new Date(colDate).toISOString() : new Date().toISOString(),
        });
        const newStarred = await galleryService.setCollectionStarred(created, colIsStarred);
        setStarredIds(newStarred);

        if (stagedFiles.length > 0) {
          toast.info(`Uploading ${stagedFiles.length} photo(s) into this collection...`);
          await galleryService.uploadMultipleImagesToCollection(
            created.id,
            stagedFiles.map((s) => s.file),
            0
          );
          stagedFiles.forEach((s) => URL.revokeObjectURL(s.previewUrl));
          setStagedFiles([]);
        }

        toast.success(`New gallery collection created with ${1 + stagedFiles.length} photos!`);
      }
      setIsColModalOpen(false);
      fetchGalleryData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save collection');
    } finally {
      setIsSavingCol(false);
    }
  };

  const handleTogglePublish = async (col: GalleryCollectionWithImages) => {
    try {
      await galleryService.updateCollection(col.id, { is_published: !col.is_published });
      toast.success(col.is_published ? 'Collection hidden' : 'Collection published');
      fetchGalleryData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle status');
    }
  };

  const handleDeleteCollection = async () => {
    if (!deleteColTarget) return;
    setIsDeletingCol(true);
    try {
      await galleryService.deleteCollection(deleteColTarget.id);
      toast.success('Collection and images deleted successfully');
      setDeleteColTarget(null);
      fetchGalleryData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete collection');
    } finally {
      setIsDeletingCol(false);
    }
  };

  // Upload multiple images in one operation (supports input change or dropped files)
  const handleBatchImageUpload = async (filesToUpload: FileList | File[]) => {
    if (!managingCol || filesToUpload.length === 0) return;
    const files = Array.from(filesToUpload).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) {
      toast.error('Please select valid image files');
      return;
    }

    setIsUploadingSubImages(true);
    setManagingUploadProgress({ current: 1, total: files.length });
    try {
      const added = await galleryService.uploadMultipleImagesToCollection(
        managingCol.id,
        files,
        managingCol.images?.length || 0,
        (curr, total) => setManagingUploadProgress({ current: curr, total })
      );
      toast.success(`Successfully uploaded ${added.length} photos into collection!`);
      const updated = await galleryService.getCollectionById(managingCol.id);
      setManagingCol(updated);
      fetchGalleryData();
    } catch (err: any) {
      toast.error(err.message || 'Batch upload failed');
    } finally {
      setIsUploadingSubImages(false);
      setManagingUploadProgress(null);
      if (managingFileInputRef.current) {
        managingFileInputRef.current.value = '';
      }
    }
  };

  // Delete individual sub-image
  const handleDeleteSubImage = async () => {
    if (!deleteImgTarget) return;
    try {
      await galleryService.deleteGalleryImage(deleteImgTarget.id, deleteImgTarget.image_path);
      toast.success('Image removed from collection');
      setDeleteImgTarget(null);
      if (managingCol) {
        const updated = await galleryService.getCollectionById(managingCol.id);
        setManagingCol(updated);
      }
      fetchGalleryData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete image');
    }
  };

  // Preview collection in lightbox
  const openPreviewLightbox = (col: GalleryCollectionWithImages) => {
    const list: LightboxImage[] = [
      {
        url: col.cover_image_path,
        title: `${col.title} (Cover Photo)`,
        altText: col.title,
      },
    ];
    if (col.images) {
      for (const img of col.images) {
        list.push({
          url: img.image_path,
          title: img.title || col.title,
          altText: img.alt_text || col.title,
        });
      }
    }
    setLightboxImages(list);
    setLightboxIndex(0);
    setLightboxOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="font-inter text-2xl font-bold text-navy-900 flex items-center gap-2.5">
            <Camera className="w-6 h-6 text-sky-500" />
            Photo Gallery Management
          </h1>
          <p className="text-sm text-navy-500 mt-1">
            Organize albums by category, upload multiple high-resolution photos, and manage image titles
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={() => setIsManageCatsModalOpen(true)}
            leftIcon={<Tag className="w-4 h-4 text-sky-500" />}
            className="border-slate-200 text-xs font-semibold"
          >
            Manage Categories
          </Button>
          <Button
            variant="primary"
            onClick={openCreateCollectionModal}
            leftIcon={<Plus className="w-4 h-4" />}
            className="shadow-md"
          >
            Create Collection
          </Button>
        </div>
      </div>

      {/* Category Tabs Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedCategoryFilter('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
            selectedCategoryFilter === 'all'
              ? 'bg-sky-500 text-white shadow-xs'
              : 'bg-white text-navy-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All Collections
        </button>
        {categories
          .filter((cat) => cat.slug !== 'all')
          .map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryFilter(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                selectedCategoryFilter === cat.id
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-white text-navy-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        <button
          onClick={() => setIsManageCatsModalOpen(true)}
          className="px-3 py-1.5 rounded-full text-xs font-semibold text-slate-500 hover:text-sky-600 bg-slate-100 hover:bg-slate-200 transition flex items-center gap-1.5 ml-1"
          title="Manage & delete categories"
        >
          <Tag className="w-3.5 h-3.5 text-sky-500" />
          <span>Edit Categories</span>
        </button>
      </div>

      {loading && <TableSkeleton rows={3} />}

      {/* Collections Grid */}
      {!loading && collections.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((col) => {
            const count = 1 + (col.images?.length || 0);
            const isStarred = galleryService.isCollectionStarred(col, starredIds);

            return (
              <div
                key={col.id}
                className={`bg-white rounded-2xl border transition-all shadow-soft overflow-hidden flex flex-col justify-between ${
                  isStarred ? 'border-amber-300 ring-2 ring-amber-400/20' : 'border-slate-200/90'
                }`}
              >
                <AdminCardImage col={col} count={count} isStarred={isStarred} />

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-inter text-lg font-bold text-navy-900 line-clamp-1">
                        {col.title}
                      </h3>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Star Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleStar(col)}
                          title={isStarred ? 'Starred for Home (Click to remove)' : 'Click to star and show on Home Page'}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition border ${
                            isStarred
                              ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200 shadow-xs'
                              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                          <span>{isStarred ? 'Starred ⭐' : 'Star for Home'}</span>
                        </button>

                        <button
                          onClick={() => handleTogglePublish(col)}
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            col.is_published
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {col.is_published ? 'Published' : 'Draft'}
                        </button>
                      </div>
                    </div>
                    {col.created_at && (
                      <p className="text-xs text-navy-500 line-clamp-1 mt-1">
                        {formatDate(col.created_at)}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setManagingCol(col)}
                      leftIcon={<Images className="w-4 h-4 text-sky-600" />}
                      className="w-full justify-center bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 font-semibold"
                    >
                      + Add / Manage Photos ({count} photo{count !== 1 ? 's' : ''})
                    </Button>

                    <div className="flex items-center justify-between pt-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openPreviewLightbox(col)}
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                      >
                        Preview
                      </Button>

                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditCollectionModal(col)}
                          leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setDeleteColTarget(col)}
                          title="Delete Collection"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && collections.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Camera className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-navy-800">No Collections in this Category</h3>
          <p className="text-sm text-navy-500 mt-1 mb-6">
            Create a photo collection to showcase worship, prayer, youth, or community memories.
          </p>
          <Button variant="primary" onClick={openCreateCollectionModal}>
            Create First Collection
          </Button>
        </div>
      )}

      {/* Create / Edit Collection Modal */}
      <Modal
        isOpen={isColModalOpen}
        onClose={() => setIsColModalOpen(false)}
        title={editingCol ? 'Edit Gallery Collection' : 'Create Gallery Collection'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveCollection} className="space-y-4">
          <Input
            label="Collection Title"
            placeholder="e.g. Sunday Morning Worship & Praise"
            value={colTitle}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="URL Slug"
              placeholder="e.g. sunday-worship-praise"
              value={colSlug}
              onChange={(e) => setColSlug(e.target.value)}
              helperText="Lowercase alphanumeric with dashes"
              required
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-navy-800">
                  Category <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsManageCatsModalOpen(true)}
                  className="text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline flex items-center gap-1"
                >
                  <Tag className="w-3.5 h-3.5" />
                  Manage / Add Categories
                </button>
              </div>
              <select
                value={colCategoryId}
                onChange={(e) => setColCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-navy-900 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                required
              >
                {categories.filter((cat) => cat.slug !== 'all').length === 0 ? (
                  <option value="" disabled>
                    No categories yet — click "+ Add Category" above
                  </option>
                ) : (
                  <>
                    <option value="" disabled>-- Select a category --</option>
                    {categories
                      .filter((cat) => cat.slug !== 'all')
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                  </>
                )}
              </select>

              {categories.filter((cat) => cat.slug !== 'all').length === 0 && (
                <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-xs text-amber-900">
                  <span>No categories exist yet.</span>
                  <button
                    type="button"
                    onClick={handleSeedDefaultCategories}
                    disabled={isSavingCat}
                    className="font-semibold text-sky-600 hover:text-sky-700 underline"
                  >
                    Load Default Categories
                  </button>
                </div>
              )}
            </div>
          </div>

          <Input
            label="Date"
            type="date"
            value={colDate}
            onChange={(e) => setColDate(e.target.value)}
          />

          <ImageUpload
            bucket="gallery-images"
            folder="covers"
            label="Collection Cover Photo (Supabase Storage)"
            currentImageUrl={colCoverImage}
            onImageUploaded={(url) => setColCoverImage(url)}
          />

          {/* Multiple Photos inside this Card */}
          <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-200/80">
              <div>
                <h4 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                  <Images className="w-4 h-4 text-sky-500" />
                  <span>Card Photos ({editingCol ? 1 + modalSubImages.length : 1 + stagedFiles.length} photos in card)</span>
                </h4>
                <p className="text-xs text-navy-500 mt-0.5">
                  Add multiple photos to this collection. Visitors can click through all photos in the interactive gallery slideshow.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => modalFileInputRef.current?.click()}
                  disabled={isUploadingModalPhotos}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add More Photos</span>
                </button>
                <input
                  ref={modalFileInputRef}
                  type="file"
                  multiple
                  accept="image/png, image/jpeg, image/webp"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleModalAddFiles(e.target.files);
                    }
                    e.target.value = '';
                  }}
                  disabled={isUploadingModalPhotos}
                  className="hidden"
                />
              </div>
            </div>

            {/* Uploading Status Banner */}
            {isUploadingModalPhotos && (
              <div className="p-3 bg-sky-100/90 border border-sky-300 rounded-xl flex items-center gap-3 text-sky-800 text-xs font-semibold animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-sky-600 shrink-0" />
                <span>
                  Uploading {modalUploadProgress ? `photo ${modalUploadProgress.current} of ${modalUploadProgress.total}` : 'photos'} to this collection... Please wait.
                </span>
              </div>
            )}

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingModalPhotos(true);
              }}
              onDragLeave={() => setIsDraggingModalPhotos(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingModalPhotos(false);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  handleModalAddFiles(e.dataTransfer.files);
                }
              }}
              onClick={() => modalFileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5 ${
                isDraggingModalPhotos
                  ? 'border-sky-500 bg-sky-50/80 ring-2 ring-sky-200'
                  : 'border-slate-300 hover:border-sky-400 bg-white hover:bg-slate-50/50'
              }`}
            >
              <Upload className="w-6 h-6 text-sky-500" />
              <p className="text-xs font-semibold text-navy-800">
                Drag & drop multiple photos here, or <span className="text-sky-600 underline">browse</span>
              </p>
              <p className="text-[11px] text-slate-400">
                Supports multiple JPG, PNG, WEBP files up to 15MB each
              </p>
            </div>

            {/* Photos List: Existing Images */}
            {editingCol && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-navy-600">
                    Uploaded Photos in this Card ({modalSubImages.length + (colCoverImage ? 1 : 0)})
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Tip: Hover any photo to set as card cover or delete
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-1">
                  {/* Show Cover Photo Tile */}
                  {colCoverImage && (
                    <div className="relative group rounded-xl overflow-hidden border-2 border-amber-400 bg-slate-900 aspect-square shadow-xs">
                      <img
                        src={resolveImageUrl(colCoverImage)}
                        alt="Card Cover"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1.5 left-1.5 bg-amber-400 text-navy-950 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                        <Star className="w-3 h-3 fill-navy-950" /> Cover
                      </div>
                      <div className="absolute inset-0 bg-navy-950/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end text-white">
                        <span className="text-[10px] font-medium truncate">Primary Card Cover</span>
                      </div>
                    </div>
                  )}

                  {/* Sub-images */}
                  {modalSubImages.map((img) => {
                    const isCurrentCover = colCoverImage === img.image_path;
                    if (isCurrentCover) return null; // Already shown above
                    return (
                      <div
                        key={img.id}
                        className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-square hover:shadow-md transition"
                      >
                        <img
                          src={resolveImageUrl(img.image_path)}
                          alt={img.alt_text || img.title || 'Collection Photo'}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-navy-950/70 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between text-white">
                          <span className="text-[11px] truncate font-medium">{img.title || 'Photo'}</span>
                          <div className="flex items-center justify-between gap-1">
                            <button
                              type="button"
                              onClick={() => handleSetCoverPhoto(img.image_path)}
                              className="text-[10px] font-semibold text-white bg-sky-600 hover:bg-sky-500 px-2 py-1 rounded transition flex items-center gap-1"
                              title="Set as Card Cover Photo"
                            >
                              <Star className="w-2.5 h-2.5" /> Cover
                            </button>
                            <button
                              type="button"
                              onClick={() => handleModalDeleteImage(img)}
                              className="p-1 bg-rose-500 hover:bg-rose-600 rounded text-white transition shadow-xs"
                              title="Remove Photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Photos List: Staged Images for New Collection */}
            {!editingCol && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-navy-600">
                    Staged Photos for this Card ({stagedFiles.length})
                  </span>
                  {stagedFiles.length > 0 && (
                    <span className="text-[11px] text-emerald-600 font-semibold">
                      Will be uploaded when you click Create Collection
                    </span>
                  )}
                </div>

                {stagedFiles.length === 0 ? (
                  <p className="text-xs text-navy-400 py-4 text-center bg-white rounded-xl border border-dashed border-slate-200">
                    No extra photos added yet. Select or drop multiple images above to build this card!
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-60 overflow-y-auto p-1">
                    {stagedFiles.map((staged, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-square"
                      >
                        <img
                          src={staged.previewUrl}
                          alt={staged.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-navy-950/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between text-white">
                          <span className="text-[10px] truncate font-medium">{staged.name}</span>
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleRemoveStagedFile(idx)}
                              className="p-1 bg-rose-500 hover:bg-rose-600 rounded text-white transition shadow-xs"
                              title="Remove"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <Input
              label="Sort Order"
              type="number"
              min={1}
              value={colSortOrder}
              onChange={(e) => setColSortOrder(parseInt(e.target.value) || 1)}
            />

            <div className="pt-5 flex items-center gap-2">
              <input
                id="isPublishedCol"
                type="checkbox"
                checked={colIsPublished}
                onChange={(e) => setColIsPublished(e.target.checked)}
                className="w-4 h-4 text-sky-500 rounded border-slate-300 focus:ring-sky-400"
              />
              <label htmlFor="isPublishedCol" className="text-sm font-medium text-navy-800 cursor-pointer">
                Publish immediately
              </label>
            </div>
          </div>

          <div className="p-3 bg-amber-50/80 border border-amber-200/90 rounded-xl flex items-center gap-2.5">
            <input
              id="isStarredCol"
              type="checkbox"
              checked={colIsStarred}
              onChange={(e) => setColIsStarred(e.target.checked)}
              className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-400 cursor-pointer"
            />
            <label htmlFor="isStarredCol" className="text-sm font-semibold text-navy-900 cursor-pointer flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>Feature on Home Page (Starred collection)</span>
            </label>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsColModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSavingCol}
            >
              {editingCol ? 'Save Changes' : 'Create Collection'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Manage Photos within Collection Modal */}
      <Modal
        isOpen={!!managingCol}
        onClose={() => setManagingCol(null)}
        title={`Manage Photos: ${managingCol?.title}`}
        description="Upload multiple photos into this card, change the cover photo, or remove photos."
        maxWidth="2xl"
      >
        {managingCol && (
          <div className="space-y-6">
            {/* Multiple Photos Drop & Upload Box */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingManagingPhotos(true);
              }}
              onDragLeave={() => setIsDraggingManagingPhotos(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingManagingPhotos(false);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  handleBatchImageUpload(e.dataTransfer.files);
                }
              }}
              onClick={() => managingFileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition ${
                isDraggingManagingPhotos
                  ? 'border-sky-500 bg-sky-50 ring-2 ring-sky-200'
                  : 'border-sky-300 hover:border-sky-400 bg-sky-50/60 hover:bg-sky-50'
              }`}
            >
              <FileImage className="w-10 h-10 text-sky-500 mb-2" />
              <h4 className="text-sm font-bold text-navy-900">
                Add Multiple Photos to this Card
              </h4>
              <p className="text-xs text-navy-500 mt-1 mb-4">
                Drag & drop multiple images here, or click to browse (JPG, PNG, WEBP)
              </p>
              <button
                type="button"
                disabled={isUploadingSubImages}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
              >
                {isUploadingSubImages ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>
                      Uploading {managingUploadProgress ? `${managingUploadProgress.current} of ${managingUploadProgress.total}` : 'photos'}...
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Select Multiple Photos</span>
                  </>
                )}
              </button>
              <input
                ref={managingFileInputRef}
                type="file"
                multiple
                accept="image/png, image/jpeg, image/webp"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleBatchImageUpload(e.target.files);
                  }
                }}
                disabled={isUploadingSubImages}
                className="hidden"
              />
            </div>

            {/* List of current images in collection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                  <Images className="w-4 h-4 text-sky-500" />
                  <span>Photos in this Card ({1 + (managingCol.images?.length || 0)} total)</span>
                </h4>
                <span className="text-xs text-navy-500">
                  Click "Cover" to switch card cover photo
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[50vh] overflow-y-auto p-1">
                {/* Current Cover Photo */}
                <div className="relative group rounded-xl overflow-hidden border-2 border-amber-400 bg-slate-900 aspect-square shadow-xs">
                  <img
                    src={resolveImageUrl(managingCol.cover_image_path)}
                    alt="Card Cover"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1.5 left-1.5 bg-amber-400 text-navy-950 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                    <Star className="w-3 h-3 fill-navy-950" /> Cover Photo
                  </div>
                  <div className="absolute inset-0 bg-navy-950/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end text-white">
                    <span className="text-[10px] font-medium truncate">Primary Card Cover</span>
                  </div>
                </div>

                {/* Sub-images */}
                {managingCol.images?.map((img) => {
                  const isCurrentCover = managingCol.cover_image_path === img.image_path;
                  if (isCurrentCover) return null;
                  return (
                    <div
                      key={img.id}
                      className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-square hover:shadow-md transition"
                    >
                      <img
                        src={resolveImageUrl(img.image_path)}
                        alt={img.alt_text || img.title || 'Collection image'}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-navy-950/70 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between text-white">
                        <span className="text-[11px] truncate font-medium">
                          {img.title || 'Untitled'}
                        </span>
                        <div className="flex items-center justify-between gap-1">
                          <button
                            type="button"
                            onClick={() => handleSetCoverFromManaging(managingCol.id, img.image_path)}
                            className="text-[10px] font-semibold text-white bg-sky-600 hover:bg-sky-500 px-2 py-1 rounded transition flex items-center gap-1"
                            title="Make this photo the card cover"
                          >
                            <Star className="w-2.5 h-2.5" /> Cover
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteImgTarget(img)}
                            className="p-1.5 bg-rose-500 rounded-md text-white hover:bg-rose-600 transition shadow-sm"
                            title="Delete Photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button variant="primary" onClick={() => setManagingCol(null)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Collection Dialog */}
      <ConfirmDialog
        isOpen={!!deleteColTarget}
        onClose={() => setDeleteColTarget(null)}
        onConfirm={handleDeleteCollection}
        isLoading={isDeletingCol}
        title="Delete Photo Collection?"
        message={`Are you sure you want to permanently delete "${deleteColTarget?.title}" and all its photos? This action cannot be reversed.`}
      />

      {/* Delete Single Photo Dialog */}
      <ConfirmDialog
        isOpen={!!deleteImgTarget}
        onClose={() => setDeleteImgTarget(null)}
        onConfirm={handleDeleteSubImage}
        title="Remove Photo?"
        message="Are you sure you want to remove this photo from the collection?"
      />

      {/* Lightbox Preview */}
      <Lightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={lightboxImages}
        currentIndex={lightboxIndex}
        onNavigate={(newIdx) => setLightboxIndex(newIdx)}
      />

      {/* Manage & Delete Categories Modal */}
      {isManageCatsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-card border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-inter text-lg font-bold text-navy-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-sky-500" />
                Manage Gallery Categories
              </h3>
              <button
                type="button"
                onClick={() => setIsManageCatsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Quick Add Category Form */}
              <form onSubmit={handleCreateCategory} className="space-y-3 p-4 bg-sky-50/70 border border-sky-100 rounded-xl">
                <label className="block text-xs font-semibold uppercase tracking-wider text-navy-700">
                  Add New Category
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Youth Camp, Choir, Baptisms"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={isSavingCat}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Add
                  </Button>
                </div>
              </form>

              {/* Categories List with Delete Action */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-navy-500">
                    Existing Categories ({categories.filter((c) => c.slug !== 'all').length})
                  </span>
                  {categories.filter((c) => c.slug !== 'all').length === 0 && (
                    <button
                      type="button"
                      onClick={handleSeedDefaultCategories}
                      disabled={isSavingCat}
                      className="text-xs font-semibold text-sky-600 hover:text-sky-700 underline"
                    >
                      Load Default Categories
                    </button>
                  )}
                </div>

                {categories.filter((c) => c.slug !== 'all').length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No categories created yet. Add one above or load defaults!
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl max-h-60 overflow-y-auto">
                    {categories
                      .filter((c) => c.slug !== 'all')
                      .map((cat) => {
                        const count = collections.filter((col) => col.category_id === cat.id).length;
                        return (
                          <div
                            key={cat.id}
                            className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/80 transition"
                          >
                            <div>
                              <p className="text-sm font-semibold text-navy-900">{cat.name}</p>
                              <p className="text-xs text-slate-400">
                                {count} collection{count === 1 ? '' : 's'} assigned
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setDeleteCatTarget(cat)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title={`Delete ${cat.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <Button variant="outline" onClick={() => setIsManageCatsModalOpen(false)}>
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteCatTarget}
        onClose={() => setDeleteCatTarget(null)}
        onConfirm={handleDeleteCategory}
        isLoading={isDeletingCat}
        title="Delete Category?"
        message={`Are you sure you want to permanently delete the category "${deleteCatTarget?.name}"?`}
      />
    </div>
  );
};
