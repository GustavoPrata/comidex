import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const uploadPath = formData.get('path') as string

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      )
    }

    // Converter File para Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Criar diretório se não existir
    const dir = path.join(process.cwd(), 'public', 'attachs')
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true })
    }

    // Extrair nome do arquivo do path
    const fileName = uploadPath ? path.basename(uploadPath) : file.name
    const filePath = path.join(dir, fileName + '.png')

    // Salvar arquivo
    await writeFile(filePath, buffer)

    // Retornar caminho relativo para acesso público
    const publicPath = `/attachs/${fileName}.png`

    console.log(`📁 Arquivo salvo em: ${publicPath}`)

    return NextResponse.json({
      success: true,
      path: publicPath,
      fileName: fileName
    })
  } catch (error) {
    console.error('Erro ao fazer upload:', error)
    return NextResponse.json(
      { error: 'Erro ao processar upload' },
      { status: 500 }
    )
  }
}