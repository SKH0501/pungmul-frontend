import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function OAuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (token) {
      localStorage.setItem('token', token)

      // 유저 정보 가져와서 저장
      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/me`, {

        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(user => {
          localStorage.setItem('user', JSON.stringify(user))
          navigate('/')
        })
        .catch(() => navigate('/'))
    }
  }, [])

  return <div className="p-6">로그인 처리중...</div>
}

export default OAuthCallback