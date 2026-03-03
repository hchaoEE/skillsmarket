import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { register as apiRegister, login } from '@/api/auth'
import styles from './Auth.module.css'

export default function Register() {
  const { login: setAuth, setUser } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const user = await apiRegister(username, email, password)
      setUser(user)
      const { access_token } = await login(username, password)
      setAuth(access_token)
      navigate('/')
    } catch (e) {
      setError(e instanceof Error ? e.message : '注册失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>注册</h1>
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
          type="email"
          placeholder="邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={styles.input}
          autoComplete="email"
        />
        <input
          type="password"
          placeholder="密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={styles.input}
          autoComplete="new-password"
        />
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" disabled={loading} className={styles.btn}>
          {loading ? '注册中…' : '注册'}
        </button>
      </form>
      <p className={styles.footer}>
        已有账号？ <Link to="/login">登录</Link>
      </p>
    </div>
  )
}
