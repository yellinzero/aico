import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Registry directory path
const REGISTRY_DIR = path.join(process.cwd(), '../../registry');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;

  // Security check: only allow .json suffix
  if (!name.endsWith('.json')) {
    return NextResponse.json({ error: 'Invalid file format' }, { status: 400 });
  }

  // Get filename without .json suffix
  const baseName = name.slice(0, -5);

  // Security check: prevent path traversal
  if (baseName.includes('..') || baseName.includes('/')) {
    return NextResponse.json({ error: 'Invalid file name' }, { status: 400 });
  }

  const filePath = path.join(REGISTRY_DIR, `${baseName}.json`);

  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `Registry file '${baseName}' not found` },
        { status: 404 }
      );
    }

    // Read file content
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=600',
      },
    });
  } catch (error) {
    console.error(`Error reading registry file: ${baseName}`, error);
    return NextResponse.json(
      { error: 'Failed to read registry file' },
      { status: 500 }
    );
  }
}
