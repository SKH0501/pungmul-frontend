import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useS3Upload } from '../hooks/useS3Upload'
import api from '../api/axios'

function ClubEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { uploadFile, uploading } = useS3Upload()  // ✅ 훅에서 uploading 가져옴
  const [imageFile, setImageFile] = useState(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    profileImage: '',
    clubType: 'CENTRAL',
    location: '',
    foundedAt: '',
  })
  const [preview, setPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)  // ✅ uploading 제거

  useEffect(() => {
    api.get(`/api/clubs/${id}`)
      .then(res => {
        const club = res.data
        setForm({
          name: club.name || '',
          description: club.description || '',
          profileImage: club.profileImage || '',
          clubType: club.clubType || 'CENTRAL',
          location: club.location || '',
          foundedAt: club.foundedAt ? club.foundedAt.slice(0, 10) : '',
        })
        if (club.profileImage) setPreview(club.profileImage)
      })
      .catch(err => console.log(err))
  }, [id])

  // ✅ 이미지 선택만 (업로드는 저장 시점에)
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      // ✅ 새 이미지 있으면 S3 업로드
      let profileImage = form.profileImage
      if (imageFile) {
        profileImage = await uploadFile(imageFile)
      }

      await api.patch(`/api/clubs/${id}`, {
        ...form,
        profileImage,
        foundedAt: form.foundedAt ? form.foundedAt + 'T00:00:00' : null,
      })
      navigate(`/clubs/${id}`)
    } catch (err) {
      console.log(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)}
        className="text-sm text-gray-500 mb-4 hover:text-black">
        ← 뒤로가기
      </button>

      <h2 className="text-xl font-bold mb-6">동아리 수정</h2>

      {/* 프로필 이미지 업로드 */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-600 mb-2">
          프로필 이미지
        </label>
        {preview && (
          <img src={preview} alt="미리보기"
            referrerPolicy="no-referrer"
            className="w-24 h-24 object-cover rounded-full mb-3 border" />
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageChange}  // ✅ 수정
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {uploading && <p className="text-sm text-gray-400 mt-1">업로드 중...</p>}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-600 mb-2">동아리 이름</label>
        <input type="text" value={form.name}
          onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
          className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300" />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-600 mb-2">위치</label>
        <input type="text" value={form.location}
          onChange={e => setForm(prev => ({ ...prev, location: e.target.value }))}
          className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300" />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-600 mb-2">유형</label>
        <select value={form.clubType}
          onChange={e => setForm(prev => ({ ...prev, clubType: e.target.value }))}
          className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300">
          <option value="CENTRAL">중앙동아리</option>
          <option value="DEPARTMENT">학회</option>
          <option value="SOCIAL">사회패</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-600 mb-2">창단일</label>
        <input type="date" value={form.foundedAt}
          onChange={e => setForm(prev => ({ ...prev, foundedAt: e.target.value }))}
          className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-300" />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-600 mb-2">소개</label>
        <textarea value={form.description}
          onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
          rows={4}
          className="w-full border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-300" />
      </div>

      <button onClick={handleSubmit} disabled={uploading || submitting}
        className="w-full py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 disabled:opacity-50">
        {uploading ? '이미지 업로드 중...' : submitting ? '저장 중...' : '저장'}
      </button>
    </div>
  )
}

export default ClubEditPage