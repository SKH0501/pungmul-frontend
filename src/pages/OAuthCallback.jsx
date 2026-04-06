import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function OAuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (token) {
      localStorage.setItem('token', token)
      navigate('/')
    }
  }, [])

  return <div>로그인 처리중...</div>
}

export default OAuthCallback