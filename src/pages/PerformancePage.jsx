import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

function PerformancePage() {
  const [performances, setPerformances] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/api/performances')
      .then(res => setPerformances(res.data))
      .catch(err => console.log(err))
  }, [])

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">공연 목록</h2>
      {performances.map(p => (
        <div
          key={p.id}
          className="border rounded-lg p-4 mb-3 cursor-pointer hover:bg-gray-50"
          onClick={() => navigate(`/performances/${p.id}`)}
        >
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
            {p.performanceType}
          </span>
          <h3 className="font-bold mt-2">{p.title}</h3>
          <p className="text-gray-500 text-sm">{p.location}</p>
          <p className="text-gray-500 text-sm">{p.performedAt}</p>
          <p className="text-sm text-blue-500">{p.clubName}</p>
        </div>
      ))}
    </div>
  )
}

export default PerformancePage