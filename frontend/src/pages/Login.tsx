import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { login } from '@/api/auth'
import styles from './Auth.module.css'

export default function Login() {
  const { login: setAuth } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { access_token } = await login(username, password)
      setAuth(access_token)
      navigate('/')
    } catch (e) {
      setError(e instanceof Error ? e.message : '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>登录</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          placeholder="用户名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className={styles.input}
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={styles.input}
          autoComplete="current-password"
        />
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" disabled={loading} className={styles.btn}>
          {loading ? '登录中…' : '登录'}
        </button>
      </form>
      <p className={styles.footer}>
        没有账号？ <Link to="/register">注册</Link>
      </p>
    </div>
  )
}
