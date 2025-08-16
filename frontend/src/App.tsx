import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SeatsPage from './pages/SeatsPage'
import ReservePage from './pages/ReservePage'
import './styles.css'
import 'nprogress/nprogress.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SeatsPage />} />
        <Route path="/reserve/:id" element={<ReservePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App


