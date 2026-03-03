import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getSkill } from '@/api/skills'
import { apiDownloadUrl } from '@/api/client'
import type { Skill } from '@/types'
import styles from './SkillDetail.module.css'

export default function SkillDetail() {
  const { id } = useParams<{ id: string }>()
  const [skill, setSkill] = useState<Skill | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    getSkill(Number(id))
      .then(setSkill)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const downloadUrl = skill ? apiDownloadUrl(skill.id) : ''
  const downloadFilename = skill ? `${skill.name}.zip` : ''

  if (loading) return <p className={styles.loading}>加载中…</p>
  if (error || !skill) return <p className={styles.error}>{error || '未找到'}</p>

  const date = skill.created_at ? new Date(skill.created_at).toLocaleDateString('zh-CN') : ''

  return (
    <div className={styles.detail}>
      <Link to="/" className={styles.back}>
        ← 返回列表
      </Link>
      <h1 className={styles.name}>{skill.name}</h1>
      <p className={styles.desc}>{skill.description}</p>
      <p className={styles.meta}>
        作者：{skill.author?.username ?? '未知'} · 下载量：{skill.download_count} · 更新于 {date}
      </p>
      <a
        href={downloadUrl}
        download={downloadFilename}
        className={styles.downloadBtn}
      >
        下载 ZIP
      </a>
      <p className={styles.hint}>
        解压后放入 <code>~/.cursor/skills/</code> 或项目 <code>.cursor/skills/</code> 使用。
      </p>
    </div>
  )
}
