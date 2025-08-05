export interface UserInfo {
  id: number
  username: string
  email: string
  firstName?: string
  lastName?: string
  balance?: number
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  firstName?: string
  lastName?: string
}
