import { VerificationCode } from '@/shared/blocks/email/verification-code';
import { PERMISSIONS } from '@/core/rbac';
import { respData, respErr } from '@/shared/lib/resp';
import { getUserInfo } from '@/shared/models/user';
import { getEmailService } from '@/shared/services/email';
import { hasPermission } from '@/shared/services/rbac';

function normalizeEmails(value: unknown) {
  const emails = Array.isArray(value) ? value : [value];
  return emails
    .map((email) => String(email || '').trim().toLowerCase())
    .filter(Boolean);
}

export async function POST(req: Request) {
  try {
    const user = await getUserInfo();
    if (!user) {
      return respErr('no auth, please sign in', 401);
    }

    const allowed = await hasPermission(user.id, PERMISSIONS.SETTINGS_WRITE);
    if (!allowed) {
      return respErr('no permission to send test email', 403);
    }

    const { emails, subject } = await req.json();
    const recipients = normalizeEmails(emails);

    if (recipients.length === 0 || recipients.length > 5) {
      return respErr('Please provide 1 to 5 recipients');
    }

    if (!String(subject || '').trim()) {
      return respErr('subject is required');
    }

    const emailService = await getEmailService();

    const result = await emailService.sendEmail({
      to: recipients,
      subject: String(subject).trim(),
      react: VerificationCode({ code: '123455' }),
    });

    return respData(result);
  } catch (e) {
    console.log('send email failed:', e);
    return respErr('send email failed', 500);
  }
}
