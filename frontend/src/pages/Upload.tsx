import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { uploadSkill } from '@/api/skills'
import styles from './Upload.module.css'

export default function Upload() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [drag, setDrag] = useState(false)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('请选择 zip 文件')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const skill = await uploadSkill(file)
      navigate(`/skills/${skill.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : '上传失败')
    } finally {
      setLoading(false)
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDrag(false)
    const f = e.dataTransfer.files[0]
    if (f?.name.toLowerCase().endsWith('.zip')) setFile(f)
    else setError('请上传 .zip 文件')
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDrag(true)
  }

  const onDragLeave = () => setDrag(false)

  return (
    <div className={styles.upload}>
      <h1 className={styles.title}>上传 Skill</h1>
      <p className={styles.hint}>
        请将 Skill 目录打成 zip（根目录或单层目录内需包含 SKILL.md）。
      </p>
      <form onSubmit={handleSubmit}>
        <div
          className={`${styles.dropzone} ${drag ? styles.drag : ''}`}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
        >
          <input
            type="file"
            accept=".zip"
            onChange={(e) => {
              const f = e.target.files?.[0]
              setFile(f || null)
              setError(null)
            }}
            className={styles.fileInput}
          />
          {file ? (
            <p className={styles.fileName}>{file.name}</p>
          ) : (
            <p>拖拽 zip 到此处，或点击选择</p>
          )}
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" disabled={loading || !file} className={styles.btn}>
          {loading ? '上传中…' : '上传'}
        </button>
      </form>
    </div>
  )
}
