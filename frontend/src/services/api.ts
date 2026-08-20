import axios from 'axios'
import { auth } from '../firebase'

const API_URL = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: API_URL,
})

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser
  if (user) {
    const token = await user.getIdToken()
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const uploadFile = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  const res = await api.post('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export const analyzeFile = async (fileId: string, language = 'en') => {
  const res = await api.post('/api/analyze', { file_id: fileId, language })
  return res.data
}

export const explainFinding = async (reportId: string, findingName: string) => {
  const res = await api.post('/api/explain', { report_id: reportId, finding_name: findingName })
  return res.data
}

export const chat = async (question: string, reportId?: string, language = 'en', history?: Array<{ role: string, text: string }>) => {
  const res = await api.post('/api/chat', { question, report_id: reportId, language, history })
  return res.data
}

export const translate = async (text: string, language: string) => {
  const res = await api.post('/api/translate', { text, language })
  return res.data
}

export const getDemoReport = async () => {
  const res = await api.get('/api/demo')
  return res.data
}

export default api
