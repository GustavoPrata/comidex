import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const { sourceImage, newCategoryId, newCategoryName } = await request.json();

    if (!sourceImage || !newCategoryId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Extract filename from source path
    const sourceFileName = sourceImage.split('/').pop();
    if (!sourceFileName) {
      return NextResponse.json({ error: "Invalid source image path" }, { status: 400 });
    }

    // Generate new filename
    const timestamp = Date.now();
    const fileExt = sourceFileName.split('.').pop() || 'png';
    const sanitizedName = (newCategoryName || 'category')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    const newFileName = `${sanitizedName}-${newCategoryId}-${timestamp}.${fileExt}`;
    
    // Define paths
    const publicDir = path.join(process.cwd(), "public");
    const sourceFullPath = path.join(publicDir, sourceImage);
    const destDir = path.join(publicDir, "fotos", "categorias");
    const destFullPath = path.join(destDir, newFileName);
    
    // Check if source file exists
    try {
      await fs.access(sourceFullPath);
    } catch {
      // Source file doesn't exist, return original path
      return NextResponse.json({ imagePath: sourceImage });
    }
    
    // Copy the file
    await fs.copyFile(sourceFullPath, destFullPath);
    
    // Return new image path
    const newImagePath = `/fotos/categorias/${newFileName}`;
    
    return NextResponse.json({ imagePath: newImagePath });
  } catch (error) {
    console.error("Error copying image:", error);
    return NextResponse.json({ error: "Failed to copy image" }, { status: 500 });
  }
}