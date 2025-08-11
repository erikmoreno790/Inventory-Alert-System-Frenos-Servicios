import { useState, useEffect } from "react";
import { Menu, Bell, UserCircle, Wrench, FilePlus } from "lucide-react";
import axios from "axios";

const TopNavbar = ({ onToggleSidebar }) => {
  const [userName, setUserName] = useState("Usuario");
  const [userRole, setUserRole] = useState("Invitado");

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Validar el token con el backend con axios
      try {
        const response = await axios.get(
          "http://localhost:3000/api/auth/validate",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = response.data;
        console.log(data);

        setUserName(data.user.nombre || data.user.email || "Usuario");
        setUserRole(data.user.rol || "Invitado");

        // (Opcional) actualizar el localStorage
        localStorage.setItem("user", JSON.stringify(data.user));
      } catch (error) {
        console.error(
          "Error al validar token:",
          error.response?.data || error.message
        );
        setUserName("Invitado");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        // Redirigir al login si quieres
      }
    };

    fetchUserData();
  }, []);

  return (
    <header className="bg-white border-b shadow-sm p-4 flex items-center justify-between sticky top-0 z-30">
      {/* Izquierda */}
      <div className="flex items-center space-x-4">
        <button
          className="md:hidden text-gray-700 hover:text-black"
          onClick={onToggleSidebar}
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Derecha */}
      <div className="flex items-center space-x-4">
        <button
          title="Nueva orden"
          className="hidden sm:flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
          onClick={() => (window.location.href = "/ordenes-servicio/nueva")}
        >
          <FilePlus size={18} />
          <span>Nueva Orden</span>
        </button>

        <button
          title="Entrar a Taller"
          className="hidden sm:flex items-center space-x-1 text-sm text-green-600 hover:text-green-800"
          onClick={() => (window.location.href = "/mecanicos")}
        >
          <Wrench size={18} />
          <span>Taller</span>
        </button>

        <button
          title="Notificaciones"
          className="text-gray-600 hover:text-black"
        >
          <Bell size={20} />
        </button>

        <div className="flex items-center space-x-2">
          <UserCircle size={24} className="text-gray-600" />
          <span className="text-sm text-gray-800 font-medium hidden sm:inline">
            {userName}
          </span>
        </div>

        {/* Rol del usuario */}
        <div className="text-xs text-gray-500 italic hidden sm:inline">
          {userRole}
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
