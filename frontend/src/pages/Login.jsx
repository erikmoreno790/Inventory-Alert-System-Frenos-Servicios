import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-full max-w-md">
      <h1 className="text-2xl font-bold mb-4 text-center text-amber-400">Iniciar Sesión</h1>
      <p className="text-gray-400 mb-6 text-center">Por favor, ingresa tus credenciales</p>
      <form onSubmit= {handleLogin} className="space-y-4">
        
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-gray-500 text-white px-4 py-2 rounded-md my-2"
          required
        />
        {error && <span className="text-red-500">Username is required</span>}
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-gray-500 text-white px-4 py-2 rounded-md my-2"
          required
        />
        {error && <span className="text-red-500">Password is required</span>}
        
        <div className="flex items-center justify-center mb-4 mt-4">
          <button type="submit" className="bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600 transition-colors duration-300">
            Iniciar Sesión
          </button>
        </div>
      </form>
    </div>
    </div>
  )
}

export default Login
