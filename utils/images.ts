import { storageService } from "@/lib/storage";

// Allowed image types
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

// Maximum file size (5MB)
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

// Image dimensions
export const IMAGE_DIMENSIONS = {
  THUMBNAIL: { width: 300, height: 200 },
  MEDIUM: { width: 800, height: 600 },
  LARGE: { width: 1200, height: 800 },
  COVER: { width: 1920, height: 1080 },
} as const;

/**
 * Validate image file
 */
export function validateImageFile(file: File): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
    errors.push(`File type not allowed. Allowed types: ${ALLOWED_IMAGE_TYPES.join(", ")}`);
  }
  
  // Check file size
  if (file.size > MAX_IMAGE_SIZE) {
    errors.push(`File too large. Maximum size: ${MAX_IMAGE_SIZE / 1024 / 1024}MB`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generate image URL with transformations
 */
export function generateImageUrl(
  imageUrl: string,
  transformations?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "webp" | "jpeg" | "png";
    fit?: "cover" | "contain" | "fill";
  }
): string {
  if (!imageUrl) return "";
  
  // If using Cloudinary or similar service, you would add transformation parameters
  // For now, we'll return the original URL
  // In a real implementation, this would add transformation parameters to the URL
  
  const { width, height, quality, format, fit } = transformations || {};
  
  if (imageUrl.includes("cloudinary.com") && (width || height || quality || format)) {
    const baseUrl = imageUrl.split("/upload/")[0];
    const imagePath = imageUrl.split("/upload/")[1];
    
    const transforms = [];
    if (width && height) transforms.push(`c_${fit || "cover"},w_${width},h_${height}`);
    else if (width) transforms.push(`w_${width}`);
    else if (height) transforms.push(`h_${height}`);
    
    if (quality) transforms.push(`q_${quality}`);
    if (format) transforms.push(`f_${format}`);
    
    const transformString = transforms.length > 0 ? transforms.join(",") + "/" : "";
    return `${baseUrl}/upload/${transformString}${imagePath}`;
  }
  
  return imageUrl;
}

/**
 * Generate thumbnail URL
 */
export function generateThumbnailUrl(imageUrl: string): string {
  return generateImageUrl(imageUrl, {
    width: IMAGE_DIMENSIONS.THUMBNAIL.width,
    height: IMAGE_DIMENSIONS.THUMBNAIL.height,
    quality: 80,
    format: "webp",
    fit: "cover",
  });
}

/**
 * Generate optimized image URL for web
 */
export function generateOptimizedImageUrl(
  imageUrl: string,
  size: "thumbnail" | "medium" | "large" | "cover" = "medium"
): string {
  const dimensions = IMAGE_DIMENSIONS[size.toUpperCase() as keyof typeof IMAGE_DIMENSIONS];
  return generateImageUrl(imageUrl, {
    width: dimensions.width,
    height: dimensions.height,
    quality: 85,
    format: "webp",
    fit: "cover",
  });
}

/**
 * Preload images for better performance
 */
export function preloadImages(imageUrls: string[]): Promise<void[]> {
  const promises = imageUrls.map(url => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  });
  
  return Promise.all(promises);
}

/**
 * Get dominant color from image (client-side)
 */
export async function getImageDominantColor(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      let r = 0, g = 0, b = 0;
      let count = 0;
      
      // Sample pixels for performance
      for (let i = 0; i < data.length; i += 16) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
      }
      
      r = Math.floor(r / count);
      g = Math.floor(g / count);
      b = Math.floor(b / count);
      
      resolve(`rgb(${r}, ${g}, ${b})`);
    };
    
    img.onerror = () => reject(new Error("Failed to load image for color analysis"));
    img.src = imageUrl;
  });
}

/**
 * Compress image before upload
 */
export function compressImage(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: "jpeg" | "png" | "webp";
  } = {}
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const { maxWidth = 1920, maxHeight = 1080, quality = 0.8, format = "jpeg" } = options;
    
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }
    
    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress image
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to compress image"));
          }
        },
        `image/${format}`,
        quality
      );
    };
    
    img.onerror = () => reject(new Error("Failed to load image for compression"));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Generate image alt text for accessibility
 */
export function generateImageAltText(
  imageContext: string,
  details?: {
    propertyType?: string;
    roomType?: string;
    location?: string;
  }
): string {
  const { propertyType, roomType, location } = details || {};
  
  let altText = imageContext;
  
  if (propertyType) {
    altText += ` of ${propertyType}`;
  }
  
  if (roomType) {
    altText += ` ${roomType}`;
  }
  
  if (location) {
    altText += ` in ${location}`;
  }
  
  return altText;
}

/**
 * Create image gallery from multiple images
 */
export function createImageGallery(
  images: string[],
  options: {
    mainImageIndex?: number;
    showThumbnails?: boolean;
    autoPlay?: boolean;
  } = {}
) {
  const { mainImageIndex = 0, showThumbnails = true, autoPlay = false } = options;
  
  return {
    images,
    mainImage: images[mainImageIndex] || "",
    thumbnails: showThumbnails ? images.map(url => generateThumbnailUrl(url)) : [],
    currentIndex: mainImageIndex,
    total: images.length,
    autoPlay,
    
    next() {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
      this.mainImage = this.images[this.currentIndex];
    },
    
    previous() {
      this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
      this.mainImage = this.images[this.currentIndex];
    },
    
    goTo(index: number) {
      if (index >= 0 && index < this.images.length) {
        this.currentIndex = index;
        this.mainImage = this.images[this.currentIndex];
      }
    },
  };
}

/**
 * Calculate image file size in readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Check if image exists and is accessible
 */
export async function checkImageExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch (error) {
    return false;
  }
}