import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'

function ClubDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [club, setClub] = useState(null)
  const [joinRequests, setJoinRequests] = useState([])
  const [joinStatus, setJoinStatus] = useState(null) // null, 'PENDING', 'joined'
  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    api.get(`/api/clubs/${id}`)
      .then(res => setClub(res.data))
      .catch(err => console.log(err))
  }, [id])

  // ✅ master면 신청 목록 가져오기
  useEffect(() => {
    if (!club || !user) return
    if (user.id === club.masterId) {
      api.get(`/api/clubs/${id}/requests`)
        .then(res => setJoinRequests(res.data))
        .catch(err => console.log(err))
    }
  }, [club])

  if (!club) return <div className="p-6">로딩중...</div>

  const isMaster = user && user.id === club.masterId

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

  // ✅ 가입 신청
  const handleJoin = async () => {
    try {
      await api.post(`/api/clubs/${id}/join`)
      setJoinStatus('PENDING')
      alert('가입 신청 완료! 대표자 승인을 기다려주세요 😄')
    } catch (err) {
      alert(err.response?.data || '가입 신청 실패')
    }
  }

  // ✅ 승인
  const handleApprove = async (requestId) => {
    try {
      await api.post(`/api/clubs/${id}/requests/${requestId}/approve`)
      setJoinRequests(prev => prev.filter(r => r.requestId !== requestId))
      alert('승인 완료!')
    } catch (err) {
      console.log(err)
    }
  }

  // ✅ 거절
  const handleReject = async (requestId) => {
    try {
      await api.post(`/api/clubs/${id}/requests/${requestId}/reject`)
      setJoinRequests(prev => prev.filter(r => r.requestId !== requestId))
      alert('거절 완료!')
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

      <div className="border rounded-lg p-6 mb-4">
        <div className="flex items-center gap-4 mb-4">
          {club.profileImage ? (
            <img src={club.profileImage} alt="프로필"
              className="w-16 h-16 rounded-full object-cover" />
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

          {isMaster && (
            <div className="flex gap-2">
              <button onClick={() => navigate(`/clubs/${id}/edit`)}
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

        {/* ✅ 가입 신청 버튼 - 로그인했고, master가 아니고, 아직 신청 안 한 경우 */}
        {user && !isMaster && joinStatus !== 'PENDING' && (
          <button
            onClick={handleJoin}
            className="mt-4 w-full py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600">
            가입 신청
          </button>
        )}
        {joinStatus === 'PENDING' && (
          <p className="mt-4 text-center text-sm text-gray-500">
            ⏳ 가입 신청 중... 대표자 승인을 기다려주세요
          </p>
        )}
      </div>

      {/* ✅ master한테만 신청 목록 보임 */}
      {isMaster && (
        <div className="border rounded-lg p-6">
          <h3 className="font-bold mb-4">가입 신청 목록 ({joinRequests.length})</h3>
          {joinRequests.length === 0 ? (
            <p className="text-gray-400 text-sm">신청이 없어요</p>
          ) : (
            joinRequests.map(r => (
              <div key={r.requestId}
                className="flex items-center justify-between py-3 border-b last:border-0">
                <div>
                  <p className="font-semibold text-sm">{r.userName}</p>
                  <p className="text-xs text-gray-500">{r.userSchool}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(r.requestId)}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600">
                    승인
                  </button>
                  <button
                    onClick={() => handleReject(r.requestId)}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600">
                    거절
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default ClubDetailPage