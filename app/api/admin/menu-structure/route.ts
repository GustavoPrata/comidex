import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : {
    rejectUnauthorized: false
  }
});

export async function GET(request: NextRequest) {
  try {
    // Buscar grupos com suas categorias
    const groupsQuery = `
      SELECT 
        g.id,
        g.name,
        g.description,
        g.type,
        g.price,
        g.half_price,
        g.active,
        g.sort_order,
        g.icon,
        g.created_at,
        g.updated_at
      FROM groups g
      ORDER BY g.sort_order, g.id
    `;

    const categoriesQuery = `
      SELECT 
        c.id,
        c.name,
        c.description,
        c.image,
        c.active,
        c.sort_order,
        c.group_id,
        c.created_at,
        c.updated_at,
        COUNT(i.id) as item_count
      FROM categories c
      LEFT JOIN items i ON i.category_id = c.id
      GROUP BY c.id
      ORDER BY c.sort_order, c.id
    `;

    const [groupsResult, categoriesResult] = await Promise.all([
      pool.query(groupsQuery),
      pool.query(categoriesQuery)
    ]);

    const groups = groupsResult.rows;
    const categories = categoriesResult.rows;

    // Organizar categorias por grupo
    const groupsWithCategories = groups.map(group => {
      const groupCategories = categories
        .filter(cat => cat.group_id === group.id)
        .map(cat => ({
          ...cat,
          itemCount: parseInt(cat.item_count || 0)
        }));
      
      const itemCount = groupCategories.reduce((sum, cat) => sum + cat.itemCount, 0);
      
      return {
        ...group,
        categories: groupCategories,
        itemCount
      };
    });

    return NextResponse.json({
      success: true,
      groups: groupsWithCategories
    });

  } catch (error) {
    console.error('Erro ao carregar estrutura do menu:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar estrutura do menu' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (type === 'group') {
      const { name, description, type: groupType, price, half_price, active, sort_order, icon } = data;
      
      const query = `
        INSERT INTO groups (name, description, type, price, half_price, active, sort_order, icon)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      
      const result = await pool.query(query, [
        name,
        description || null,
        groupType || 'a_la_carte',
        price || null,
        half_price || null,
        active !== false,
        sort_order || 0,
        icon || null
      ]);

      return NextResponse.json({
        success: true,
        group: result.rows[0]
      });
    }

    if (type === 'category') {
      const { name, description, image, group_id, active, sort_order } = data;
      
      const query = `
        INSERT INTO categories (name, description, image, group_id, active, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      
      const result = await pool.query(query, [
        name,
        description || null,
        image || null,
        group_id,
        active !== false,
        sort_order || 0
      ]);

      return NextResponse.json({
        success: true,
        category: result.rows[0]
      });
    }

    return NextResponse.json(
      { success: false, error: 'Tipo inválido' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Erro ao criar item:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao criar item' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, id, data } = body;

    if (type === 'group') {
      const { name, description, type: groupType, price, half_price, active, sort_order, icon } = data;
      
      const query = `
        UPDATE groups 
        SET name = $2, description = $3, type = $4, price = $5, half_price = $6, 
            active = $7, sort_order = $8, icon = $9, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;
      
      const result = await pool.query(query, [
        id,
        name,
        description || null,
        groupType || 'a_la_carte',
        price || null,
        half_price || null,
        active !== false,
        sort_order || 0,
        icon || null
      ]);

      return NextResponse.json({
        success: true,
        group: result.rows[0]
      });
    }

    if (type === 'category') {
      const { name, description, image, group_id, active, sort_order } = data;
      
      const query = `
        UPDATE categories 
        SET name = $2, description = $3, image = $4, group_id = $5, 
            active = $6, sort_order = $7, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;
      
      const result = await pool.query(query, [
        id,
        name,
        description || null,
        image || null,
        group_id,
        active !== false,
        sort_order || 0
      ]);

      return NextResponse.json({
        success: true,
        category: result.rows[0]
      });
    }

    if (type === 'reorder') {
      const { items, itemType } = data;
      const table = itemType === 'group' ? 'groups' : 'categories';
      
      // Atualizar sort_order para cada item
      for (let i = 0; i < items.length; i++) {
        await pool.query(
          `UPDATE ${table} SET sort_order = $2 WHERE id = $1`,
          [items[i].id, i]
        );
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: 'Tipo inválido' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar item' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json(
        { success: false, error: 'Parâmetros inválidos' },
        { status: 400 }
      );
    }

    if (type === 'group') {
      // Deletar grupo e suas categorias
      await pool.query('DELETE FROM categories WHERE group_id = $1', [id]);
      await pool.query('DELETE FROM groups WHERE id = $1', [id]);
    } else if (type === 'category') {
      // Deletar categoria
      await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erro ao deletar item:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao deletar item' },
      { status: 500 }
    );
  }
}