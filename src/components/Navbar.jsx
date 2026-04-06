import { Link, useNavigate } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const handleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google'
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
      <div className="flex items-center gap-6">
        <Link to="/" className="text-lg font-bold">풍물 커뮤니티</Link>
        <Link to="/performances" className="text-sm text-gray-600 hover:text-black">공연</Link>
        <Link to="/clubs" className="text-sm text-gray-600 hover:text-black">동아리</Link>
      </div>
      <div>
        {token ? (
          <button
            onClick={handleLogout}
            className="text-sm px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            로그아웃
          </button>
        ) : (
          <button
            onClick={handleLogin}
            className="text-sm px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            구글 로그인
          </button>
        )}
      </div>
    </nav>
  )
}

export default Navbar