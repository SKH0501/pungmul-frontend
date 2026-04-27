import { Link, useNavigate } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const user = token ? JSON.parse(localStorage.getItem('user')) : null

  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/oauth2/authorization/google`
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
      <div className="flex items-center gap-6">
        <Link to="/" className="text-lg font-bold">풍물 커뮤니티</Link>
        <Link to="/performances" className="text-sm text-gray-600 hover:text-black">공연</Link>
        <Link to="/clubs" className="text-sm text-gray-600 hover:text-black">동아리</Link>
        <Link to="/training" className="text-sm text-gray-600 hover:text-black">트레이닝</Link>
      </div>
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Link to="/profile" className="flex items-center gap-2">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="프로필"
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700">
                  {user.name[0]}
                </div>
              )}
              <span className="text-sm text-gray-700">{user.name}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              로그아웃
            </button>
          </>
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