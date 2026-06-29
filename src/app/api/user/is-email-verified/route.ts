import { respData, respErr } from '@/shared/lib/resp';
import { getUserInfo, isEmailVerified } from '@/shared/models/user';

export async function POST(req: Request) {
  try {
    const user = await getUserInfo();
    if (!user?.email) {
      return respErr('no auth, please sign in', 401);
    }

    const body = await req.json().catch(() => ({}));
    const email = String(body?.email || '')
      .trim()
      .toLowerCase();
    if (!email) {
      return respErr('email is required');
    }

    if (email !== user.email.toLowerCase()) {
      return respErr('cannot check another user email', 403);
    }

    const emailVerified = await isEmailVerified(email);

    return respData({ emailVerified });
  } catch (e) {
    console.log('check email verified failed:', e);
    return respErr('check email verified failed', 500);
  }
}
