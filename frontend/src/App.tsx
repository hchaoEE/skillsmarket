import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import SkillDetail from '@/pages/SkillDetail'
import Upload from '@/pages/Upload'
import Login from '@/pages/Login'
import Register from '@/pages/Register'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="skills/:id" element={<SkillDetail />} />
        <Route path="upload" element={<Upload />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
