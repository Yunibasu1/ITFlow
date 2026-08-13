export type Role = 'user' | 'technician' | 'admin'

export interface User {
  id: string
  name: string
  lastname: string
  email: string
  role: Role
  department: string
  position: string
  phone: string
  photoURL: string
  status: 'active' | 'inactive'
  emailNotifications: boolean
  createdAt: Date
  updatedAt: Date
}
