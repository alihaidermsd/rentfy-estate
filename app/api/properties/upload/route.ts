import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('images') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      );
    }

    // Validate file types and sizes
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}. Allowed: ${ALLOWED_TYPES.join(', ')}` },
          { status: 400 }
        );
      }
      
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { error: `File too large: ${file.name}. Maximum size: 5MB` },
          { status: 400 }
        );
      }
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'properties');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Generate unique filename
      const fileExtension = file.name.split('.').pop();
      const uniqueFilename = `${uuidv4()}.${fileExtension}`;
      const filePath = join(uploadDir, uniqueFilename);
      
      // Save file
      await writeFile(filePath, buffer);
      
      // Generate URL for the uploaded file
      const fileUrl = `/uploads/properties/${uniqueFilename}`;
      uploadedUrls.push(fileUrl);
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      message: `Successfully uploaded ${files.length} file(s)`
    });

  } catch (error) {
    console.error('Error uploading images:', error);
    return NextResponse.json(
      { error: 'Failed to upload images' },
      { status: 500 }
    );
  }
}