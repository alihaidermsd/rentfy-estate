"use client"

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { X, UploadCloud, FileText } from 'lucide-react'
import { useDropzone } from 'react-dropzone' // Assuming useDropzone is available

interface ImageUploadProps {
  onFilesChange: (files: File[]) => void;
  initialImageUrls?: string[];
  onRemoveImage?: (url: string) => void; // New prop for removing existing images
  maxFiles?: number;
}

export function ImageUpload({
  onFilesChange,
  initialImageUrls = [],
  onRemoveImage,
  maxFiles = 5,
}: ImageUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    setPreviewUrls(initialImageUrls);
  }, [initialImageUrls]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.filter(
      (file) => !selectedFiles.some((sf) => sf.name === file.name && sf.size === file.size)
    );
    
    const combinedFiles = [...selectedFiles, ...newFiles];
    const totalImages = previewUrls.length + combinedFiles.length;

    if (totalImages > maxFiles) {
        // You might want to show a toast or a message to the user
        return;
    }
    
    setSelectedFiles(combinedFiles);

    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);

    onFilesChange(combinedFiles);
  }, [selectedFiles, previewUrls, maxFiles, onFilesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.png', '.jpg', '.gif', '.webp'],
    },
    maxFiles: maxFiles,
    noClick: true,
  });

  const handleRemoveFile = (fileToRemove: File) => {
    const updatedFiles = selectedFiles.filter(file => file !== fileToRemove);
    setSelectedFiles(updatedFiles);
    onFilesChange(updatedFiles);

    const urlToRemove = URL.createObjectURL(fileToRemove);
    URL.revokeObjectURL(urlToRemove);
    setPreviewUrls(prev => prev.filter(url => url !== urlToRemove));
  };

  const handleRemoveInitialImage = (urlToRemove: string) => {
    if (onRemoveImage) {
      onRemoveImage(urlToRemove);
    }
    setPreviewUrls(prev => prev.filter(url => url !== urlToRemove));
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

  const allImagesCount = previewUrls.length;
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

      {(previewUrls.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {/* Display all images */}
          {previewUrls.map((url, index) => {
            const isInitial = initialImageUrls.includes(url);
            const file = isInitial ? null : selectedFiles.find(f => URL.createObjectURL(f) === url);

            return (
              <div key={`image-${index}`} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                <Image
                  src={url}
                  alt={`Property image ${index + 1}`}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="transition-transform duration-200 group-hover:scale-105"
                  onLoad={() => {
                    if (!isInitial) URL.revokeObjectURL(url)
                  }}
                />
                <button
                  type="button"
                  onClick={() => isInitial ? handleRemoveInitialImage(url) : (file && handleRemoveFile(file))}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
                {file && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                    {file.name}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {!canAddMoreFiles && (
        <p className="text-sm text-red-500 text-center">Maximum {maxFiles} images reached.</p>
      )}
    </div>
  );
}
