import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import BookingForm from './pages/home'
import BookingTable from './pages/data'
import Login from './pages/login'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<Login/>} />
          <Route path='/login' element={<Login/>} />
          <Route path='/home' element={<BookingForm/>} />
          <Route path='/data' element={<BookingTable/>} />
        </Routes>
      </Router>
      
    </>
  )
}

export default App
