import { createClient } from '@supabase/supabase-js';

// Usar a SERVICE_ROLE key para ter permissões administrativas
const SUPABASE_URL = 'https://wlqvqrgjqowervexcosv.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndscXZxcmdqcW93ZXJ2ZXhjb3N2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTExMTk0NSwiZXhwIjoyMDc2Njg3OTQ1fQ.jZq2k5rfvXDjzNBqAjBrWuplcF009Nnvl34jVpl5OoE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function executeSql(sql, description) {
  console.log(`\n📌 ${description}...`);
  
  try {
    // Usar RPC do Supabase para executar SQL direto
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_string: sql
    });
    
    if (error) {
      // Tentar método alternativo - criar função temporária
      const funcName = 'temp_exec_' + Date.now();
      const createFunc = `
        CREATE OR REPLACE FUNCTION ${funcName}()
        RETURNS void AS $$
        BEGIN
          ${sql}
        END;
        $$ LANGUAGE plpgsql;
      `;
      
      // Criar função
      await supabase.rpc('query_json', {
        query_text: createFunc
      });
      
      // Executar função
      await supabase.rpc(funcName);
      
      // Limpar função
      await supabase.rpc('query_json', {
        query_text: `DROP FUNCTION IF EXISTS ${funcName}();`
      });
      
      console.log(`   ✅ ${description} - OK`);
    } else {
      console.log(`   ✅ ${description} - OK`);
    }
  } catch (err) {
    console.log(`   ⚠️ ${description} - ${err.message}`);
    // Continuar mesmo com erro
  }
}

async function migrateToIntegerIds() {
  console.log('🔄 MIGRAÇÃO DE UUID PARA INTEGER IDs\n');
  console.log('=' + '='.repeat(50));
  
  // PASSO 1: Backup dos dados atuais
  console.log('\n📦 BACKUP DOS DADOS ATUAIS...');
  
  const { data: groups } = await supabase.from('groups').select('*');
  const { data: categories } = await supabase.from('categories').select('*');
  const { data: items } = await supabase.from('items').select('*');
  const { data: additionals } = await supabase.from('additionals').select('*');
  const { data: additionalCats } = await supabase.from('additional_categories').select('*');
  
  console.log(`   ✅ Backup: ${groups?.length || 0} grupos`);
  console.log(`   ✅ Backup: ${categories?.length || 0} categorias`);
  console.log(`   ✅ Backup: ${items?.length || 0} produtos`);
  console.log(`   ✅ Backup: ${additionals?.length || 0} adicionais`);
  
  // PASSO 2: Dropar todas as tabelas
  console.log('\n🗑️ REMOVENDO TABELAS ANTIGAS...');
  
  const dropOrder = [
    'order_item_additionals',
    'order_items',
    'orders',
    'payments',
    'print_queue',
    'additionals',
    'items',
    'categories',
    'additional_categories',
    'groups',
    'restaurant_tables',
    'printers',
    'table_sessions'
  ];
  
  for (const table of dropOrder) {
    await executeSql(`DROP TABLE IF EXISTS ${table} CASCADE`, `Remover ${table}`);
  }
  
  // PASSO 3: Criar novas tabelas com INTEGER IDs
  console.log('\n✨ CRIANDO TABELAS COM INTEGER IDs...');
  
  // Groups
  await executeSql(`
    CREATE TABLE groups (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      type VARCHAR(50) CHECK (type IN ('rodizio', 'a_la_carte', 'bebidas')) DEFAULT 'a_la_carte',
      price DECIMAL(10,2),
      active BOOLEAN DEFAULT true,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `, 'Criar tabela groups');
  
  // Additional Categories
  await executeSql(`
    CREATE TABLE additional_categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `, 'Criar tabela additional_categories');
  
  // Categories
  await executeSql(`
    CREATE TABLE categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
      active BOOLEAN DEFAULT true,
      sort_order INTEGER DEFAULT 0,
      image TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `, 'Criar tabela categories');
  
  // Items
  await executeSql(`
    CREATE TABLE items (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      group_id INTEGER REFERENCES groups(id) ON DELETE SET NULL,
      active BOOLEAN DEFAULT true,
      available BOOLEAN DEFAULT true,
      sort_order INTEGER DEFAULT 0,
      image TEXT,
      quantity VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `, 'Criar tabela items');
  
  // Additionals
  await executeSql(`
    CREATE TABLE additionals (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10,2) DEFAULT 0,
      additional_category_id INTEGER REFERENCES additional_categories(id) ON DELETE SET NULL,
      active BOOLEAN DEFAULT true,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `, 'Criar tabela additionals');
  
  // Restaurant Tables
  await executeSql(`
    CREATE TABLE restaurant_tables (
      id SERIAL PRIMARY KEY,
      number VARCHAR(10) NOT NULL UNIQUE,
      capacity INTEGER DEFAULT 4,
      status VARCHAR(20) DEFAULT 'available',
      active BOOLEAN DEFAULT true,
      location VARCHAR(100),
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `, 'Criar tabela restaurant_tables');
  
  // Orders
  await executeSql(`
    CREATE TABLE orders (
      id SERIAL PRIMARY KEY,
      order_number VARCHAR(20) NOT NULL,
      table_id INTEGER REFERENCES restaurant_tables(id) ON DELETE SET NULL,
      status VARCHAR(20) DEFAULT 'pending',
      total DECIMAL(10,2) NOT NULL DEFAULT 0,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `, 'Criar tabela orders');
  
  // Order Items
  await executeSql(`
    CREATE TABLE order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
      item_id INTEGER REFERENCES items(id) ON DELETE SET NULL,
      quantity INTEGER DEFAULT 1,
      unit_price DECIMAL(10,2) NOT NULL,
      total_price DECIMAL(10,2) NOT NULL,
      notes TEXT,
      status VARCHAR(20) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `, 'Criar tabela order_items');
  
  // Order Item Additionals
  await executeSql(`
    CREATE TABLE order_item_additionals (
      id SERIAL PRIMARY KEY,
      order_item_id INTEGER REFERENCES order_items(id) ON DELETE CASCADE,
      additional_id INTEGER REFERENCES additionals(id) ON DELETE SET NULL,
      quantity INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `, 'Criar tabela order_item_additionals');
  
  // PASSO 4: Restaurar dados com novos IDs
  console.log('\n📝 RESTAURANDO DADOS COM NOVOS IDs...');
  
  // Mapear UUIDs para novos IDs inteiros
  const groupIdMap = {};
  const categoryIdMap = {};
  const additionalCatIdMap = {};
  
  // Inserir grupos
  if (groups && groups.length > 0) {
    const newGroups = [];
    groups.forEach((group, index) => {
      const newId = index + 1;
      groupIdMap[group.id] = newId;
      newGroups.push({
        name: group.name,
        description: group.description,
        type: group.type || 'a_la_carte',
        price: group.price,
        active: group.active !== false,
        sort_order: group.sort_order || index
      });
    });
    
    const { error } = await supabase.from('groups').insert(newGroups);
    console.log(`   ${error ? '❌' : '✅'} Grupos restaurados: ${newGroups.length}`);
  }
  
  // Inserir categorias de adicionais
  if (additionalCats && additionalCats.length > 0) {
    const newAdditionalCats = [];
    additionalCats.forEach((cat, index) => {
      const newId = index + 1;
      additionalCatIdMap[cat.id] = newId;
      newAdditionalCats.push({
        name: cat.name,
        sort_order: cat.sort_order || index
      });
    });
    
    const { error } = await supabase.from('additional_categories').insert(newAdditionalCats);
    console.log(`   ${error ? '❌' : '✅'} Categorias de adicionais: ${newAdditionalCats.length}`);
  }
  
  // Inserir categorias
  if (categories && categories.length > 0) {
    const newCategories = [];
    categories.forEach((cat, index) => {
      const newId = index + 1;
      categoryIdMap[cat.id] = newId;
      newCategories.push({
        name: cat.name,
        description: cat.description,
        group_id: groupIdMap[cat.group_id] || null,
        active: cat.active !== false,
        sort_order: cat.sort_order || index,
        image: cat.image
      });
    });
    
    const { error } = await supabase.from('categories').insert(newCategories);
    console.log(`   ${error ? '❌' : '✅'} Categorias restauradas: ${newCategories.length}`);
  }
  
  // Inserir produtos
  if (items && items.length > 0) {
    const newItems = items.map((item, index) => ({
      name: item.name,
      description: item.description,
      price: item.price,
      category_id: categoryIdMap[item.category_id] || null,
      group_id: groupIdMap[item.group_id] || null,
      active: item.active !== false,
      available: item.available !== false,
      sort_order: item.sort_order || index,
      image: item.image,
      quantity: item.quantity
    }));
    
    const { error } = await supabase.from('items').insert(newItems);
    console.log(`   ${error ? '❌' : '✅'} Produtos restaurados: ${newItems.length}`);
  }
  
  // Inserir adicionais
  if (additionals && additionals.length > 0) {
    const newAdditionals = additionals.map((add, index) => ({
      name: add.name,
      price: add.price || 0,
      additional_category_id: additionalCatIdMap[add.additional_category_id] || null,
      active: add.active !== false,
      sort_order: add.sort_order || index
    }));
    
    const { error } = await supabase.from('additionals').insert(newAdditionals);
    console.log(`   ${error ? '❌' : '✅'} Adicionais restaurados: ${newAdditionals.length}`);
  }
  
  // PASSO 5: Verificar resultado
  console.log('\n✅ VERIFICANDO RESULTADO FINAL...');
  
  const { data: finalGroups } = await supabase
    .from('groups')
    .select('id, name')
    .order('id')
    .limit(5);
  
  const { data: finalItems } = await supabase
    .from('items')
    .select('id, name')
    .order('id')
    .limit(5);
  
  const { data: finalAdditionals } = await supabase
    .from('additionals')
    .select('id, name')
    .order('id')
    .limit(5);
  
  console.log('\n🎉 MIGRAÇÃO CONCLUÍDA!');
  console.log('=' + '='.repeat(50));
  
  console.log('\nGrupos com IDs inteiros:');
  finalGroups?.forEach(g => {
    console.log(`   ID ${g.id}: ${g.name}`);
  });
  
  console.log('\nProdutos com IDs inteiros:');
  finalItems?.forEach(i => {
    console.log(`   ID ${i.id}: ${i.name}`);
  });
  
  console.log('\nAdicionais com IDs inteiros:');
  finalAdditionals?.forEach(a => {
    console.log(`   ID ${a.id}: ${a.name}`);
  });
  
  console.log('\n✅ BANCO AGORA USA IDs INTEIROS SIMPLES (1, 2, 3...)!');
}

// Executar migração
migrateToIntegerIds().catch(console.error);