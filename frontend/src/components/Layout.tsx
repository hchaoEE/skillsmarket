import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import styles from './Layout.module.css'

export default function Layout() {
  const { isAuthenticated, logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>
          Skills 市场
        </Link>
        <nav className={styles.nav}>
          {isAuthenticated ? (
            <>
              <Link to="/upload">上传</Link>
              <span className={styles.user}>{user?.username || '用户'}</span>
              <button type="button" onClick={handleLogout} className={styles.btnLink}>
                退出
              </button>
            </>
          ) : (
            <>
              <Link to="/login">登录</Link>
              <Link to="/register">注册</Link>
            </>
          )}
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
