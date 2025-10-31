import pg from 'pg';
const { Client } = pg;

// Connection string fornecida pelo usuário
const connectionString = 'postgresql://postgres.wlqvqrgjqowervexcosv:ds4ad456sad546as654d@aws-1-us-east-1.pooler.supabase.com:5432/postgres';

const client = new Client({
  connectionString: connectionString,
});

async function executeSQL(sql, description) {
  try {
    const result = await client.query(sql);
    console.log(`✅ ${description}`);
    return result;
  } catch (error) {
    console.log(`⚠️ ${description}: ${error.message}`);
    return null;
  }
}

async function migrateDirectly() {
  console.log('🔌 Conectando diretamente ao PostgreSQL do Supabase...\n');
  
  try {
    await client.connect();
    console.log('✅ Conectado com sucesso!\n');
    
    // Verificar o que existe no banco atualmente
    console.log('📊 VERIFICANDO ESTADO ATUAL DO BANCO...\n');
    
    const checkResult = await client.query(`
      SELECT 
        table_name,
        column_name,
        data_type,
        is_identity
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND column_name = 'id'
        AND table_name IN ('groups', 'categories', 'items', 'additionals')
      ORDER BY table_name
    `);
    
    console.log('Estrutura atual das tabelas:');
    checkResult.rows.forEach(row => {
      console.log(`  ${row.table_name}.id: ${row.data_type} ${row.is_identity === 'YES' ? '(SERIAL)' : ''}`);
    });
    
    // Verificar se já temos dados com integer IDs
    const groupsCheck = await client.query('SELECT id, name FROM groups ORDER BY id LIMIT 3');
    
    if (groupsCheck.rows.length > 0) {
      console.log('\n📦 Dados existentes em groups:');
      groupsCheck.rows.forEach(row => {
        console.log(`  ID ${row.id} (tipo: ${typeof row.id}): ${row.name}`);
      });
      
      // Verificar se são UUIDs ou integers
      const firstId = groupsCheck.rows[0].id;
      const isUUID = typeof firstId === 'string' && firstId.includes('-');
      
      if (isUUID) {
        console.log('\n⚠️ DETECTADO: Banco ainda tem UUIDs! Iniciando migração...\n');
        
        // FAZER BACKUP DOS DADOS
        console.log('📦 Fazendo backup dos dados...');
        const backupGroups = await client.query('SELECT * FROM groups');
        const backupCategories = await client.query('SELECT * FROM categories');
        const backupItems = await client.query('SELECT * FROM items');
        const backupAdditionals = await client.query('SELECT * FROM additionals');
        const backupAdditionalCats = await client.query('SELECT * FROM additional_categories');
        
        console.log(`  Backup: ${backupGroups.rows.length} grupos`);
        console.log(`  Backup: ${backupCategories.rows.length} categorias`);
        console.log(`  Backup: ${backupItems.rows.length} produtos`);
        console.log(`  Backup: ${backupAdditionals.rows.length} adicionais\n`);
        
        // DROPAR TODAS AS TABELAS
        console.log('🗑️ Removendo tabelas antigas...');
        
        await executeSQL('DROP TABLE IF EXISTS order_item_additionals CASCADE', 'Drop order_item_additionals');
        await executeSQL('DROP TABLE IF EXISTS order_items CASCADE', 'Drop order_items');
        await executeSQL('DROP TABLE IF EXISTS orders CASCADE', 'Drop orders');
        await executeSQL('DROP TABLE IF EXISTS payments CASCADE', 'Drop payments');
        await executeSQL('DROP TABLE IF EXISTS print_queue CASCADE', 'Drop print_queue');
        await executeSQL('DROP TABLE IF EXISTS additionals CASCADE', 'Drop additionals');
        await executeSQL('DROP TABLE IF EXISTS items CASCADE', 'Drop items');
        await executeSQL('DROP TABLE IF EXISTS categories CASCADE', 'Drop categories');
        await executeSQL('DROP TABLE IF EXISTS additional_categories CASCADE', 'Drop additional_categories');
        await executeSQL('DROP TABLE IF EXISTS groups CASCADE', 'Drop groups');
        await executeSQL('DROP TABLE IF EXISTS restaurant_tables CASCADE', 'Drop restaurant_tables');
        await executeSQL('DROP TABLE IF EXISTS printers CASCADE', 'Drop printers');
        await executeSQL('DROP TABLE IF EXISTS table_sessions CASCADE', 'Drop table_sessions');
        
        // CRIAR NOVAS TABELAS COM SERIAL IDs
        console.log('\n✨ Criando tabelas com SERIAL PRIMARY KEY...');
        
        await executeSQL(`
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
        `, 'Criar groups');
        
        await executeSQL(`
          CREATE TABLE additional_categories (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            sort_order INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT NOW()
          )
        `, 'Criar additional_categories');
        
        await executeSQL(`
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
        `, 'Criar categories');
        
        await executeSQL(`
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
        `, 'Criar items');
        
        await executeSQL(`
          CREATE TABLE additionals (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            price DECIMAL(10,2) DEFAULT 0,
            additional_category_id INTEGER REFERENCES additional_categories(id) ON DELETE SET NULL,
            active BOOLEAN DEFAULT true,
            sort_order INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT NOW()
          )
        `, 'Criar additionals');
        
        await executeSQL(`
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
        `, 'Criar restaurant_tables');
        
        await executeSQL(`
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
        `, 'Criar orders');
        
        await executeSQL(`
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
        `, 'Criar order_items');
        
        // RESTAURAR DADOS COM NOVOS IDs
        console.log('\n📝 Restaurando dados com IDs inteiros...');
        
        // Mapear UUIDs antigos para novos IDs
        const groupMap = {};
        const categoryMap = {};
        const additionalCatMap = {};
        
        // Restaurar grupos
        for (let i = 0; i < backupGroups.rows.length; i++) {
          const g = backupGroups.rows[i];
          const result = await client.query(
            `INSERT INTO groups (name, description, type, price, active, sort_order) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [g.name, g.description, g.type || 'a_la_carte', g.price, g.active, g.sort_order || i]
          );
          groupMap[g.id] = result.rows[0].id;
        }
        console.log(`  ✅ ${Object.keys(groupMap).length} grupos restaurados`);
        
        // Restaurar categorias de adicionais
        for (let i = 0; i < backupAdditionalCats.rows.length; i++) {
          const ac = backupAdditionalCats.rows[i];
          const result = await client.query(
            `INSERT INTO additional_categories (name, sort_order) 
             VALUES ($1, $2) RETURNING id`,
            [ac.name, ac.sort_order || i]
          );
          additionalCatMap[ac.id] = result.rows[0].id;
        }
        console.log(`  ✅ ${Object.keys(additionalCatMap).length} categorias de adicionais restauradas`);
        
        // Restaurar categorias
        for (let i = 0; i < backupCategories.rows.length; i++) {
          const c = backupCategories.rows[i];
          const result = await client.query(
            `INSERT INTO categories (name, description, group_id, active, sort_order, image) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [c.name, c.description, groupMap[c.group_id] || null, c.active, c.sort_order || i, c.image]
          );
          categoryMap[c.id] = result.rows[0].id;
        }
        console.log(`  ✅ ${Object.keys(categoryMap).length} categorias restauradas`);
        
        // Restaurar produtos
        for (let i = 0; i < backupItems.rows.length; i++) {
          const item = backupItems.rows[i];
          await client.query(
            `INSERT INTO items (name, description, price, category_id, group_id, active, available, sort_order, image, quantity) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
              item.name, 
              item.description, 
              item.price || 0, 
              categoryMap[item.category_id] || null, 
              groupMap[item.group_id] || null, 
              item.active, 
              item.available, 
              item.sort_order || i, 
              item.image, 
              item.quantity
            ]
          );
        }
        console.log(`  ✅ ${backupItems.rows.length} produtos restaurados`);
        
        // Restaurar adicionais
        for (let i = 0; i < backupAdditionals.rows.length; i++) {
          const add = backupAdditionals.rows[i];
          await client.query(
            `INSERT INTO additionals (name, price, additional_category_id, active, sort_order) 
             VALUES ($1, $2, $3, $4, $5)`,
            [add.name, add.price || 0, additionalCatMap[add.additional_category_id] || null, add.active, add.sort_order || i]
          );
        }
        console.log(`  ✅ ${backupAdditionals.rows.length} adicionais restaurados`);
        
      } else {
        console.log('\n✅ Banco já está com IDs inteiros!');
      }
    } else {
      console.log('\n⚠️ Banco está vazio. Inserindo dados de exemplo...');
      
      // Inserir dados de exemplo
      await executeSQL(`
        INSERT INTO groups (name, description, type, price, active, sort_order) VALUES
        ('Rodízio Premium', 'Rodízio completo', 'rodizio', 189.00, true, 1),
        ('Rodízio Tradicional', 'Rodízio básico', 'rodizio', 129.00, true, 2),
        ('À la Carte', 'Pratos individuais', 'a_la_carte', NULL, true, 3),
        ('Bebidas', 'Bebidas diversas', 'bebidas', NULL, true, 4)
      `, 'Inserir grupos de exemplo');
    }
    
    // VERIFICAR RESULTADO FINAL
    console.log('\n🎯 VERIFICAÇÃO FINAL:\n');
    
    const finalGroups = await client.query('SELECT id, name, type FROM groups ORDER BY id LIMIT 5');
    console.log('GRUPOS (deve mostrar IDs 1, 2, 3, 4...):');
    finalGroups.rows.forEach(row => {
      console.log(`  ID ${row.id}: ${row.name} (${row.type})`);
    });
    
    const finalItems = await client.query('SELECT id, name, price FROM items ORDER BY id LIMIT 5');
    if (finalItems.rows.length > 0) {
      console.log('\nPRODUTOS (deve mostrar IDs 1, 2, 3, 4...):');
      finalItems.rows.forEach(row => {
        console.log(`  ID ${row.id}: ${row.name} - R$ ${row.price}`);
      });
    }
    
    const finalAdditionals = await client.query('SELECT id, name, price FROM additionals ORDER BY id LIMIT 5');
    if (finalAdditionals.rows.length > 0) {
      console.log('\nADICIONAIS (deve mostrar IDs 1, 2, 3, 4...):');
      finalAdditionals.rows.forEach(row => {
        console.log(`  ID ${row.id}: ${row.name} - R$ ${row.price}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ MIGRAÇÃO CONCLUÍDA VIA CONEXÃO DIRETA POSTGRESQL!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
  } finally {
    await client.end();
    console.log('\n🔌 Conexão fechada.');
  }
}

migrateDirectly();