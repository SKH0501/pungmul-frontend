import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

function Navbar() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const user = token ? JSON.parse(localStorage.getItem('user')) : null
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/oauth2/authorization/google`
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
    setMenuOpen(false)
  }

  return (
    <nav className="border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        {/* 로고 */}
        <Link to="/" className="text-lg font-bold">풍물 커뮤니티</Link>

        {/* 데스크탑 메뉴 */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/performances" className="text-sm text-gray-600 hover:text-black">공연</Link>
          <Link to="/clubs" className="text-sm text-gray-600 hover:text-black">동아리</Link>
          <Link to="/training" className="text-sm text-gray-600 hover:text-black">트레이닝</Link>
        </div>

        {/* 데스크탑 유저 */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link to="/profile" className="flex items-center gap-2">
                {user.profileImage ? (
                  <img src={user.profileImage} alt="프로필"
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700">
                    {user.name[0]}
                  </div>
                )}
                <span className="text-sm text-gray-700">{user.name}</span>
              </Link>
              <button onClick={handleLogout}
                className="text-sm px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                로그아웃
              </button>
            </>
          ) : (
            <button onClick={handleLogin}
              className="text-sm px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              구글 로그인
            </button>
          )}
        </div>

        {/* 모바일 햄버거 버튼 */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}>
          <span className={`block w-6 h-0.5 bg-gray-700 transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-gray-700 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-gray-700 transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 px-4 py-3 flex flex-col gap-3">
          <Link to="/performances" onClick={() => setMenuOpen(false)}
            className="text-sm text-gray-600 py-2">공연</Link>
          <Link to="/clubs" onClick={() => setMenuOpen(false)}
            className="text-sm text-gray-600 py-2">동아리</Link>
          <Link to="/training" onClick={() => setMenuOpen(false)}
            className="text-sm text-gray-600 py-2">트레이닝</Link>

          <div className="border-t border-gray-100 pt-3">
            {user ? (
              <div className="flex items-center justify-between">
                <Link to="/profile" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt="프로필"
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700">
                      {user.name[0]}
                    </div>
                  )}
                  <span className="text-sm text-gray-700">{user.name}</span>
                </Link>
                <button onClick={handleLogout}
                  className="text-sm px-4 py-2 border border-gray-300 rounded-lg">
                  로그아웃
                </button>
              </div>
            ) : (
              <button onClick={handleLogin}
                className="w-full text-sm px-4 py-2 border border-gray-300 rounded-lg">
                구글 로그인
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar