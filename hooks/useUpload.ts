import { useState, useCallback } from "react";
import { storageService } from "@/lib/storage";
import { fileSchema } from "@/lib/validations";
import { z } from "zod";

type UploadOptions = {
  folder?: string;
  allowedTypes?: string[];
  maxSize?: number;
};

export const useUpload = (options: UploadOptions = {}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const {
    folder = "uploads",
    allowedTypes = ["image/jpeg", "image/png", "image/webp"],
    maxSize = 5 * 1024 * 1024, // 5MB
  } = options;

  // Upload file directly
  const uploadFile = useCallback(async (file: File) => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Validate file type
      if (!storageService.validateFileType(file.type, allowedTypes)) {
        throw new Error(`File type not allowed. Allowed types: ${allowedTypes.join(", ")}`);
      }

      // Validate file size
      if (!storageService.validateFileSize(file.size, maxSize)) {
        throw new Error(`File too large. Maximum size: ${maxSize / 1024 / 1024}MB`);
      }

      // Create file schema validation
      fileSchema.parse({
        type: file.type,
        size: file.size,
      });

      // Generate unique filename
      const fileName = storageService.generateFileName(file.name, "user");

      // Convert file to buffer - FIXED: Use proper Buffer conversion
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer); // Use Buffer.from instead of Uint8Array

      // Upload file
      const fileUrl = await storageService.uploadFile(buffer, fileName, file.type, folder);

      setProgress(100);
      return fileUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      setError(errorMessage);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [folder, allowedTypes, maxSize]);

  // Get pre-signed URL for client-side upload
  const getPreSignedUrl = useCallback(async (file: File) => {
    try {
      // Validate file
      if (!storageService.validateFileType(file.type, allowedTypes)) {
        throw new Error(`File type not allowed. Allowed types: ${allowedTypes.join(", ")}`);
      }

      if (!storageService.validateFileSize(file.size, maxSize)) {
        throw new Error(`File too large. Maximum size: ${maxSize / 1024 / 1024}MB`);
      }

      const fileName = storageService.generateFileName(file.name, "user");
      const presignedUrl = await storageService.getUploadUrl(fileName, file.type, folder);

      return {
        presignedUrl,
        fileName,
        publicUrl: storageService.getFileUrl(fileName),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to get upload URL";
      setError(errorMessage);
      throw error;
    }
  }, [folder, allowedTypes, maxSize]);

  // Upload multiple files
  const uploadMultipleFiles = useCallback(async (files: File[]) => {
    const uploadPromises = files.map(file => uploadFile(file));
    return Promise.all(uploadPromises);
  }, [uploadFile]);

  // Delete file
  const deleteFile = useCallback(async (fileUrl: string) => {
    try {
      // Extract key from URL
      const key = fileUrl.split("/").pop();
      if (!key) throw new Error("Invalid file URL");

      await storageService.deleteFile(key);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Delete failed";
      setError(errorMessage);
      throw error;
    }
  }, []);

  // Simulate progress (for large files)
  const simulateProgress = useCallback(() => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setProgress(currentProgress);
      
      if (currentProgress >= 90) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return {
    // State
    isUploading,
    progress,
    error,
    
    // Actions
    uploadFile,
    uploadMultipleFiles,
    getPreSignedUrl,
    deleteFile,
    
    // Utilities
    clearError: () => setError(null),
    validateFile: (file: File) => {
      const typeValid = storageService.validateFileType(file.type, allowedTypes);
      const sizeValid = storageService.validateFileSize(file.size, maxSize);
      return { typeValid, sizeValid, isValid: typeValid && sizeValid };
    },
  };
};