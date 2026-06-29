import { NextResponse } from 'next/server';

import { getAllConfigs } from '@/shared/models/config';

export async function GET() {
  try {
    const configs = await getAllConfigs();

    if (!configs.adsense_code) {
      return new NextResponse('', {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }

    const adsenseCode = configs.adsense_code.replace('ca-', '');

    const adsContent = `google.com, ${adsenseCode}, DIRECT, f08c47fec0942fa0`;

    return new NextResponse(adsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.error('get ads.txt failed:', error);
    return new NextResponse('', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}
