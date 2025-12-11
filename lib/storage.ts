import { z } from "zod";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Storage schemas
export const storageSchema = {
  upload: z.object({
    fileName: z.string().min(1),
    fileType: z.string().min(1),
    fileSize: z.number().max(10 * 1024 * 1024), // 10MB max
    folder: z.string().optional(),
  }),
  signedUrl: z.object({
    fileName: z.string().min(1),
    fileType: z.string().min(1),
    folder: z.string().optional(),
    expiresIn: z.number().default(3600), // 1 hour
  }),
};

// Storage service interface
export interface StorageProvider {
  upload(file: Buffer, key: string, contentType: string): Promise<string>;
  getSignedUrl(key: string, contentType: string, expiresIn?: number): Promise<string>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
}

// S3 implementation
export class S3Storage implements StorageProvider {
  private s3: S3Client;
  private bucket: string;

  constructor() {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    this.bucket = process.env.AWS_S3_BUCKET!;
  }

  async upload(file: Buffer, key: string, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file,
      ContentType: contentType,
    });

    await this.s3.send(command);
    return this.getUrl(key);
  }

  async getSignedUrl(key: string, contentType: string, expiresIn: number = 3600) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    return await getSignedUrl(this.s3, command, { expiresIn });
  }

  async delete(key: string) {
    // Implementation for deleting files
  }

  getUrl(key: string) {
    return `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  }
}

// Local storage implementation (for development)
export class LocalStorage implements StorageProvider {
  private basePath: string;

  constructor() {
    this.basePath = process.env.STORAGE_PATH || "./uploads";
  }

  async upload(file: Buffer, key: string, contentType: string) {
    // Implementation for local file system storage
    return `/uploads/${key}`;
  }

  async getSignedUrl(key: string, contentType: string, expiresIn?: number) {
    // For local storage, return a simple URL
    return `/api/upload?key=${key}&type=${contentType}`;
  }

  async delete(key: string) {
    // Implementation for deleting local files
  }

  getUrl(key: string) {
    return `/uploads/${key}`;
  }
}

// Storage service factory
export class StorageService {
  private provider: StorageProvider;

  constructor(provider: "s3" | "local" = "s3") {
    this.provider = provider === "s3" ? new S3Storage() : new LocalStorage();
  }

  async uploadFile(file: Buffer, fileName: string, fileType: string, folder?: string) {
    const key = folder ? `${folder}/${fileName}` : fileName;
    return this.provider.upload(file, key, fileType);
  }

  async getUploadUrl(fileName: string, fileType: string, folder?: string, expiresIn: number = 3600) {
    const key = folder ? `${folder}/${fileName}` : fileName;
    return this.provider.getSignedUrl(key, fileType, expiresIn);
  }

  async deleteFile(key: string) {
    return this.provider.delete(key);
  }

  getFileUrl(key: string) {
    return this.provider.getUrl(key);
  }

  // Utility methods
  generateFileName(originalName: string, userId: string): string {
    const extension = originalName.split('.').pop();
    const timestamp = Date.now();
    return `${userId}_${timestamp}.${extension}`;
  }

  validateFileType(fileType: string, allowedTypes: string[]): boolean {
    return allowedTypes.includes(fileType);
  }

  validateFileSize(fileSize: number, maxSize: number): boolean {
    return fileSize <= maxSize;
  }
}

export const storageService = new StorageService();