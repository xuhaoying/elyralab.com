import { NextRequest, NextResponse } from 'next/server';

import { findPublishedPromptByPromptTitle } from '@/shared/models/prompt';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const title = searchParams.get('title');

    if (!title) {
      return NextResponse.json(
        { error: 'Title parameter is required' },
        { status: 400 }
      );
    }

    const result = await findPublishedPromptByPromptTitle(title);

    if (!result) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        title: result.title,
        description: result.description,
        image: result.image,
        promptTitle: result.promptTitle,
        promptDescription: result.promptDescription,
      },
    });
  } catch (error) {
    console.error('Get prompt by title error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get prompt' },
      { status: 500 }
    );
  }
}
