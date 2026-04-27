import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'

function ClubDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [club, setClub] = useState(null)
  const user = JSON.parse(localStorage.getItem('user'))  // 추가!

  useEffect(() => {
    api.get(`/api/clubs/${id}`)
      .then(res => setClub(res.data))
      .catch(err => console.log(err))
  }, [id])

  if (!club) return <div className="p-6">로딩중...</div>

  const isMaster = user && user.id === club.masterId  // 추가!

  const typeLabel = {
    CENTRAL: '중앙동아리',
    DEPARTMENT: '학회',
    SOCIAL: '사회패'
  }

  const handleDelete = async () => {
    if (!window.confirm('정말 삭제할까요?')) return
    try {
      await api.delete(`/api/clubs/${id}`)
      navigate('/clubs')
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-gray-500 mb-4 hover:text-black">
        ← 뒤로가기
      </button>

      <div className="border rounded-lg p-6">
        <div className="flex items-center gap-4 mb-4">
          
          
          {club.profileImage ? (
  <img
    src={club.profileImage}
    alt="프로필"
    className="w-16 h-16 rounded-full object-cover"
  />
) : (
  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700 text-xl">
    {club.name.slice(0, 2)}
  </div>
)}
          

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{club.name}</h1>
              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                {typeLabel[club.clubType]}
              </span>
            </div>
            <p className="text-gray-500">{club.location}</p>
          </div>

          {/* 대표자만 수정/삭제 버튼 표시! */}
          {isMaster && (
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/clubs/${id}/edit`)}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600">
                수정
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600">
                삭제
              </button>
            </div>
          )}
        </div>

        <div className="border-t pt-4 space-y-2">
          <p className="text-sm text-gray-600">대표: <span className="font-semibold">{club.masterName}</span></p>
          <p className="text-sm text-gray-600">멤버: <span className="font-semibold">{club.memberCount}명</span></p>
          {club.foundedAt && (
            <p className="text-sm text-gray-600">창단: <span className="font-semibold">{club.foundedAt.slice(0, 10)}</span></p>
          )}
          {club.description && (
            <p className="text-gray-700 mt-4">{club.description}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ClubDetailPage