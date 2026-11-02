import { supabase } from './supabaseClient';
import { storageService } from './storageService';
import type { 
  GalleryCategory, 
  GalleryCollection, 
  GalleryImage,
  GalleryCollectionWithImages 
} from '../types/database.types';

export const galleryService = {
  /**
   * Fetch all gallery categories with auto-initialization fallback
   */
  async getCategories(): Promise<GalleryCategory[]> {
    const { data, error } = await supabase
      .from('gallery_categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.warn('Error fetching gallery categories:', error.message);
      return [];
    }

    // If categories table is completely empty, attempt auto-seeding
    if (!data || data.length === 0) {
      try {
        const seeded = await this.seedDefaultCategories();
        if (seeded && seeded.length > 0) {
          return seeded;
        }
      } catch (seedErr) {
        console.warn('Auto-seed categories failed (may require admin login):', seedErr);
      }
    }

    return data || [];
  },

  /**
   * Seed default categories for a fresh church portal database
   */
  async seedDefaultCategories(): Promise<GalleryCategory[]> {
    const defaults = [
      { name: 'All Photos', slug: 'all', sort_order: 0 },
      { name: 'Sunday Worship', slug: 'worship', sort_order: 1 },
      { name: 'Community Fellowship', slug: 'community', sort_order: 2 },
      { name: 'Youth & Children', slug: 'youth-children', sort_order: 3 },
      { name: 'Sanctuary & Campus', slug: 'sanctuary', sort_order: 4 },
      { name: 'Special Events', slug: 'special-events', sort_order: 5 },
    ];

    const { data, error } = await supabase
      .from('gallery_categories')
      .insert(defaults)
      .select();

    if (error) {
      console.warn('Could not seed default categories:', error.message);
      return [];
    }
    return data || [];
  },

  /**
   * Create a new custom category
   */
  async createCategory(name: string, customSlug?: string): Promise<GalleryCategory> {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Category name cannot be empty');

    const slug = (customSlug || trimmed)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const { data, error } = await supabase
      .from('gallery_categories')
      .insert({
        name: trimmed,
        slug: slug || `cat-${Date.now()}`,
        sort_order: 10,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a category
   */
  async deleteCategory(id: string): Promise<void> {
    // Check if any collections are currently using this category
    const { count, error: countErr } = await supabase
      .from('gallery_collections')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id);

    if (countErr) {
      console.warn('Error checking category collection count:', countErr);
    }

    if (count && count > 0) {
      throw new Error(`Cannot delete category: ${count} album collection${count === 1 ? ' is' : 's are'} assigned to it. Please reassign or delete those collections first.`);
    }

    const { error } = await supabase
      .from('gallery_categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Fetch published collections with their images and category for public view
   */
  async getPublishedCollections(categorySlug?: string): Promise<GalleryCollectionWithImages[]> {
    let query = supabase
      .from('gallery_collections')
      .select(`
        *,
        category:gallery_categories(*),
        images:gallery_images(*)
      `)
      .eq('is_published', true)
      .order('sort_order', { ascending: true });

    if (categorySlug && categorySlug !== 'all') {
      // Find category ID by slug
      const { data: cat } = await supabase
        .from('gallery_categories')
        .select('id')
        .eq('slug', categorySlug)
        .maybeSingle();

      if (cat) {
        query = query.eq('category_id', cat.id);
      }
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Error fetching published collections:', error.message);
      return [];
    }

    // Sort sub-images within collections
    return (data || []).map((col: any) => ({
      ...col,
      images: (col.images || []).sort((a: GalleryImage, b: GalleryImage) => a.sort_order - b.sort_order)
    }));
  },

  /**
   * Fetch all collections for admin management
   */
  async getAllCollections(categoryFilter?: string): Promise<GalleryCollectionWithImages[]> {
    let query = supabase
      .from('gallery_collections')
      .select(`
        *,
        category:gallery_categories(*),
        images:gallery_images(*)
      `)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (categoryFilter && categoryFilter !== 'all') {
      query = query.eq('category_id', categoryFilter);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((col: any) => ({
      ...col,
      images: (col.images || []).sort((a: GalleryImage, b: GalleryImage) => a.sort_order - b.sort_order)
    }));
  },

  /**
   * Fetch a single collection with its images by ID
   */
  async getCollectionById(id: string): Promise<GalleryCollectionWithImages | null> {
    const { data, error } = await supabase
      .from('gallery_collections')
      .select(`
        *,
        category:gallery_categories(*),
        images:gallery_images(*)
      `)
      .eq('id', id)
      .single();

    if (error) return null;
    return {
      ...data,
      images: (data.images || []).sort((a: GalleryImage, b: GalleryImage) => a.sort_order - b.sort_order)
    };
  },

  /**
   * Create a new gallery collection
   */
  async createCollection(
    collection: Omit<GalleryCollection, 'id' | 'created_at' | 'updated_at' | 'description'> & {
      created_at?: string;
      description?: string | null;
    }
  ): Promise<GalleryCollection> {
    const { data, error } = await supabase
      .from('gallery_collections')
      .insert(collection)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update gallery collection
   */
  async updateCollection(id: string, updates: Partial<GalleryCollection>): Promise<GalleryCollection> {
    const { data, error } = await supabase
      .from('gallery_collections')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete complete collection and its associated gallery images (plus optional storage clean)
   */
  async deleteCollection(id: string): Promise<void> {
    // 1. Fetch images to cleanup storage if uploaded to gallery-images
    const { data: images } = await supabase
      .from('gallery_images')
      .select('image_path')
      .eq('collection_id', id);

    const { data: col } = await supabase
      .from('gallery_collections')
      .select('cover_image_path')
      .eq('id', id)
      .single();

    // 2. Delete collection row (DB cascades deletion to gallery_images)
    const { error } = await supabase
      .from('gallery_collections')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // 3. Clean up storage files in background
    if (col?.cover_image_path?.includes('/gallery-images/')) {
      storageService.deleteImage('gallery-images', col.cover_image_path);
    }
    if (images && images.length > 0) {
      for (const img of images) {
        if (img.image_path.includes('/gallery-images/')) {
          storageService.deleteImage('gallery-images', img.image_path);
        }
      }
    }
  },

  /**
   * Upload multiple images to a collection in a single batch operation
   */
  async uploadMultipleImagesToCollection(
    collectionId: string, 
    files: File[],
    startingSortOrder: number = 0,
    onProgress?: (current: number, total: number) => void
  ): Promise<GalleryImage[]> {
    const results: GalleryImage[] = [];

    for (let i = 0; i < files.length; i++) {
      if (onProgress) {
        onProgress(i + 1, files.length);
      }
      const file = files[i];
      // 1. Upload file to Supabase storage
      const { publicUrl } = await storageService.uploadImage({
        bucket: 'gallery-images',
        file,
        folder: `collection_${collectionId}`,
        maxSizeMb: 15,
      });

      // 2. Insert image metadata to gallery_images table
      const title = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const { data, error } = await supabase
        .from('gallery_images')
        .insert({
          collection_id: collectionId,
          image_path: publicUrl,
          title: title,
          alt_text: title,
          sort_order: startingSortOrder + i + 1,
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to insert gallery image record:', error);
      } else if (data) {
        results.push(data);
      }
    }

    return results;
  },

  /**
   * Set a photo as the collection's cover photo
   */
  async setCollectionCoverImage(collectionId: string, coverImagePath: string): Promise<GalleryCollection> {
    return this.updateCollection(collectionId, { cover_image_path: coverImagePath });
  },

  /**
   * Add a single image directly with metadata
   */
  async addGalleryImage(image: Omit<GalleryImage, 'id' | 'created_at'>): Promise<GalleryImage> {
    const { data, error } = await supabase
      .from('gallery_images')
      .insert(image)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update individual image title, alt text, or sort order
   */
  async updateGalleryImage(id: string, updates: Partial<GalleryImage>): Promise<GalleryImage> {
    const { data, error } = await supabase
      .from('gallery_images')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete an individual image from a collection
   */
  async deleteGalleryImage(id: string, imagePath?: string): Promise<void> {
    const { error } = await supabase
      .from('gallery_images')
      .delete()
      .eq('id', id);

    if (error) throw error;

    if (imagePath && imagePath.includes('/gallery-images/')) {
      storageService.deleteImage('gallery-images', imagePath);
    }
  },

  /**
   * Get all starred gallery collection IDs for home page display
   */
  getStarredCollectionIds(): string[] {
    const STARRED_STORAGE_KEY = 'mizpah_starred_gallery_ids';
    const DEFAULT_INITIAL_STARRED_IDS = [
      'ac7a05ce-eac9-47fe-86d2-11fa798f6100', // wORSHIP
      'b628cfde-52c1-430c-88e0-41e3b420da6f', // WORSHIPS
      'eacd26e5-f720-42fe-842a-38f7b8d32ff3', // CZHJVCAHVS
    ];
    try {
      const raw = localStorage.getItem(STARRED_STORAGE_KEY);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
      localStorage.setItem(STARRED_STORAGE_KEY, JSON.stringify(DEFAULT_INITIAL_STARRED_IDS));
      return DEFAULT_INITIAL_STARRED_IDS;
    } catch {
      return DEFAULT_INITIAL_STARRED_IDS;
    }
  },

  /**
   * Check if a collection is starred
   */
  isCollectionStarred(col: { id: string; description?: string | null }, cachedIds?: string[]): boolean {
    const STARRED_TAG = '[STARRED]';
    if (col.description && col.description.includes(STARRED_TAG)) {
      return true;
    }
    const ids = cachedIds || this.getStarredCollectionIds();
    return ids.includes(col.id);
  },

  /**
   * Toggle star status for a collection
   */
  async toggleStarCollection(col: { id: string; description?: string | null }): Promise<{ isStarred: boolean; updatedIds: string[] }> {
    const STARRED_STORAGE_KEY = 'mizpah_starred_gallery_ids';
    const STARRED_TAG = '[STARRED]';
    const currentIds = this.getStarredCollectionIds();
    const isCurrentlyStarred = this.isCollectionStarred(col, currentIds);
    const willBeStarred = !isCurrentlyStarred;

    let updatedIds: string[];
    if (willBeStarred) {
      updatedIds = Array.from(new Set([...currentIds, col.id]));
    } else {
      updatedIds = currentIds.filter((id) => id !== col.id);
    }

    try {
      localStorage.setItem(STARRED_STORAGE_KEY, JSON.stringify(updatedIds));
      window.dispatchEvent(
        new CustomEvent('mizpah_starred_gallery_updated', {
          detail: { id: col.id, isStarred: willBeStarred, starredIds: updatedIds },
        })
      );
    } catch (e) {
      console.warn('Could not persist starred IDs to localStorage:', e);
    }

    // Also attempt DB description tag update for cross-device sync
    try {
      let newDescription: string | null = col.description || null;
      if (willBeStarred) {
        if (!newDescription?.includes(STARRED_TAG)) {
          newDescription = newDescription ? `${STARRED_TAG} ${newDescription}` : STARRED_TAG;
        }
      } else {
        if (newDescription?.includes(STARRED_TAG)) {
          newDescription = newDescription.replace(new RegExp(`\\${STARRED_TAG}\\s*`, 'g'), '').trim() || null;
        }
      }
      await supabase
        .from('gallery_collections')
        .update({ description: newDescription })
        .eq('id', col.id);
    } catch (dbErr) {
      console.warn('DB update for star tag skipped/failed:', dbErr);
    }

    return { isStarred: willBeStarred, updatedIds };
  },

  /**
   * Set star status explicitly
   */
  async setCollectionStarred(col: { id: string; description?: string | null }, starred: boolean): Promise<string[]> {
    const STARRED_STORAGE_KEY = 'mizpah_starred_gallery_ids';
    const STARRED_TAG = '[STARRED]';
    const currentIds = this.getStarredCollectionIds();
    let updatedIds: string[];
    if (starred) {
      updatedIds = Array.from(new Set([...currentIds, col.id]));
    } else {
      updatedIds = currentIds.filter((id) => id !== col.id);
    }

    try {
      localStorage.setItem(STARRED_STORAGE_KEY, JSON.stringify(updatedIds));
      window.dispatchEvent(
        new CustomEvent('mizpah_starred_gallery_updated', {
          detail: { id: col.id, isStarred: starred, starredIds: updatedIds },
        })
      );
    } catch (e) {
      console.warn('Could not persist starred IDs to localStorage:', e);
    }

    try {
      let newDescription: string | null = col.description || null;
      if (starred) {
        if (!newDescription?.includes(STARRED_TAG)) {
          newDescription = newDescription ? `${STARRED_TAG} ${newDescription}` : STARRED_TAG;
        }
      } else {
        if (newDescription?.includes(STARRED_TAG)) {
          newDescription = newDescription.replace(new RegExp(`\\${STARRED_TAG}\\s*`, 'g'), '').trim() || null;
        }
      }
      await supabase
        .from('gallery_collections')
        .update({ description: newDescription })
        .eq('id', col.id);
    } catch (dbErr) {
      console.warn('DB update for star tag skipped/failed:', dbErr);
    }

    return updatedIds;
  },

  /**
   * Strip any internal tags like [STARRED] from the description for clean public display
   */
  cleanDescription(description?: string | null): string {
    const STARRED_TAG = '[STARRED]';
    if (!description) return '';
    return description.replace(new RegExp(`\\${STARRED_TAG}\\s*`, 'g'), '').trim();
  },
};
