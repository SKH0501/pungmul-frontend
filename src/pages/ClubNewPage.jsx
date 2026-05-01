import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useS3Upload } from '../hooks/useS3Upload'  // ✅ 추가

function ClubNewPage() {
  const navigate = useNavigate()
  const { uploadFile, uploading } = useS3Upload()  // ✅ 추가
  const [form, setForm] = useState({
    name: '',
    location: '',
    description: '',
    clubType: 'CENTRAL',
    foundedAt: ''
  })
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [submitting, setSubmitting] = useState(false)

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
    if (!form.name.trim()) return alert('동아리 이름을 입력해주세요!')
    if (!form.location.trim()) return alert('학교/지역을 입력해주세요!')

    try {
      setSubmitting(true)

      // ✅ S3 업로드
      const imageUrl = await uploadFile(imageFile)

      await api.post('/api/clubs', {
        ...form,
        profileImage: imageUrl,
        foundedAt: form.foundedAt ? form.foundedAt + 'T00:00:00' : null
      })
      alert('동아리가 만들어졌어요! 🎉')
      navigate('/clubs')
    } catch (err) {
      alert(err.response?.data || '동아리 생성 실패')
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

      <h2 className="text-xl font-bold mb-6">동아리 만들기</h2>

      <div className="space-y-4">
        {/* 이미지 업로드 */}
        <div className="flex flex-col items-center gap-2">
          <div
            onClick={() => document.getElementById('imageInput').click()}
            className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-green-300 hover:bg-green-50">
            {previewUrl ? (
              <img src={previewUrl} alt="미리보기" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl">📷</span>
            )}
          </div>
          <p className="text-xs text-gray-400">클릭해서 이미지 선택</p>
          <input
            id="imageInput"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">동아리 이름 *</label>
          <input name="name" value={form.name} onChange={handleChange}
            placeholder="예) 한울림"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">학교 / 지역 *</label>
          <input name="location" value={form.location} onChange={handleChange}
            placeholder="예) 한양대학교 ERICA캠퍼스"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">동아리 유형 *</label>
          <select name="clubType" value={form.clubType} onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="CENTRAL">중앙동아리</option>
            <option value="DEPARTMENT">학회</option>
            <option value="SOCIAL">사회패</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">창단일 (선택)</label>
          <input type="date" name="foundedAt" value={form.foundedAt} onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">소개 (선택)</label>
          <textarea name="description" value={form.description} onChange={handleChange}
            placeholder="동아리 소개를 입력해주세요"
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <button onClick={handleSubmit} disabled={uploading || submitting}
          className="w-full py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 disabled:opacity-50">
          {uploading ? '이미지 업로드 중...' : submitting ? '생성 중...' : '동아리 만들기 🥁'}
        </button>
      </div>
    </div>
  )
}

export default ClubNewPage