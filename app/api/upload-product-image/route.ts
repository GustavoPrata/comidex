import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink, access } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const productName = formData.get('productName') as string;
    const productId = formData.get('productId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Por favor, envie uma imagem' },
        { status: 400 }
      );
    }

    // Generate filename based on product name or ID
    let baseName = '';
    if (productName && productName.trim() !== '') {
      // Sanitize name: remove special chars, replace spaces with underscores
      baseName = productName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9\s]/g, '') // Keep only alphanumeric and spaces
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .substring(0, 50); // Limit length
    } else if (productId) {
      baseName = productId;
    } else {
      // Fallback to timestamp if neither name nor ID
      baseName = `produto_${Date.now()}`;
    }

    const fileExtension = file.name.split('.').pop() || 'jpg';
    let fileName = `${baseName}.${fileExtension}`;
    
    // If file exists, add a number suffix to make it unique
    const uploadDir = path.join(process.cwd(), 'public', 'fotos', 'produtos');
    let filePath = path.join(uploadDir, fileName);
    let counter = 1;
    
    // Check if file exists and create unique name if needed
    while (true) {
      try {
        await access(filePath);
        // File exists, create new name
        fileName = `${baseName}_${counter}.${fileExtension}`;
        filePath = path.join(uploadDir, fileName);
        counter++;
      } catch {
        // File doesn't exist, we can use this name
        break;
      }
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/fotos/produtos
    await writeFile(filePath, buffer);

    // Return the public URL path
    const publicPath = `/fotos/produtos/${fileName}`;

    return NextResponse.json({
      url: publicPath,
      fileName: fileName,
      message: 'Imagem salva com sucesso'
    });

  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer upload da imagem' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const imagePath = searchParams.get('path');

    if (!imagePath || !imagePath.startsWith('/fotos/produtos/')) {
      return NextResponse.json(
        { error: 'Caminho de imagem inválido' },
        { status: 400 }
      );
    }

    const filePath = path.join(process.cwd(), 'public', imagePath);

    try {
      await access(filePath);
      await unlink(filePath);
    } catch {
      // File doesn't exist, that's ok
    }

    return NextResponse.json({
      message: 'Imagem removida com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover imagem:', error);
    return NextResponse.json(
      { error: 'Erro ao remover imagem' },
      { status: 500 }
    );
  }
}