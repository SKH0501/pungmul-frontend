import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

function ClubNewPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    location: '',
    description: '',
    clubType: 'CENTRAL',
    foundedAt: ''
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // ✅ 이미지 선택 시 미리보기
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setProfileImage(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  // ✅ S3 업로드
  const uploadImage = async () => {
    if (!profileImage) return null
    const formData = new FormData()
    formData.append('file', profileImage)
    const res = await fetch('/upload', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    return await res.text()
  }


  const handleSubmit = async () => {
    if (!form.name.trim()) return alert('동아리 이름을 입력해주세요!')
    if (!form.location.trim()) return alert('학교/지역을 입력해주세요!')

    try {
      await api.post('/api/clubs', {
        ...form,
        foundedAt: form.foundedAt ? form.foundedAt + 'T00:00:00' : null
      })
      alert('동아리가 만들어졌어요! 🎉')
      navigate('/clubs')
    } catch (err) {
      alert(err.response?.data || '동아리 생성 실패')
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

        <button onClick={handleSubmit}
          className="w-full py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600">
          동아리 만들기 
        </button>
      </div>
    </div>
  )
}

export default ClubNewPage