import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo inválido. Use JPG, PNG ou WebP' },
        { status: 400 }
      );
    }

    // Create unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const extension = file.name.split('.').pop();
    const filename = `item-${timestamp}-${random}.${extension}`;
    
    // Create fotos directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'fotos');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    
    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filepath = path.join(uploadDir, filename);
    
    await writeFile(filepath, buffer);
    
    // Return the public URL
    const publicUrl = `/fotos/${filename}`;
    
    return NextResponse.json({ 
      url: publicUrl,
      filename: filename,
      message: 'Imagem enviada com sucesso' 
    });
    
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    return NextResponse.json(
      { error: 'Erro ao processar imagem' },
      { status: 500 }
    );
  }
}