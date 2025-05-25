import { useConfig } from '@/contexts/config-context';

export interface UploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  maxFiles?: number;
  onProgress?: (progress: number) => void;
}

export interface UploadError extends Error {
  code: 'FILE_TOO_LARGE' | 'INVALID_TYPE' | 'TOO_MANY_FILES';
  file?: File;
}

export class FileValidator {
  static validateFile(file: File, options: UploadOptions = {}): void {
    const {
      maxSize = 5 * 1024 * 1024,
      allowedTypes = ['image/*', 'application/pdf'],
    } = options;

    if (file.size > maxSize) {
      const error = new Error(`File size exceeds ${maxSize / (1024 * 1024)}MB`) as UploadError;
      error.code = 'FILE_TOO_LARGE';
      error.file = file;
      throw error;
    }

    const isValidType = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        const baseType = type.split('/')[0];
        return file.type.startsWith(`${baseType}/`);
      }
      return file.type === type;
    });

    if (!isValidType) {
      const error = new Error(`Invalid file type: ${file.type}`) as UploadError;
      error.code = 'INVALID_TYPE';
      error.file = file;
      throw error;
    }
  }

  static async readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }
}

export async function uploadFiles(
  files: FileList | File[],
  endpoint: string,
  options: UploadOptions = {}
): Promise<string[]> {
  const {
    maxFiles = 5,
    onProgress,
  } = options;

  const fileArray = Array.from(files);
  if (fileArray.length > maxFiles) {
    const error = new Error(`Maximum ${maxFiles} files allowed`) as UploadError;
    error.code = 'TOO_MANY_FILES';
    throw error;
  }

  // Validate all files first
  fileArray.forEach(file => FileValidator.validateFile(file, options));

  const uploadPromises = fileArray.map(async (file, index) => {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    
    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      };
    }

    return new Promise<string>((resolve, reject) => {
      xhr.open('POST', endpoint);
      
      xhr.onload = () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response.url);
          } catch {
            reject(new Error('Invalid response format'));
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send(formData);
    });
  });

  return Promise.all(uploadPromises);
}

export function useFileUpload() {
  const config = useConfig();

  return {
    uploadFiles: (files: FileList | File[], endpoint: string, options: UploadOptions = {}) => {
      return uploadFiles(files, endpoint, {
        maxSize: config.limits.maxFileSize,
        allowedTypes: config.limits.supportedFileTypes,
        maxFiles: config.limits.maxAttachments,
        ...options,
      });
    },
    FileValidator,
  };
}