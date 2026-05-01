import { useState } from 'react'
import api from '../api/axios'

export function useS3Upload() {
  const [uploading, setUploading] = useState(false)

  const uploadFile = async (file) => {
    if (!file) return null
    setUploading(true)

    try {
      const fileType = file.name.split('.').pop()
      const contentType = file.type

      // 1. Presigned URL 발급
      const { data } = await api.get('/upload/presigned', {
        params: { contentType, fileType }
      })

      // 2. S3에 직접 업로드
      await fetch(data.presignedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': contentType }
      })

      // 3. S3 URL 반환
      return data.fileUrl

    } catch (err) {
      console.log(err)
      alert('파일 업로드 실패')
      return null
    } finally {
      setUploading(false)
    }
  }

  return { uploadFile, uploading }
}