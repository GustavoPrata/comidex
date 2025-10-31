const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase - usando as variáveis corretas
const SUPABASE_URL = 'https://wlqvqrgjqowervexcosv.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndscXZxcmdqcW93ZXJ2ZXhjb3N2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTExMTk0NSwiZXhwIjoyMDc2Njg3OTQ1fQ.jZq2k5rfvXDjzNBqAjBrWuplcF009Nnvl34jVpl5OoE';

// Criar cliente Supabase com service role (tem permissão total)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function migrateToIntegerIds() {
  console.log('🔄 Iniciando migração para IDs inteiros no Supabase...\n');
  
  try {
    // 1. Verificar estrutura atual
    console.log('📋 Verificando estrutura atual das tabelas...');
    const { data: currentStructure, error: checkError } = await supabase.rpc('query_json', {
      query_text: `
        SELECT table_name, column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND column_name = 'id' 
          AND table_name IN ('groups', 'categories', 'items', 'additionals')
        ORDER BY table_name
      `
    }).single();
    
    if (checkError) {
      console.log('⚠️ Não foi possível verificar estrutura. Continuando com migração...');
    } else {
      console.log('Estrutura atual:', currentStructure);
    }

    // 2. Executar script de migração
    console.log('\n🗑️ Removendo tabelas antigas...');
    
    // Dropar tabelas na ordem correta (respeitando dependências)
    const dropTables = [
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
      'table_sessions',
      'tablet_pedidos',
      'tablet_pedido_itens'
    ];

    for (const table of dropTables) {
      const { error } = await supabase.rpc('query_json', {
        query_text: `DROP TABLE IF EXISTS ${table} CASCADE`
      }).single();
      
      if (!error) {
        console.log(`   ✓ Tabela ${table} removida`);
      }
    }

    // 3. Criar novas tabelas com IDs inteiros
    console.log('\n✨ Criando tabelas com IDs inteiros...');
    
    // Groups
    await supabase.rpc('query_json', {
      query_text: `
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
      `
    }).single();
    console.log('   ✓ Tabela groups criada');

    // Categories
    await supabase.rpc('query_json', {
      query_text: `
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
      `
    }).single();
    console.log('   ✓ Tabela categories criada');

    // Items
    await supabase.rpc('query_json', {
      query_text: `
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
      `
    }).single();
    console.log('   ✓ Tabela items criada');

    // Additional Categories
    await supabase.rpc('query_json', {
      query_text: `
        CREATE TABLE additional_categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          sort_order INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `
    }).single();
    console.log('   ✓ Tabela additional_categories criada');

    // Additionals
    await supabase.rpc('query_json', {
      query_text: `
        CREATE TABLE additionals (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          price DECIMAL(10,2) DEFAULT 0,
          additional_category_id INTEGER REFERENCES additional_categories(id) ON DELETE SET NULL,
          active BOOLEAN DEFAULT true,
          sort_order INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `
    }).single();
    console.log('   ✓ Tabela additionals criada');

    // Restaurant Tables
    await supabase.rpc('query_json', {
      query_text: `
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
      `
    }).single();
    console.log('   ✓ Tabela restaurant_tables criada');

    // Orders
    await supabase.rpc('query_json', {
      query_text: `
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
      `
    }).single();
    console.log('   ✓ Tabela orders criada');

    // Outras tabelas auxiliares
    await supabase.rpc('query_json', {
      query_text: `
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
      `
    }).single();
    console.log('   ✓ Tabela order_items criada');

    // 4. Inserir dados de exemplo
    console.log('\n📝 Inserindo dados de exemplo...');
    
    // Inserir grupos
    const { data: groups } = await supabase
      .from('groups')
      .insert([
        { name: 'Rodízio Premium', description: 'Rodízio completo', type: 'rodizio', price: 189.00, active: true, sort_order: 1 },
        { name: 'À la Carte', description: 'Pedidos individuais', type: 'a_la_carte', active: true, sort_order: 2 },
        { name: 'Bebidas', description: 'Bebidas diversas', type: 'bebidas', active: true, sort_order: 3 }
      ])
      .select();
    console.log(`   ✓ ${groups?.length || 0} grupos criados`);

    // Inserir categorias
    const { data: categories } = await supabase
      .from('categories')
      .insert([
        { name: 'Entradas', group_id: 2, active: true, sort_order: 1 },
        { name: 'Pratos Quentes', group_id: 2, active: true, sort_order: 2 },
        { name: 'Sobremesas', group_id: 2, active: true, sort_order: 3 },
        { name: 'Refrigerantes', group_id: 3, active: true, sort_order: 1 },
        { name: 'Sucos', group_id: 3, active: true, sort_order: 2 }
      ])
      .select();
    console.log(`   ✓ ${categories?.length || 0} categorias criadas`);

    // Inserir categorias de adicionais
    const { data: additionalCats } = await supabase
      .from('additional_categories')
      .insert([
        { name: 'Molhos', sort_order: 1 },
        { name: 'Extras', sort_order: 2 }
      ])
      .select();
    console.log(`   ✓ ${additionalCats?.length || 0} categorias de adicionais criadas`);

    // Inserir adicionais
    const { data: additionals } = await supabase
      .from('additionals')
      .insert([
        { name: 'Shoyu', price: 0, additional_category_id: 1, active: true, sort_order: 1 },
        { name: 'Tarê', price: 0, additional_category_id: 1, active: true, sort_order: 2 },
        { name: 'Wasabi', price: 2, additional_category_id: 1, active: true, sort_order: 3 },
        { name: 'Gengibre', price: 0, additional_category_id: 1, active: true, sort_order: 4 },
        { name: 'Cream Cheese Extra', price: 5, additional_category_id: 2, active: true, sort_order: 1 },
        { name: 'Salmão Extra', price: 8, additional_category_id: 2, active: true, sort_order: 2 }
      ])
      .select();
    console.log(`   ✓ ${additionals?.length || 0} adicionais criados`);

    // Inserir alguns produtos
    const { data: items } = await supabase
      .from('items')
      .insert([
        { name: 'Sushi Salmão', description: '10 unidades', price: 35.90, category_id: 1, group_id: 2, active: true },
        { name: 'Hot Roll', description: '8 unidades', price: 28.50, category_id: 1, group_id: 2, active: true },
        { name: 'Yakissoba', description: 'Porção individual', price: 42.00, category_id: 2, group_id: 2, active: true },
        { name: 'Coca-Cola', description: 'Lata 350ml', price: 6.00, category_id: 4, group_id: 3, active: true },
        { name: 'Suco de Laranja', description: 'Copo 300ml', price: 8.00, category_id: 5, group_id: 3, active: true }
      ])
      .select();
    console.log(`   ✓ ${items?.length || 0} produtos criados`);

    // 5. Verificar resultado final
    console.log('\n✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('Verificando IDs criados...\n');
    
    const { data: finalCheck } = await supabase
      .from('items')
      .select('id, name')
      .order('id')
      .limit(5);
    
    console.log('Produtos com IDs numéricos:');
    finalCheck?.forEach(item => {
      console.log(`   ID ${item.id}: ${item.name}`);
    });
    
    console.log('\n🎉 Banco Supabase agora usa IDs inteiros simples (1, 2, 3...)');
    
  } catch (error) {
    console.error('❌ Erro durante migração:', error);
    process.exit(1);
  }
}

// Executar migração
migrateToIntegerIds();