import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'

function TrainingSessionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [garak, setGarak] = useState(null)
  const [transitions, setTransitions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [nextLabel, setNextLabel] = useState('')
  const [alert, setAlert] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [audioBlob, setAudioBlob] = useState(null)
  const [analysisResult, setAnalysisResult] = useState(null)
  const timerRef = useRef(null)
  const playerRef = useRef(null)
  const currentRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    if (m === 0) return `${s}초`
    return `${m}분 ${String(s).padStart(2, '0')}초`
  }

  useEffect(() => {
    api.get(`/api/garaks/${id}`)
      .then(res => {
        setGarak(res.data)
        const parsed = JSON.parse(res.data.transitions)
        setTransitions(parsed)
        if (parsed.length > 1) setNextLabel(parsed[1].label)
      })
      .catch(err => console.log(err))
  }, [id])

  useEffect(() => {
  if (!garak) return

  const youtubeId = garak.youtubeUrl.split('v=')[1]?.split('&')[0]

  // 이미 API 로드됐으면 바로 플레이어 생성
  if (window.YT && window.YT.Player) {
    playerRef.current = new window.YT.Player('yt-player', {
      videoId: youtubeId,
      playerVars: { autoplay: 0, controls: 1 },
    })
    return
  }

  // 스크립트 중복 로드 방지
  if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.body.appendChild(tag)
  }

  window.onYouTubeIframeAPIReady = () => {
    playerRef.current = new window.YT.Player('yt-player', {
      videoId: youtubeId,
      playerVars: { autoplay: 0, controls: 1 },
    })
  }
}, [garak])

  useEffect(() => {
    if (!isRecording) return
    timerRef.current = setInterval(() => {
      setElapsed(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [isRecording])

  useEffect(() => {
    if (!isRecording || transitions.length === 0) return
    let idx = 0
    for (let i = 0; i < transitions.length; i++) {
      if (transitions[i].time <= elapsed) idx = i
      else break
    }
    setCurrentIndex(idx)
    const next = transitions[idx + 1]
    if (next) {
      setNextLabel(next.label)
      setAlert(next.time - elapsed <= 3)
    } else {
      setNextLabel('')
      setAlert(false)
    }
  }, [elapsed, transitions, isRecording])

  useEffect(() => {
    if (currentRef.current) {
      currentRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [currentIndex])

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mediaRecorder = new MediaRecorder(stream)
    mediaRecorderRef.current = mediaRecorder
    audioChunksRef.current = []

    mediaRecorder.ondataavailable = (e) => {
      audioChunksRef.current.push(e.data)
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
      setAudioBlob(blob)
    }

    mediaRecorder.start()
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop())
    }
  }

  const handleAnalyze = async () => {
    if (!audioBlob) return
    const formData = new FormData()
    formData.append('file', audioBlob, 'recording.webm')
    const transitionTimes = transitions.map(t => t.time).join(',')
    formData.append('transitions', transitionTimes)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      })
      const result = await res.json()
      setAnalysisResult(result)
    } catch (err) {
      console.log(err)
    }
  }

  const handleStart = () => {
    setElapsed(0)
    setCurrentIndex(0)
    setAudioBlob(null)
    setAnalysisResult(null)
    setIsRecording(true)
    startRecording()
    if (playerRef.current) {
      playerRef.current.seekTo(0)
      playerRef.current.playVideo()
    }
  }

  const handleStop = () => {
    setIsRecording(false)
    clearInterval(timerRef.current)
    stopRecording()
    if (playerRef.current) playerRef.current.pauseVideo()
  }

  if (!garak) return <div className="p-6">로딩중...</div>

  const currentLabel = transitions[currentIndex]?.label || ''

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-gray-500 mb-4 hover:text-black">
        ← 뒤로가기
      </button>

      <h2 className="text-xl font-bold mb-4">{garak.name} 연습</h2>

      <div className="mb-6 rounded-lg overflow-hidden">
        <div id="yt-player" style={{ width: '100%', height: '360px' }} />
      </div>

      {alert && nextLabel && (
        <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg text-center animate-pulse">
          <p className="text-red-700 font-bold text-lg">
            곧 "{nextLabel}" 으로 넘어갑니다!
          </p>
        </div>
      )}

      {isRecording && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p className="text-sm text-gray-500">현재 가락</p>
          <p className="text-2xl font-bold text-blue-700">{currentLabel}</p>
          {nextLabel && (
            <p className="text-sm text-gray-400 mt-1">다음 → {nextLabel}</p>
          )}
          <p className="text-xs text-gray-400 mt-2">{formatTime(elapsed)} 경과</p>
        </div>
      )}

      <div className="flex gap-3 mb-6">
        {!isRecording ? (
          <button
            onClick={handleStart}
            className="flex-1 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600">
            연습 시작 (영상 자동 재생)
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="flex-1 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600">
            연습 종료
          </button>
        )}
      </div>

      {audioBlob && (
        <div className="mt-4 p-4 border rounded-lg bg-gray-50 mb-4">
          <p className="text-sm font-semibold text-gray-600 mb-2">녹음 완료! 🎵</p>
          <audio controls src={URL.createObjectURL(audioBlob)} className="w-full" />
          <button
            onClick={handleAnalyze}
            className="mt-3 w-full py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600">
            AI 분석 요청
          </button>
        </div>
      )}

      {analysisResult && (
        <div className="mt-4 p-4 border rounded-lg bg-green-50 mb-4">
          <h3 className="font-bold text-green-700 mb-2">분석 결과</h3>
          <p className="text-2xl font-bold text-center mb-2">
            평균 오차: {analysisResult.avg_error}초
          </p>
          <p className="text-center text-lg mb-2">{analysisResult.feedback}</p>
          <p className="text-sm text-gray-500 text-center">
            감지된 타격 횟수: {analysisResult.total_hits}회
          </p>
        </div>
      )}

      <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
        <h3 className="font-semibold mb-3 text-sm text-gray-600">가락 전환 시점</h3>
        <div className="space-y-2">
          {transitions.map((t, i) => (
            <div
              key={i}
              ref={isRecording && currentIndex === i ? currentRef : null}
              className={`flex items-center gap-3 text-sm p-2 rounded ${
                isRecording && currentIndex === i
                  ? 'bg-blue-100 font-bold text-blue-700'
                  : 'text-gray-600'
              }`}
            >
              <span className="w-16 text-gray-400 text-xs">
                {Math.floor(t.time / 60)}:{String(t.time % 60).padStart(2, '0')}
              </span>
              <span>{t.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TrainingSessionPage