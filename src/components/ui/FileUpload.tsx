import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, X, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { uploadFileToFirebaseStorage, validateUploadFile, UploadResult } from '../../lib/storage';

interface FileUploadProps {
  userId: string;
  folder: 'kyc' | 'avatars' | 'deposits' | 'documents';
  onUploadSuccess: (result: UploadResult) => void;
  onUploadError?: (errorMsg: string) => void;
  allowedTypes?: string[];
  maxSizeMB?: number;
  label?: string;
  helperText?: string;
  accept?: string;
  compact?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  userId,
  folder,
  onUploadSuccess,
  onUploadError,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  maxSizeMB = 10,
  label = 'Upload Document or Receipt',
  helperText = 'Supported formats: PNG, JPG, WEBP, PDF (Up to 10MB)',
  accept = '.png,.jpg,.jpeg,.webp,.pdf,image/png,image/jpeg,image/webp,application/pdf',
  compact = false,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setError(null);
    const validation = validateUploadFile(file, allowedTypes, maxSizeMB);
    if (!validation.valid) {
      const err = validation.error || 'Invalid file';
      setError(err);
      onUploadError?.(err);
      return;
    }

    if (!userId) {
      const err = 'User authentication session required to upload files to Firebase Storage.';
      setError(err);
      onUploadError?.(err);
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      const result = await uploadFileToFirebaseStorage(
        file,
        folder,
        userId,
        (pct) => setProgress(pct)
      );

      setUploadResult(result);
      onUploadSuccess(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setError(msg);
      onUploadError?.(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadResult(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isImage = uploadResult?.contentType.startsWith('image/');

  return (
    <div className="w-full space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300">{label}</label>
          <span className="text-[10px] text-emerald-400 font-mono">Firebase Storage</span>
        </div>
      )}

      {/* Upload Dropzone */}
      {!uploadResult ? (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer select-none text-center ${
            dragOver
              ? 'border-emerald-400 bg-emerald-500/10'
              : 'border-slate-700/80 hover:border-slate-600 bg-slate-900/50 hover:bg-slate-900/80'
          } ${compact ? 'p-3' : 'p-5 sm:p-6'} ${isUploading ? 'pointer-events-none opacity-80' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="hidden"
            disabled={isUploading}
          />

          {isUploading ? (
            <div className="space-y-3 py-1">
              <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">
                  Uploading to Firebase Storage... {progress}%
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Securing document on default bucket yewoapp-906a5.firebasestorage.app
                </p>
              </div>
              <div className="w-full max-w-xs mx-auto h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-10 h-10 mx-auto rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-emerald-400">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">
                  Click to select file or drag & drop here
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">{helperText}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Uploaded Success State */
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 overflow-hidden">
              {isImage ? (
                <img
                  src={uploadResult.downloadUrl}
                  alt={uploadResult.fileName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FileText className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <p className="text-xs font-bold text-slate-200 truncate">
                  {uploadResult.fileName}
                </p>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                {(uploadResult.fileSize / 1024).toFixed(1)} KB &bull; Uploaded to Firebase Storage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <a
              href={uploadResult.downloadUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold transition-colors"
            >
              View
            </a>
            <button
              type="button"
              onClick={handleReset}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Remove or re-upload"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-950/30 border border-rose-500/30 rounded-lg p-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
