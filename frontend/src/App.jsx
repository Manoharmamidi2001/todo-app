import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from './components/Login'
import AdminDashboard from './pages/AdminDashboard'
import UserDashboard from './pages/UserDashboard'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Login/>}/>
        <Route path='/admin-dashboard' element={<AdminDashboard/>}/>
        <Route path='/user-dashboard' element={<UserDashboard/>}/>
      </Routes>
    </div>
  )
}

export default App
