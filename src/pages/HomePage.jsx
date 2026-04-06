import { useEffect, useState } from 'react'
import api from '../api/axios'

function HomePage() {
  const [performances, setPerformances] = useState([])

  useEffect(() => {
    api.get('/api/performances')
      .then(res => setPerformances(res.data))
      .catch(err => console.log(err))
  }, [])

return (
  <div className="p-6 max-w-3xl mx-auto">
    <h2 className="text-lg font-semibold mb-3">공연 목록</h2>
    {performances.map(p => (
      <div key={p.id} className="border rounded-lg p-4 mb-3">
        <h3 className="font-bold">{p.title}</h3>
        <p className="text-gray-500">{p.location}</p>
        <p className="text-gray-500">{p.performedAt}</p>
        <p className="text-sm text-blue-500">{p.clubName}</p>
      </div>
    ))}
  </div>
)
}

export default HomePage