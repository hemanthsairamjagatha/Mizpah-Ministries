import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { storageService, type StorageBucket } from '../../services/storageService';
import { cn } from '../../lib/utils';
import { Button } from './Button';

export interface ImageUploadProps {
  bucket: StorageBucket;
  currentImageUrl?: string | null;
  onImageUploaded: (url: string, path: string) => void;
  label?: string;
  folder?: string;
  maxSizeMb?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  bucket,
  currentImageUrl,
  onImageUploaded,
  label = 'Upload Image',
  folder = 'uploads',
  maxSizeMb = 10,
}) => {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Instant local preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Perform upload
    setIsUploading(true);
    try {
      const { publicUrl, path } = await storageService.uploadImage({
        bucket,
        file,
        folder,
        maxSizeMb,
      });
      setPreview(publicUrl);
      onImageUploaded(publicUrl, path);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
      setPreview(currentImageUrl || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageUploaded('', '');
  };

  return (
    <div className="w-full space-y-2">
      {label && <label className="block text-sm font-medium text-navy-800">{label}</label>}

      {preview ? (
        <div className="relative group w-full h-48 sm:h-56 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
          <img
            src={preview}
            alt="Upload preview"
            className="w-full h-full object-cover"
          />
          {isUploading && (
            <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-xs flex flex-col items-center justify-center text-white">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <span className="text-sm font-medium">Uploading to Supabase...</span>
            </div>
          )}
          {!isUploading && (
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 text-xs font-medium bg-white/90 text-navy-800 rounded-md shadow-sm hover:bg-white backdrop-blur-xs transition"
              >
                Change
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-white bg-rose-500 rounded-md shadow-sm hover:bg-rose-600 transition"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'w-full h-44 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all',
            'border-slate-300 hover:border-sky-400 hover:bg-sky-50/50 bg-slate-50/50 text-navy-500'
          )}
        >
          <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mb-2">
            <Upload className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-navy-800">
            Click to upload or drag image
          </p>
          <p className="text-xs text-navy-400 mt-1">
            PNG, JPG, WEBP up to {maxSizeMb}MB
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/svg+xml"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
};
