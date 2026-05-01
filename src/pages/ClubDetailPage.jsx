import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'

function ClubDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [club, setClub] = useState(null)
  const [joinRequests, setJoinRequests] = useState([])
  const [members, setMembers] = useState([])
  const [joinStatus, setJoinStatus] = useState(null)
  const [activeTab, setActiveTab] = useState('info') // info, members, requests
  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    api.get(`/api/clubs/${id}`)
      .then(res => setClub(res.data))
      .catch(err => console.log(err))

    api.get(`/api/clubs/${id}/members`)
      .then(res => setMembers(res.data))
      .catch(err => console.log(err))
  }, [id])

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

  const handleJoin = async () => {
    try {
      await api.post(`/api/clubs/${id}/join`)
      setJoinStatus('PENDING')
      alert('가입 신청 완료! 대표자 승인을 기다려주세요 😄')
    } catch (err) {
      alert(err.response?.data || '가입 신청 실패')
    }
  }

  const handleApprove = async (requestId) => {
    try {
      await api.post(`/api/clubs/${id}/requests/${requestId}/approve`)
      setJoinRequests(prev => prev.filter(r => r.requestId !== requestId))
      alert('승인 완료!')
    } catch (err) {
      console.log(err)
    }
  }

  const handleReject = async (requestId) => {
    try {
      await api.post(`/api/clubs/${id}/requests/${requestId}/reject`)
      setJoinRequests(prev => prev.filter(r => r.requestId !== requestId))
    } catch (err) {
      console.log(err)
    }
  }

  const handleRoleChange = async (memberId, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'MEMBER' : 'ADMIN'
    try {
      await api.patch(`/api/clubs/${id}/members/${memberId}/role`, { role: newRole })
      setMembers(prev => prev.map(m =>
        m.memberId === memberId ? { ...m, memberRole: newRole } : m
      ))
    } catch (err) {
      alert(err.response?.data || '역할 변경 실패')
    }
  }

  const handleKick = async (memberId, userName) => {
    if (!window.confirm(`${userName}님을 강퇴할까요?`)) return
    try {
      await api.delete(`/api/clubs/${id}/members/${memberId}`)
      setMembers(prev => prev.filter(m => m.memberId !== memberId))
    } catch (err) {
      alert(err.response?.data || '강퇴 실패')
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)}
        className="text-sm text-gray-500 mb-4 hover:text-black">
        ← 뒤로가기
      </button>

      {/* 헤더 */}
      <div className="border rounded-lg p-6 mb-4">
        <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
          {club.profileImage ? (
            <img src={club.profileImage} alt="프로필"
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700 text-xl flex-shrink-0">
              {club.name.slice(0, 2)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">{club.name}</h1>
              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full whitespace-nowrap">
                {typeLabel[club.clubType]}
              </span>
            </div>
            <p className="text-gray-500 break-words">{club.location}</p>
          </div>
          {isMaster && (
            <div className="flex gap-2 flex-shrink-0">
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

        {/* 가입 신청 버튼 */}
        {user && !isMaster && joinStatus !== 'PENDING' && (
          <button onClick={handleJoin}
            className="w-full py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600">
            가입 신청
          </button>
        )}
        {joinStatus === 'PENDING' && (
          <p className="text-center text-sm text-gray-500">
            ⏳ 가입 신청 중... 대표자 승인을 기다려주세요
          </p>
        )}
      </div>

      {/* 탭 */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => setActiveTab('info')}
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'info' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}>
          정보
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'members' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}>
          멤버 ({members.length})
        </button>
        {isMaster && (
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'requests' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}>
            신청 ({joinRequests.length})
          </button>
        )}
      </div>

      {/* 정보 탭 */}
      {activeTab === 'info' && (
        <div className="border rounded-lg p-4 space-y-2">
          <p className="text-sm text-gray-600">대표: <span className="font-semibold">{club.masterName}</span></p>
          <p className="text-sm text-gray-600">멤버: <span className="font-semibold">{club.memberCount}명</span></p>
          {club.foundedAt && (
            <p className="text-sm text-gray-600">창단: <span className="font-semibold">{club.foundedAt.slice(0, 10)}</span></p>
          )}
          {club.description && (
            <p className="text-gray-700 mt-4">{club.description}</p>
          )}
        </div>
      )}

      {/* 멤버 탭 */}
      {activeTab === 'members' && (
        <div className="border rounded-lg p-4">
          {members.length === 0 ? (
            <p className="text-gray-400 text-sm">멤버가 없어요</p>
          ) : (
            members.map(m => (
              <div key={m.memberId}
                className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex items-center gap-3">
                  {m.profileImage ? (
                    <img src={m.profileImage} alt="프로필"
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700">
                      {m.userName[0]}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{m.userName}</p>
                      {m.userId === club.masterId && (
                        <span className="text-xs px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded">대표</span>
                      )}
                      {m.memberRole === 'ADMIN' && m.userId !== club.masterId && (
                        <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">운영진</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{m.userSchool}</p>
                  </div>
                </div>

                {/* master만 역할변경/강퇴 가능, 본인이나 대표자는 강퇴 불가 */}
                {isMaster && m.userId !== club.masterId && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRoleChange(m.memberId, m.memberRole)}
                      className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50">
                      {m.memberRole === 'ADMIN' ? '운영진 해제' : '운영진 임명'}
                    </button>
                    <button
                      onClick={() => handleKick(m.memberId, m.userName)}
                      className="text-xs px-2 py-1 bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100">
                      강퇴
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* 신청 탭 */}
      {activeTab === 'requests' && isMaster && (
        <div className="border rounded-lg p-4">
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
                  <button onClick={() => handleApprove(r.requestId)}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600">
                    승인
                  </button>
                  <button onClick={() => handleReject(r.requestId)}
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