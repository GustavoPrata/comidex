import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
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

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Imagem muito grande. Máximo 5MB.' },
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
    const fileName = `products/${baseName}_${Date.now()}.${fileExtension}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Supabase Storage - use 'restaurant' bucket with 'products/' prefix
    const { data, error } = await supabase.storage
      .from('restaurant')
      .upload(fileName, buffer, {
        contentType: file.type || 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase storage error:', error);
      
      // If bucket doesn't exist, try to create it
      if (error.message && (error.message.includes('bucket') || error.message.includes('not found'))) {
        const { error: bucketError } = await supabase.storage.createBucket('restaurant', {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        });
        
        if (bucketError && !bucketError.message.includes('already exists')) {
          console.error('Failed to create bucket:', bucketError);
          return NextResponse.json({ 
            error: 'Armazenamento não configurado. Verifique as configurações do Supabase.' 
          }, { status: 500 });
        }
        
        // Retry upload after creating bucket
        const { data: retryData, error: retryError } = await supabase.storage
          .from('restaurant')
          .upload(fileName, buffer, {
            contentType: file.type || 'image/jpeg',
            cacheControl: '3600',
            upsert: false
          });
          
        if (retryError) {
          throw retryError;
        }
      } else {
        throw error;
      }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('restaurant')
      .getPublicUrl(fileName);

    return NextResponse.json({
      url: publicUrl,
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
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const imagePath = searchParams.get('path');

    if (!imagePath) {
      return NextResponse.json(
        { error: 'Caminho de imagem não fornecido' },
        { status: 400 }
      );
    }

    // Extract the file path from Supabase URL or use direct path
    let filePath = imagePath;
    
    // If it's a full Supabase URL, extract the path
    if (imagePath.includes('supabase')) {
      const matches = imagePath.match(/restaurant\/(products\/[^?]+)/);
      if (matches && matches[1]) {
        filePath = matches[1];
      } else {
        return NextResponse.json(
          { error: 'URL de imagem inválida' },
          { status: 400 }
        );
      }
    } else if (imagePath.startsWith('/fotos/produtos/')) {
      // Legacy path format, convert to Supabase path
      const fileName = imagePath.replace('/fotos/produtos/', '');
      filePath = `products/${fileName}`;
    }

    // Remove from Supabase Storage
    const { error } = await supabase.storage
      .from('restaurant')
      .remove([filePath]);

    if (error) {
      console.error('Erro ao remover imagem do Supabase:', error);
      // Don't fail if image doesn't exist
      if (!error.message.includes('not found')) {
        throw error;
      }
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