export interface User {
  id: number
  username: string
  email: string
}

export interface Skill {
  id: number
  name: string
  description: string
  author_id: number
  author: User | null
  download_count: number
  created_at: string
  updated_at: string
}

export interface SkillListResponse {
  items: Skill[]
  total: number
  page: number
  page_size: number
}

export interface TokenResponse {
  access_token: string
  token_type: string
}
