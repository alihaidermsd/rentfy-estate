"use client"

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { X, UploadCloud, FileText } from 'lucide-react'
import { useDropzone } from 'react-dropzone' // Assuming useDropzone is available

interface ImageUploadProps {
  onFilesChange: (files: File[]) => void
  initialImageUrls?: string[] // For editing existing properties
  maxFiles?: number
}

export function ImageUpload({ onFilesChange, initialImageUrls = [], maxFiles = 5 }: ImageUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>(initialImageUrls)

  // Effect to update previewUrls when initialImageUrls change (e.g., for editing)
  useEffect(() => {
    setPreviewUrls(initialImageUrls);
  }, [initialImageUrls]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.filter(
      (file) => !selectedFiles.some((sf) => sf.name === file.name && sf.size === file.size) &&
                 !previewUrls.some((url) => url === URL.createObjectURL(file)) // Prevent adding already existing URLs
    );
    
    // Combine existing files with new unique files, respecting maxFiles
    const combinedFiles = [...selectedFiles, ...newFiles].slice(0, maxFiles);
    setSelectedFiles(combinedFiles);

    // Generate preview URLs for newly selected files
    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls].slice(0, maxFiles));

    onFilesChange(combinedFiles);
  }, [selectedFiles, previewUrls, maxFiles, onFilesChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.png', '.jpg', '.gif', '.webp'],
    },
    maxFiles: maxFiles - selectedFiles.length - previewUrls.length, // Limit based on already selected/initial
    noClick: true, // Prevent opening file dialog on container click, use button instead
  });

  const handleRemoveFile = (fileToRemove: File) => {
    const updatedFiles = selectedFiles.filter(file => file !== fileToRemove);
    setSelectedFiles(updatedFiles);
    onFilesChange(updatedFiles);

    // Revoke URL and update previewUrls
    const urlToRemove = URL.createObjectURL(fileToRemove);
    URL.revokeObjectURL(urlToRemove);
    setPreviewUrls(prev => prev.filter(url => url !== urlToRemove));
  };

  const handleRemoveInitialImage = (urlToRemove: string) => {
    setPreviewUrls(prev => prev.filter(url => url !== urlToRemove));
    // Here you might want to inform the parent component that an initial image was removed
    // For now, we assume initialImageUrls are passed once and handled by the parent's save logic.
    // If a more complex state management for initial images is needed, it would be added here.
  };

  const handleFileInputClick = () => {
    const inputElement = document.createElement('input');
    inputElement.type = 'file';
    inputElement.multiple = true;
    inputElement.accept = 'image/*';
    inputElement.onchange = (event) => {
      const files = (event.target as HTMLInputElement).files;
      if (files) {
        onDrop(Array.from(files));
      }
    };
    inputElement.click();
  };

  const allImagesCount = selectedFiles.length + previewUrls.length;
  const canAddMoreFiles = allImagesCount < maxFiles;

  return (
    <div className="border border-gray-300 rounded-lg p-6 space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-muted-foreground/25 hover:border-blue-300'}`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          {isDragActive ? "Drop the files here ..." : "Drag 'n' drop some files here, or click to select files"}
        </p>
        <button type="button" onClick={handleFileInputClick} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Browse Files
        </button>
        <p className="text-xs text-muted-foreground mt-2">Max {maxFiles} images. PNG, JPG, GIF, WEBP accepted.</p>
      </div>

      {(previewUrls.length > 0 || selectedFiles.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Display initial images (already uploaded) */}
          {previewUrls.map((url, index) => (
            <div key={`initial-${index}`} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
              <Image
                src={url}
                alt={`Property image ${index + 1}`}
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-200 group-hover:scale-105"
              />
              <button
                type="button"
                onClick={() => handleRemoveInitialImage(url)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {/* Display newly selected files */}
          {selectedFiles.map((file, index) => (
            <div key={`new-${file.name}-${index}`} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
              <Image
                src={URL.createObjectURL(file)}
                alt={`New image ${file.name}`}
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-200 group-hover:scale-105"
              />
              <button
                type="button"
                onClick={() => handleRemoveFile(file)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                {file.name}
              </div>
            </div>
          ))}
        </div>
      )}
      {!canAddMoreFiles && (
        <p className="text-sm text-red-500 text-center">Maximum {maxFiles} images reached.</p>
      )}
    </div>
  );
}
