import type { Role } from '../types/User'

export function redirectForRole(role: Role): string {
  switch (role) {
    case 'admin':
      return '/admin'
    case 'technician':
      return '/technician'
    default:
      return '/user'
  }
}
