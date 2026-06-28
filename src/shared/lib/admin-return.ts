export function resolveAdminReturnTo(
  returnTo: string | undefined,
  fallback: string
) {
  const normalized = returnTo?.trim();

  if (!normalized || !normalized.startsWith('/admin/')) {
    return fallback;
  }

  return normalized;
}
