import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

function TrainingPage() {
  const [garaks, setGaraks] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/api/garaks')
      .then(res => setGaraks(res.data))
      .catch(err => console.log(err))
  }, [])

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-2">장구 트레이닝</h2>
      <p className="text-gray-500 text-sm mb-6">
        가락을 선택하고 영상을 보면서 따라쳐봐요!
      </p>

      <div className="grid grid-cols-1 gap-4">
        {garaks.map(g => (
          <div
            key={g.id}
            onClick={() => navigate(`/training/${g.id}`)}
            className="border rounded-lg p-5 cursor-pointer hover:bg-gray-50"
          >
            <h3 className="font-bold text-lg mb-1">{g.name}</h3>
            <p className="text-sm text-gray-500">{g.description}</p>
            <span className="mt-3 inline-block text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
              연습 시작 →
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TrainingPage