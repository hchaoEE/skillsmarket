import { api } from './client'
import type { TokenResponse, User } from '@/types'

export async function register(username: string, email: string, password: string): Promise<User> {
  return api<User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  })
}

export async function login(username: string, password: string): Promise<TokenResponse> {
  return api<TokenResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
}
