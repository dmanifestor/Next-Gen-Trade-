import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export interface UploadProgressCallback {
  (progress: number, bytesTransferred: number, totalBytes: number): void;
}

export interface UploadResult {
  downloadUrl: string;
  storagePath: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  uploadedAt: string;
}

/**
 * Validates a file before uploading to Firebase Storage
 */
export function validateUploadFile(
  file: File,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  maxSizeMB: number = 10
): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  // Check file size
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `File exceeds maximum allowed size of ${maxSizeMB}MB (File size: ${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
    };
  }

  // Check MIME type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    // If MIME type check fails, also check file extension as fallback
    const ext = file.name.split('.').pop()?.toLowerCase();
    const allowedExts = allowedTypes.map((t) => t.split('/')[1]);
    if (!ext || !allowedExts.includes(ext)) {
      return {
        valid: false,
        error: `File type "${file.type || ext}" is not supported. Please upload PNG, JPG, WEBP, or PDF.`,
      };
    }
  }

  return { valid: true };
}

/**
 * Uploads a file to Firebase Storage with real-time progress callbacks
 *
 * @param file The browser File object
 * @param folder The storage folder (e.g. 'kyc', 'avatars', 'deposits')
 * @param userId The authenticated user ID for security isolation
 * @param onProgress Callback invoked as bytes are transferred
 */
export async function uploadFileToFirebaseStorage(
  file: File,
  folder: 'kyc' | 'avatars' | 'deposits' | 'documents',
  userId: string,
  onProgress?: UploadProgressCallback
): Promise<UploadResult> {
  const validation = validateUploadFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid file.');
  }

  // Clean filename and generate a collision-safe path
  const timestamp = Date.now();
  const sanitizedOriginal = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `${folder}/${userId}/${timestamp}_${sanitizedOriginal}`;

  const fileRef = ref(storage, storagePath);

  const metadata = {
    contentType: file.type || 'application/octet-stream',
    customMetadata: {
      uploadedBy: userId,
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
    },
  };

  const uploadTask = uploadBytesResumable(fileRef, file, metadata);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = snapshot.totalBytes > 0
          ? Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
          : 0;
        if (onProgress) {
          onProgress(progress, snapshot.bytesTransferred, snapshot.totalBytes);
        }
      },
      (error) => {
        console.error('Firebase Storage upload error:', error);
        reject(new Error(`Storage Upload Failed: ${error.message || 'Unable to store file.'}`));
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            downloadUrl,
            storagePath,
            fileName: file.name,
            fileSize: file.size,
            contentType: file.type,
            uploadedAt: new Date().toISOString(),
          });
        } catch (urlError) {
          reject(new Error('Uploaded file successfully, but could not generate download URL.'));
        }
      }
    );
  });
}

/**
 * Deletes a file from Firebase Storage
 */
export async function deleteFileFromFirebaseStorage(storagePath: string): Promise<boolean> {
  try {
    const fileRef = ref(storage, storagePath);
    await deleteObject(fileRef);
    return true;
  } catch (err) {
    console.warn('Could not delete storage file:', err);
    return false;
  }
}
