import type { UserRole } from '@nexo/shared-types';

export function canAccessAdminApp(role: UserRole): boolean {
  return role === 'admin' || role === 'vendor';
}
