import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PerformancePage from './pages/PerformancePage'
import OAuthCallback from './pages/OAuthCallback'
import HomePage from './pages/HomePage'
import Navbar from './components/Navbar'
import ClubPage from './pages/ClubPage'
import ClubDetailPage from './pages/ClubDetailPage'
import TrainingPage from './pages/TrainingPage'
import TrainingSessionPage from './pages/TrainingSessionPage'

import PerformanceDetailPage from './pages/PerformanceDetailPage'


function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/performances" element={<PerformancePage />} />
        <Route path="/performances/:id" element={<PerformanceDetailPage />} />
        <Route path="/clubs" element={<ClubPage />} />
        <Route path="/clubs/:id" element={<ClubDetailPage />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/training" element={<TrainingPage />} />
        <Route path="/training/:id" element={<TrainingSessionPage />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App