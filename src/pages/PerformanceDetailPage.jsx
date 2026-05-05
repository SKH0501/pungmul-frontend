import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'

const typeLabel = {
  REGULAR: '정기공연',
  FESTIVAL: '축제',
  EXCHANGE: '교류공연',
  BUSKING: '버스킹'
}

function PerformanceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [performance, setPerformance] = useState(null)
  const [reviews, setReviews] = useState([])
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const user = JSON.parse(localStorage.getItem('user'))

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
      performanceId: Number(id)
    })
      .then(() => {
        setContent('')
        loadReviews()
      })
      .catch(err => console.log(err))
      .finally(() => setSubmitting(false))
  }

  const handleDelete = async () => {
    if (!window.confirm('정말 삭제할까요?')) return
    try {
      await api.delete(`/api/performances/${id}`)
      navigate('/performances')
    } catch (err) {
      console.log(err)
    }
  }

  if (!performance) return <div className="p-6">로딩중...</div>

  const isAuthor = user && user.id === performance.authorId
  const isAdmin = user && user.role === 'ADMIN'
  const isCompleted = performance.status === 'COMPLETED'

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)}
        className="text-sm text-gray-500 mb-4 hover:text-black">
        ← 뒤로가기
      </button>

      {/* 포스터 이미지 */}
      {performance.posterImage ? (
        <img src={performance.posterImage} alt="포스터"
          className="w-full rounded-lg mb-6 object-cover max-h-96" />
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mb-6 flex items-center justify-center">
          <span className="text-5xl">🥁</span>
        </div>
      )}

      {/* 공연 정보 */}
      <div className="border rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
              {typeLabel[performance.performanceType]}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${isCompleted ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>
              {isCompleted ? '지난 공연' : '예정된 공연'}
            </span>
          </div>
          {(isAuthor || isAdmin) && (
            <div className="flex gap-2">
              <button onClick={() => navigate(`/performances/${id}/edit`)}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600">
                수정
              </button>
              <button onClick={handleDelete}
                className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600">
                삭제
              </button>
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold mb-3">{performance.title}</h1>
        <p className="text-sm text-gray-500 mb-1">📍 {performance.location}</p>
        <p className="text-sm text-gray-500 mb-1">
          📅 {new Date(performance.performedAt).toLocaleDateString('ko-KR', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
          })}
        </p>
        <p className="text-sm text-blue-500 mb-4">🥁 {performance.clubName}</p>

        {performance.description && (
          <p className="text-gray-700 border-t pt-4">{performance.description}</p>
        )}
      </div>

      {/* 후기 작성 */}
      {user && (
        <div className="border rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-2">
            {isCompleted ? '후기 작성' : '댓글 작성'}
          </h3>
          <textarea
            className="w-full border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-300"
            rows={3}
            placeholder={isCompleted ? '공연 후기를 남겨보세요! 🎉' : '댓글을 남겨보세요!'}
            value={content}
            onChange={e => setContent(e.target.value)}
          />
          <div className="flex justify-end mt-2">
            <button onClick={handleSubmit} disabled={submitting}
              className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50">
              {submitting ? '등록중...' : '등록'}
            </button>
          </div>
        </div>
      )}

      {/* 후기 목록 */}
      <h2 className="text-lg font-bold mb-3">
        {isCompleted ? `후기 (${reviews.length})` : `댓글 (${reviews.length})`}
      </h2>
      {reviews.length === 0 && (
        <p className="text-gray-400 text-sm">
          {isCompleted ? '아직 후기가 없어요' : '아직 댓글이 없어요'}
        </p>
      )}
      {reviews.map(r => (
        <div key={r.id} className="border rounded-lg p-4 mb-3">
          <p className="font-semibold text-sm">{r.authorName}</p>
          <p className="text-gray-700 mt-1">{r.content}</p>
          <p className="text-xs text-gray-400 mt-2">
            {new Date(r.createdAt).toLocaleDateString('ko-KR')}
          </p>
        </div>
      ))}
    </div>
  )
}

export default PerformanceDetailPage