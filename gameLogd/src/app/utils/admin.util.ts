export const ADMIN_EMAILS: string[] = [
  'admin@example.com',
  'roshininaguru12@gmail.com',
  'admin@reviewnext.com',
  'super@admin.com'
];

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
}
