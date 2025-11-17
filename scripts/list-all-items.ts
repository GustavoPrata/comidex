import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wlqvqrgjqowervexcosv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndscXZxcmdqcW93ZXJ2ZXhjb3N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMTE5NDUsImV4cCI6MjA3NjY4Nzk0NX0.MAZpzWMLZ8_fw4eiHAp3S6D3d6v18rDewMyX4-QMCBc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function listAllItems() {
  console.log('📋 Listando todos os itens do banco de dados...\n');
  
  const { data: items, error } = await supabase
    .from('items')
    .select('id, name, image')
    .order('name');

  if (error) {
    console.error('❌ Erro:', error);
    return;
  }

  if (!items || items.length === 0) {
    console.log('⚠️  Nenhum item encontrado');
    return;
  }

  console.log(`Total de itens: ${items.length}\n`);
  
  items.forEach((item: any, index: number) => {
    const hasImage = item.image ? '🖼️' : '❌';
    console.log(`${index + 1}. ${hasImage} ${item.name}${item.image ? ` → ${item.image}` : ''}`);
  });

  // Salvar em arquivo JSON para referência
  const fs = require('fs');
  fs.writeFileSync('scripts/all-items.json', JSON.stringify(items, null, 2));
  console.log(`\n💾 Lista salva em scripts/all-items.json`);
}

listAllItems();
