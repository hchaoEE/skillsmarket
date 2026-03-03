const API_BASE = '/api'

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers as Record<string, string>),
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    const msg = Array.isArray(err.detail)
      ? err.detail.map((e: { msg?: string }) => e.msg || '').join(', ')
      : (err.detail || String(err) || res.statusText)
    throw new Error(msg || res.statusText)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export function apiDownloadUrl(skillId: number): string {
  return `${API_BASE}/skills/${skillId}/download`
}
