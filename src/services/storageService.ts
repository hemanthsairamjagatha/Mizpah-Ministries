import { supabase } from './supabaseClient';

export type StorageBucket = 
  | 'site-assets' 
  | 'about-images' 
  | 'founder-images' 
  | 'sermon-thumbnails' 
  | 'gallery-images';

interface UploadOptions {
  bucket: StorageBucket;
  file: File;
  folder?: string;
  maxSizeMb?: number;
}

export interface UploadResult {
  path: string;
  publicUrl: string;
}

export const storageService = {
  /**
   * Upload an image file to Supabase Storage with size and type validation
   */
  async uploadImage({
    bucket,
    file,
    folder = 'uploads',
    maxSizeMb = 10,
  }: UploadOptions): Promise<UploadResult> {
    // 1. Validate MIME type
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!validMimes.includes(file.type)) {
      throw new Error(`Invalid file type (${file.type}). Allowed: JPG, PNG, WEBP, SVG`);
    }

    // 2. Validate file size
    const maxBytes = maxSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds limit of ${maxSizeMb}MB`);
    }

    // 3. Generate unique safe filename
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
    const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const fullPath = `${folder}/${cleanFileName}_${uniqueId}.${fileExt}`;

    // 4. Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fullPath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error(`Storage upload error [${bucket}]:`, uploadError);
      throw new Error(uploadError.message || 'Failed to upload image file');
    }

    // 5. Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fullPath);

    return {
      path: fullPath,
      publicUrl: urlData.publicUrl,
    };
  },

  /**
   * Delete an image from Supabase Storage by path
   */
  async deleteImage(bucket: StorageBucket, path: string): Promise<boolean> {
    if (!path) return true;
    try {
      // If path is a full URL, extract the relative path if it matches this bucket
      let cleanPath = path;
      if (path.includes(`/${bucket}/`)) {
        cleanPath = path.split(`/${bucket}/`)[1];
      }
      
      const { error } = await supabase.storage.from(bucket).remove([cleanPath]);
      if (error) {
        console.warn(`Could not delete storage file ${cleanPath}:`, error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Storage delete exception:', err);
      return false;
    }
  },
};
