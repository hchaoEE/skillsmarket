import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { listSkills } from '@/api/skills'
import type { Skill } from '@/types'
import styles from './Home.module.css'

export default function Home() {
  const [items, setItems] = useState<Skill[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<'created_at' | 'download_count'>('created_at')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const pageSize = 12

  useEffect(() => {
    setLoading(true)
    setError(null)
    listSkills({ q: q || undefined, page, page_size: pageSize, sort })
      .then((res) => {
        setItems(res.items)
        setTotal(res.total)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [page, q, sort])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    setLoading(true)
    listSkills({ q: q || undefined, page: 1, page_size: pageSize, sort })
      .then((res) => {
        setItems(res.items)
        setTotal(res.total)
        setPage(1)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className={styles.home}>
      <h1 className={styles.title}>浏览 Skills</h1>
      <form onSubmit={handleSearch} className={styles.search}>
        <input
          type="search"
          placeholder="搜索名称或描述…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className={styles.input}
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as 'created_at' | 'download_count')}
          className={styles.select}
        >
          <option value="created_at">最新</option>
          <option value="download_count">下载量</option>
        </select>
        <button type="submit" className={styles.btn}>
          搜索
        </button>
      </form>
      {error && <p className={styles.error}>{error}</p>}
      {loading ? (
        <p className={styles.loading}>加载中…</p>
      ) : items.length === 0 ? (
        <p className={styles.empty}>暂无 Skill，去上传一个吧。</p>
      ) : (
        <>
          <ul className={styles.grid}>
            {items.map((s) => (
              <li key={s.id} className={styles.card}>
                <Link to={`/skills/${s.id}`}>
                  <h3 className={styles.cardTitle}>{s.name}</h3>
                  <p className={styles.cardDesc}>{s.description}</p>
                  <p className={styles.meta}>
                    {s.author?.username ?? '未知'} · 下载 {s.download_count}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className={styles.pageBtn}
              >
                上一页
              </button>
              <span>
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className={styles.pageBtn}
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
