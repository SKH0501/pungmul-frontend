import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useS3Upload } from '../hooks/useS3Upload'

const typeLabel = {
  REGULAR: '정기공연',
  FESTIVAL: '축제',
  EXCHANGE: '교류공연',
  BUSKING: '버스킹'
}

function PerformanceEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { uploadFile, uploading } = useS3Upload()
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    performedAt: '',
    performanceType: 'REGULAR',
    posterImage: ''
  })

  useEffect(() => {
    api.get(`/api/performances/${id}`)
      .then(res => {
        const p = res.data
        setForm({
          title: p.title || '',
          description: p.description || '',
          location: p.location || '',
          performedAt: p.performedAt ? p.performedAt.slice(0, 16) : '',
          performanceType: p.performanceType || 'REGULAR',
          posterImage: p.posterImage || ''
        })
        if (p.posterImage) setPreviewUrl(p.posterImage)
      })
      .catch(err => console.log(err))
  }, [id])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) return alert('공연명을 입력해주세요!')
    if (!form.location.trim()) return alert('장소를 입력해주세요!')
    if (!form.performedAt) return alert('공연 날짜를 입력해주세요!')

    try {
      setSubmitting(true)

      let posterImage = form.posterImage
      if (imageFile) {
        posterImage = await uploadFile(imageFile)
      }

      await api.patch(`/api/performances/${id}`, {
        ...form,
        posterImage,
        performedAt: form.performedAt + ':00'
      })

      alert('수정됐어요! 🎉')
      navigate(`/performances/${id}`)
    } catch (err) {
      alert(err.response?.data || '수정 실패')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <button onClick={() => navigate(-1)}
        className="text-sm text-gray-500 mb-4 hover:text-black">
        ← 뒤로가기
      </button>

      <h2 className="text-xl font-bold mb-6">공연 수정</h2>

      <div className="space-y-4">

        {/* 포스터 이미지 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            포스터 이미지
          </label>
          <div
            onClick={() => document.getElementById('posterInput').click()}
            className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 overflow-hidden">
            {previewUrl ? (
              <img src={previewUrl} alt="미리보기"
                className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                <p className="text-3xl mb-1">🖼️</p>
                <p className="text-sm text-gray-400">클릭해서 포스터 변경</p>
              </div>
            )}
          </div>
          <input
            id="posterInput"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* 공연명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">공연명 *</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 공연 유형 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">공연 유형 *</label>
          <select
            name="performanceType"
            value={form.performanceType}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            {Object.entries(typeLabel).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* 장소 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">장소 *</label>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 공연 날짜/시간 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">공연 날짜/시간 *</label>
          <input
            type="datetime-local"
            name="performedAt"
            value={form.performedAt}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 설명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">공연 소개</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={uploading || submitting}
          className="w-full py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 disabled:opacity-50">
          {uploading ? '이미지 업로드 중...' : submitting ? '수정 중...' : '수정 완료'}
        </button>
      </div>
    </div>
  )
}

export default PerformanceEditPage