import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'

function PerformanceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [performance, setPerformance] = useState(null)
  const [reviews, setReviews] = useState([])
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.get(`/api/performances/${id}`)
      .then(res => setPerformance(res.data))
      .catch(err => console.log(err))

    loadReviews()
  }, [id])

  const loadReviews = () => {
    api.get(`/api/reviews?performanceId=${id}`)
      .then(res => setReviews(res.data))
      .catch(err => console.log(err))
  }

  const handleSubmit = () => {
    if (!content.trim()) return
    setSubmitting(true)
    api.post('/api/reviews', {
      content,
      performanceId: Number(id),
      userId: 4  // 임시! 나중에 OAuth로 대체
    })
      .then(() => {
        setContent('')
        loadReviews()
      })
      .catch(err => console.log(err))
      .finally(() => setSubmitting(false))
  }

  if (!performance) return <div className="p-6">로딩중...</div>

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-gray-500 mb-4 hover:text-black">
        ← 뒤로가기
      </button>

      <div className="border rounded-lg p-6 mb-6">
        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
          {performance.performanceType}
        </span>
        <h1 className="text-2xl font-bold mt-3 mb-2">{performance.title}</h1>
        <p className="text-gray-500 mb-1">{performance.location}</p>
        <p className="text-gray-500 mb-1">{performance.performedAt}</p>
        <p className="text-blue-500 text-sm">{performance.clubName}</p>
        {performance.description && (
          <p className="mt-4 text-gray-700">{performance.description}</p>
        )}
      </div>

      {/* 후기 작성 폼 */}
      <div className="border rounded-lg p-4 mb-6">
        <h3 className="font-semibold mb-2">후기 작성</h3>
        <textarea
          className="w-full border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-300"
          rows={3}
          placeholder="공연 후기를 남겨보세요!"
          value={content}
          onChange={e => setContent(e.target.value)}
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50">
            {submitting ? '등록중...' : '후기 등록'}
          </button>
        </div>
      </div>

      {/* 후기 목록 */}
      <h2 className="text-lg font-bold mb-3">후기 ({reviews.length})</h2>
      {reviews.length === 0 && (
        <p className="text-gray-400">아직 후기가 없어요</p>
      )}
      {reviews.map(r => (
        <div key={r.id} className="border rounded-lg p-4 mb-3">
          <p className="font-semibold text-sm">{r.authorName}</p>
          <p className="text-gray-700 mt-1">{r.content}</p>
          <p className="text-xs text-gray-400 mt-2">{r.createdAt}</p>
        </div>
      ))}
    </div>
  )
}

export default PerformanceDetailPage