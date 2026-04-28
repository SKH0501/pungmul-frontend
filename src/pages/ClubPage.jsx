import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

function ClubPage() {
  const [clubs, setClubs] = useState([])
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))  // ✅ 추가

  useEffect(() => {
    api.get('/api/clubs')
      .then(res => setClubs(res.data))
      .catch(err => console.log(err))
  }, [])

  const typeLabel = {
    CENTRAL: '중앙동아리',
    DEPARTMENT: '학회',
    SOCIAL: '사회패'
  }

  const typeColor = {
    CENTRAL: 'bg-purple-100 text-purple-700',
    DEPARTMENT: 'bg-amber-100 text-amber-700',
    SOCIAL: 'bg-green-100 text-green-700'
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">동아리 목록</h2>
        {/* ✅ 로그인한 사람만 만들기 버튼 보임 */}
        {user && (
          <button
            onClick={() => navigate('/clubs/new')}
            className="text-sm px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            + 동아리 만들기
          </button>
        )}
      </div>

      {clubs.length === 0 && (
        <p className="text-gray-400 text-sm text-center py-12">
          아직 등록된 동아리가 없어요
        </p>
      )}

      {clubs.map(c => (
        <div
          key={c.id}
          className="border rounded-lg p-4 mb-3 cursor-pointer hover:bg-gray-50 flex items-center gap-4"
          onClick={() => navigate(`/clubs/${c.id}`)}
        >
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700 flex-shrink-0">
            {c.name.slice(0, 2)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold">{c.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${typeColor[c.clubType]}`}>
                {typeLabel[c.clubType]}
              </span>
            </div>
            <p className="text-sm text-gray-500">{c.location}</p>
            <p className="text-sm text-gray-500">대표: {c.masterName}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ClubPage