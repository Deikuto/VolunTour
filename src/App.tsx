import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './context/LanguageContext'
import { AuthProvider } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import Navbar from './components/Navbar'
import AuthModal from './components/AuthModal'
import ScrollToTop from './components/ScrollToTop'
import Landing from './pages/Landing'
import Events from './pages/Events'
import Issues from './pages/Issues'

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Navbar />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/events" element={<Events />} />
              <Route path="/issues" element={<Issues />} />
            </Routes>
            <AuthModal />
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}
