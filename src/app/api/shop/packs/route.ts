import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive') !== 'false';

    let result;

    if (isActive && category) {
      result = await sql`
        SELECT id, name, description, category, subcategory, price, stripe_product_id, stripe_price_id, image_url, download_url, file_size, is_active, metadata, created_at, updated_at FROM shop_packs
        WHERE is_active = true AND category = ${category}
        ORDER BY created_at DESC
      `;
    } else if (isActive) {
      result = await sql`
        SELECT id, name, description, category, subcategory, price, stripe_product_id, stripe_price_id, image_url, download_url, file_size, is_active, metadata, created_at, updated_at FROM shop_packs
        WHERE is_active = true
        ORDER BY created_at DESC
      `;
    } else if (category) {
      result = await sql`
        SELECT id, name, description, category, subcategory, price, stripe_product_id, stripe_price_id, image_url, download_url, file_size, is_active, metadata, created_at, updated_at FROM shop_packs
        WHERE category = ${category}
        ORDER BY created_at DESC
      `;
    } else {
      result = await sql`
        SELECT id, name, description, category, subcategory, price, stripe_product_id, stripe_price_id, image_url, download_url, file_size, is_active, metadata, created_at, updated_at FROM shop_packs
        ORDER BY created_at DESC
      `;
    }

    return NextResponse.json({
      packs: result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        category: row.category,
        subcategory: row.subcategory,
        price: row.price,
        stripeProductId: row.stripe_product_id,
        stripePriceId: row.stripe_price_id,
        imageUrl: row.image_url,
        downloadUrl: row.download_url,
        fileSize: row.file_size,
        isActive: row.is_active,
        metadata: row.metadata,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
    });
  } catch (error) {
    console.error('Error fetching packs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch packs' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      description,
      category,
      subcategory,
      price,
      stripeProductId,
      stripePriceId,
      imageUrl,
      downloadUrl,
      fileSize,
      isActive = true,
      metadata,
    } = body;

    if (!id || !name || !category || price === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: id, name, category, price' },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO shop_packs (
        id, name, description, category, subcategory, price,
        stripe_product_id, stripe_price_id, image_url, download_url,
        file_size, is_active, metadata
      )
      VALUES (
        ${id}, ${name}, ${description || null}, ${category}, ${subcategory || null},
        ${price}, ${stripeProductId || null}, ${stripePriceId || null},
        ${imageUrl || null}, ${downloadUrl || null}, ${fileSize || null},
        ${isActive}, ${metadata ? JSON.stringify(metadata) : null}::jsonb
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        category = EXCLUDED.category,
        subcategory = EXCLUDED.subcategory,
        price = EXCLUDED.price,
        stripe_product_id = EXCLUDED.stripe_product_id,
        stripe_price_id = EXCLUDED.stripe_price_id,
        image_url = EXCLUDED.image_url,
        download_url = EXCLUDED.download_url,
        file_size = EXCLUDED.file_size,
        is_active = EXCLUDED.is_active,
        metadata = EXCLUDED.metadata,
        updated_at = NOW()
      RETURNING *
    `;

    const pack = result.rows[0];
    return NextResponse.json({
      pack: {
        id: pack.id,
        name: pack.name,
        description: pack.description,
        category: pack.category,
        subcategory: pack.subcategory,
        price: pack.price,
        stripeProductId: pack.stripe_product_id,
        stripePriceId: pack.stripe_price_id,
        imageUrl: pack.image_url,
        downloadUrl: pack.download_url,
        fileSize: pack.file_size,
        isActive: pack.is_active,
        metadata: pack.metadata,
        createdAt: pack.created_at,
        updatedAt: pack.updated_at,
      },
    });
  } catch (error) {
    console.error('Error creating pack:', error);
    return NextResponse.json(
      { error: 'Failed to create pack' },
      { status: 500 },
    );
  }
}
