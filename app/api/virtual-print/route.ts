import { NextResponse } from "next/server";
import jsPDF from 'jspdf';

export async function POST(request: Request) {
  try {
    const { content, config, type } = await request.json();
    
    // Configurar papel
    const paperWidth = config.paperSize === 'thermal-80mm' ? 80 : 
                      config.paperSize === 'thermal-58mm' ? 58 : 
                      210; // A4
    
    const paperHeight = config.paperSize.startsWith('thermal') ? 297 : 297; // Altura padrão
    
    // Criar PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [paperWidth, paperHeight]
    });
    
    // Configurar fonte
    pdf.setFont('courier');
    pdf.setFontSize(config.fontSize || 10);
    
    // Adicionar margens
    const leftMargin = config.leftMargin || 5;
    const topMargin = config.topMargin || 10;
    
    // Processar conteúdo linha por linha
    const lines = content.split('\n');
    let y = topMargin;
    
    lines.forEach((line: string) => {
      if (y > paperHeight - config.bottomMargin) {
        pdf.addPage();
        y = topMargin;
      }
      
      // Centralizar se necessário
      if (line.includes('=') || line.includes('-')) {
        pdf.text(line, leftMargin, y);
      } else {
        pdf.text(line, leftMargin, y);
      }
      
      y += 4; // Espaçamento entre linhas
    });
    
    // Gerar PDF como base64
    const pdfBase64 = pdf.output('datauristring').split(',')[1];
    
    // Simular tempo de impressão
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return NextResponse.json({
      success: true,
      message: 'Impressão virtual realizada com sucesso',
      pdf: pdfBase64,
      filename: `print_${Date.now()}.pdf`,
      stats: {
        lines: lines.length,
        pages: Math.ceil(lines.length * 4 / (paperHeight - config.topMargin - config.bottomMargin)),
        paperUsed: lines.length * 0.01 // metros
      }
    });
  } catch (error: any) {
    console.error('Erro na impressão virtual:', error);
    return NextResponse.json(
      { success: false, error: error.message || "Erro ao processar impressão virtual" },
      { status: 500 }
    );
  }
}