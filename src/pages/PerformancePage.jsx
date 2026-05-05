import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

const typeLabel = {
  REGULAR: '정기공연',
  FESTIVAL: '축제',
  EXCHANGE: '교류공연',
  BUSKING: '버스킹'
}

const typeColor = {
  REGULAR: 'bg-blue-100 text-blue-700',
  FESTIVAL: 'bg-purple-100 text-purple-700',
  EXCHANGE: 'bg-green-100 text-green-700',
  BUSKING: 'bg-orange-100 text-orange-700'
}

function PerformancePage() {
  const [performances, setPerformances] = useState([])
  const [keyword, setKeyword] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [upcoming, setUpcoming] = useState(true)
  const [sort, setSort] = useState('performedAt')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  const observerRef = useRef(null)

  const fetchPerformances = useCallback(async (reset = false) => {
    if (loading) return
    setLoading(true)
    try {
      const currentPage = reset ? 0 : page
      const res = await api.get('/api/performances', {
        params: {
          keyword: keyword || null,
          upcoming,
          sort,
          page: currentPage,
          size: 10
        }
      })
      const data = res.data
      if (reset) {
        setPerformances(data.content)
      } else {
        setPerformances(prev => [...prev, ...data.content])
      }
      setHasMore(!data.last)
      setPage(currentPage + 1)
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }, [keyword, upcoming, sort, page, loading])

  // 탭/정렬/검색 바뀌면 초기화
  useEffect(() => {
    setPage(0)
    setPerformances([])
    setHasMore(true)
    fetchPerformances(true)
  }, [keyword, upcoming, sort])

  // 무한 스크롤 옵저버
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchPerformances()
        }
      },
      { threshold: 1.0 }
    )
    if (observerRef.current) observer.observe(observerRef.current)
    return () => observer.disconnect()
  }, [hasMore, loading, fetchPerformances])

  const handleSearch = () => {
    setKeyword(searchInput)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">공연</h2>
        {user && (
          <button
            onClick={() => navigate('/performances/new')}
            className="text-sm px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            + 공연 등록
          </button>
        )}
      </div>

      {/* 검색 */}
      <div className="flex gap-2 mb-4">
        <input
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="공연명, 장소, 동아리 검색"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600">
          검색
        </button>
      </div>

      {/* 탭 + 정렬 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setUpcoming(true)}
            className={`px-4 py-1.5 text-sm rounded-full ${upcoming ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
            예정된 공연
          </button>
          <button
            onClick={() => setUpcoming(false)}
            className={`px-4 py-1.5 text-sm rounded-full ${!upcoming ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
            지난 공연
          </button>
        </div>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none">
          <option value="performedAt">날짜순</option>
          <option value="createdAt">최신 등록순</option>
        </select>
      </div>

      {/* 공연 목록 */}
      {performances.length === 0 && !loading && (
        <p className="text-gray-400 text-sm text-center py-12">
          {upcoming ? '예정된 공연이 없어요' : '지난 공연이 없어요'}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4">
        {performances.map(p => (
          <div
            key={p.id}
            onClick={() => navigate(`/performances/${p.id}`)}
            className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
            {/* 포스터 이미지 */}
            {p.posterImage ? (
              <img
                src={p.posterImage}
                alt="포스터"
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <span className="text-4xl">🥁</span>
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${typeColor[p.performanceType]}`}>
                  {typeLabel[p.performanceType]}
                </span>
                {p.clubProfileImage ? (
                  <img src={p.clubProfileImage} alt="동아리"
                    className="w-5 h-5 rounded-full object-cover" />
                ) : null}
                <span className="text-xs text-blue-500">{p.clubName}</span>
              </div>
              <h3 className="font-bold text-lg mb-1">{p.title}</h3>
              <p className="text-sm text-gray-500">📍 {p.location}</p>
              <p className="text-sm text-gray-500">
                📅 {new Date(p.performedAt).toLocaleDateString('ko-KR', {
                  year: 'numeric', month: 'long', day: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 무한 스크롤 트리거 */}
      <div ref={observerRef} className="h-10 flex items-center justify-center">
        {loading && <p className="text-gray-400 text-sm">로딩 중...</p>}
      </div>
    </div>
  )
}

export default PerformancePage