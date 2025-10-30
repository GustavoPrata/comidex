import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File
    const imageId = formData.get('imageId') as string
    
    if (!file || !imageId) {
      return NextResponse.json(
        { error: 'Arquivo ou ID ausente' },
        { status: 400 }
      )
    }
    
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Determinar extensão baseada no tipo MIME
    const fileExtension = file.type.split('/')[1] || 'jpg'
    
    // Criar diretório attachments se não existir (sem public/)
    const attachmentsDir = path.join(process.cwd(), 'attachments')
    try {
      await mkdir(attachmentsDir, { recursive: true })
    } catch (error) {
      // Diretório já existe, ignorar erro
    }
    
    // Salvar arquivo
    const fileName = `${imageId}.${fileExtension}`
    const filePath = path.join(attachmentsDir, fileName)
    
    await writeFile(filePath, buffer)
    
    return NextResponse.json({
      success: true,
      imageId,
      fileName,
      path: `attachments/${fileName}`
    })
  } catch (error) {
    console.error('Erro ao salvar imagem:', error)
    return NextResponse.json(
      { error: 'Erro ao processar imagem' },
      { status: 500 }
    )
  }
}