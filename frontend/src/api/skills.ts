import { api } from './client'
import type { Skill, SkillListResponse } from '@/types'

export interface ListParams {
  q?: string
  page?: number
  page_size?: number
  sort?: 'created_at' | 'download_count'
}

export async function listSkills(params: ListParams = {}): Promise<SkillListResponse> {
  const sp = new URLSearchParams()
  if (params.q) sp.set('q', params.q)
  if (params.page != null) sp.set('page', String(params.page))
  if (params.page_size != null) sp.set('page_size', String(params.page_size))
  if (params.sort) sp.set('sort', params.sort)
  const query = sp.toString()
  return api<SkillListResponse>(`/skills${query ? `?${query}` : ''}`)
}

export async function getSkill(id: number): Promise<Skill> {
  return api<Skill>(`/skills/${id}`)
}

export async function uploadSkill(file: File): Promise<Skill> {
  const form = new FormData()
  form.append('file', file)
  const token = localStorage.getItem('token')
  const res = await fetch('/api/skills/upload', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || String(err) || res.statusText)
  }
  return res.json()
}
