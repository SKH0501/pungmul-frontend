import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

const typeLabel = {
  REGULAR: '정기공연',
  FESTIVAL: '축제',
  EXCHANGE: '교류공연',
  BUSKING: '버스킹'
}

function HomePage() {
  const [performances, setPerformances] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/api/performances', {
      params: { upcoming: true, sort: 'performedAt', page: 0, size: 5 }
    })
      .then(res => setPerformances(res.data.content))  // ✅ .content 추가
      .catch(err => console.log(err))
  }, [])

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-lg font-bold mb-3">🥁 예정된 공연</h2>
      {performances.length === 0 && (
        <p className="text-gray-400 text-sm">예정된 공연이 없어요</p>
      )}
      {performances.map(p => (
        <div
          key={p.id}
          onClick={() => navigate(`/performances/${p.id}`)}
          className="border rounded-lg p-4 mb-3 cursor-pointer hover:bg-gray-50">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
              {typeLabel[p.performanceType]}
            </span>
            <span className="text-xs text-blue-500">{p.clubName}</span>
          </div>
          <h3 className="font-bold">{p.title}</h3>
          <p className="text-sm text-gray-500">📍 {p.location}</p>
          <p className="text-sm text-gray-500">
            📅 {new Date(p.performedAt).toLocaleDateString('ko-KR', {
              year: 'numeric', month: 'long', day: 'numeric',
              hour: '2-digit', minute: '2-digit'
            })}
          </p>
        </div>
      ))}
    </div>
  )
}

export default HomePage