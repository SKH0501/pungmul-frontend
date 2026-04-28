import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api/axios'

const UNIVERSITIES = [
  // 서울 주요대
  "고려대학교", "고려대학교 세종캠퍼스",
  "국민대학교", "광운대학교",
  "건국대학교", "건국대학교 글로컬캠퍼스",
  "경희대학교", "경희대학교 국제캠퍼스",
  "동국대학교", "동국대학교 경주캠퍼스",
  "서강대학교", "서울대학교", "서울시립대학교",
  "서울여자대학교", "성공회대학교", "성균관대학교",
  "성균관대학교 자연과학캠퍼스", "성신여자대학교",
  "세종대학교", "숙명여자대학교", "숭실대학교",
  "연세대학교", "연세대학교 미래캠퍼스",
  "이화여자대학교", "중앙대학교", "중앙대학교 안성캠퍼스",
  "한국외국어대학교", "한국외국어대학교 글로벌캠퍼스",
  "한국항공대학교", "한양대학교", "한양대학교 ERICA캠퍼스",
  "홍익대학교", "홍익대학교 세종캠퍼스",

  // 수도권
  "가천대학교", "가톨릭대학교", "강남대학교",
  "경기대학교", "단국대학교", "단국대학교 천안캠퍼스",
  "대진대학교", "명지대학교", "아주대학교",
  "안양대학교", "용인대학교", "인하대학교",
  "인천대학교", "차의과학대학교", "평택대학교",

  // 강원
  "강원대학교", "강원대학교 도계캠퍼스",
  "강원대학교 삼척캠퍼스", "한림대학교",

  // 충청
  "건양대학교", "공주대학교", "나사렛대학교",
  "백석대학교", "상명대학교 천안캠퍼스",
  "순천향대학교", "충남대학교", "충북대학교",
  "한국교원대학교", "한남대학교", "한밭대학교",

  // 전라
  "군산대학교", "목포대학교", "순천대학교",
  "원광대학교", "전남대학교", "전남대학교 여수캠퍼스",
  "전북대학교", "조선대학교", "호남대학교",

  // 경상
  "경남대학교", "경북대학교", "경성대학교",
  "계명대학교", "동아대학교", "동의대학교",
  "부경대학교", "부산대학교", "영남대학교",
  "울산대학교", "창원대학교",

  // 제주
  "제주대학교",

  // 삼육 / 기타
  "삼육대학교", "서울과학기술대학교",
  "한국기술교육대학교", "한국산업기술대학교",
]

function OnboardingPage() {
  const [school, setSchool] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [isSocial, setIsSocial] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const handleSchoolChange = (e) => {
    const value = e.target.value
    setSchool(value)
    if (value.trim() === '') {
      setSuggestions([])
      return
    }
    const filtered = UNIVERSITIES.filter(u => u.includes(value))
    setSuggestions(filtered.slice(0, 5))
  }

  const handleSelect = (university) => {
    setSchool(university)
    setSuggestions([])
  }

  const handleSubmit = async () => {
    if (!isSocial && !school.trim()) {
      return alert('학교를 입력해주세요!')
    }

    localStorage.setItem('token', token)

    try {
      await api.patch('/api/users/me', {
        school: isSocial ? null : school
      })
      navigate('/')
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
        <h2 className="text-2xl font-bold mb-2">환영해요! 🎉</h2>
        <p className="text-gray-500 mb-8">풍물 커뮤니티에 오신 것을 환영해요.</p>

        {/* 사회패 체크박스 */}
        <div className="mb-6 flex items-center gap-2">
          <input
            type="checkbox"
            id="isSocial"
            checked={isSocial}
            onChange={e => {
              setIsSocial(e.target.checked)
              if (e.target.checked) {
                setSchool('')
                setSuggestions([])
              }
            }}
            className="w-4 h-4"
          />
          <label htmlFor="isSocial" className="text-sm text-gray-600">
            사회패입니다 (학교 없음)
          </label>
        </div>

        {/* 학교 검색 */}
        {!isSocial && (
          <div className="mb-6 relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              학교명
            </label>
            <input
              type="text"
              value={school}
              onChange={handleSchoolChange}
              placeholder="예) 서울대학교"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* 자동완성 드롭다운 */}
            {suggestions.length > 0 && (
              <div className="absolute w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-10">
                {suggestions.map((u, i) => (
                  <div
                    key={i}
                    onClick={() => handleSelect(u)}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm"
                  >
                    {u}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors">
          시작하기 🥁
        </button>
      </div>
    </div>
  )
}

export default OnboardingPage