import { useState, useEffect } from "react";
import {
  Menu,
  Bell,
  UserCircle,
  Wrench,
  FilePlus,
  LogOut,
  Settings,
} from "lucide-react";
import axios from "axios";

const TopNavbar = ({ onToggleSidebar }) => {
  const [userName, setUserName] = useState("Usuario");
  const [userRole, setUserRole] = useState("Invitado");
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await axios.get(
          "http://localhost:3000/api/auth/validate",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = response.data;
        setUserName(data.user.nombre || data.user.email || "Usuario");
        setUserRole(data.user.rol || "Invitado");
        localStorage.setItem("user", JSON.stringify(data.user));
      } catch (error) {
        console.error(
          "Error al validar token:",
          error.response?.data || error.message
        );
        setUserName("Invitado");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    };

    fetchUserData();
  }, []);

  return (
    <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 text-white shadow-md px-4 py-3 flex items-center justify-between sticky top-0 z-30">
      {/* IZQUIERDA - Menú + Logo */}
      <div className="flex items-center space-x-3">
        <button
          className="md:hidden text-gray-200 hover:text-white"
          onClick={onToggleSidebar}
        >
          <Menu size={24} />
        </button>
      </div>

      {/* DERECHA */}
      <div className="flex items-center space-x-5">
        {/* Acciones rápidas */}
        <button
          title="Nueva orden"
          className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm font-medium"
          onClick={() => (window.location.href = "/ordenes-servicio/nueva")}
        >
          <FilePlus size={18} />
          <span>Nuevo Servicio</span>
        </button>

        <button
          title="Entrar a Taller"
          className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-sm font-medium"
          onClick={() => (window.location.href = "/mecanicos")}
        >
          <Wrench size={18} />
          <span>Taller</span>
        </button>

        <button title="Notificaciones" className="relative">
          <Bell size={22} className="text-gray-300 hover:text-white" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full px-1">
            3
          </span>
        </button>

        {/* Usuario */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center space-x-2 hover:text-blue-400"
          >
            <UserCircle size={26} />
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-sm font-semibold">{userName}</span>
              <span className="text-xs text-gray-300 italic">{userRole}</span>
            </div>
          </button>

          {/* Menú desplegable */}
          {showMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-white text-gray-800 rounded-lg shadow-lg overflow-hidden">
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                onClick={() => (window.location.href = "/perfil")}
              >
                <Settings size={16} /> Perfil
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  window.location.href = "/login";
                }}
              >
                <LogOut size={16} /> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
