import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const imageDir = path.join(process.cwd(), 'attached_assets', 'product_images');
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
}

interface Prompt {
  name: string;
  prompt: string;
  filename: string;
}

async function downloadImage(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        if (response.headers.location) {
          downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
          return;
        }
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
      
      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  console.log('🎨 Iniciando download de imagens dos produtos...\n');
  
  const promptsPath = path.join(process.cwd(), 'scripts', 'product-image-prompts.json');
  
  if (!fs.existsSync(promptsPath)) {
    console.error('❌ Arquivo de prompts não encontrado. Execute generate-product-images.ts primeiro.');
    return;
  }
  
  const prompts: Prompt[] = JSON.parse(fs.readFileSync(promptsPath, 'utf-8'));
  
  console.log(`📊 Total de ${prompts.length} produtos para processar\n`);
  console.log('⚠️  IMPORTANTE: Este script está preparado para usar a ferramenta de busca');
  console.log('   de imagens. As URLs das imagens devem ser fornecidas manualmente\n');
  
  console.log('📝 Lista de produtos e prompts para busca:\n');
  console.log('=' .repeat(80));
  
  for (let i = 0; i < prompts.length; i++) {
    const p = prompts[i];
    console.log(`\n[${i + 1}/${prompts.length}] ${p.name}`);
    console.log(`Arquivo: ${p.filename}`);
    console.log(`Prompt: ${p.prompt}`);
    console.log('-'.repeat(80));
  }
  
  console.log('\n✅ Lista de prompts exibida.');
  console.log('\n📌 Próximos passos:');
  console.log('   1. Use os prompts acima para buscar imagens');
  console.log('   2. As imagens devem ser salvas em: attached_assets/product_images/');
  console.log('   3. Execute update-database-images.ts para atualizar o banco de dados');
}

main().catch(console.error);
