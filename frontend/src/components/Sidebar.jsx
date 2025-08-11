import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  Menu,
  Home,
  Package,
  ClipboardList,
  Bell,
  Settings,
  LogOut,
  FileText,
  Wrench,
  Users,
  AlertTriangle,
  Truck,
  Search,
} from "lucide-react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: <Home size={18} /> },
    {
      to: "/inventario/nuevo",
      label: "Nuevo Repuesto",
      icon: <Package size={18} />,
    },
    {
      to: "/inventario",
      label: "Buscar Repuesto",
      icon: <Search size={18} />,
    },
    {
      to: "/inventario/entradas",
      label: "Entradas",
      icon: <Truck size={18} />,
    },
    {
      to: "/inventario/salidas",
      label: "Salidas",
      icon: <ClipboardList size={18} />,
    },
    { to: "/ordenes-servicio", label: "Órdenes", icon: <FileText size={18} /> },
    { to: "/alertas", label: "Alertas", icon: <Bell size={18} /> },
    {
      to: "/alertas/configuracion",
      label: "Configurar Alertas",
      icon: <AlertTriangle size={18} />,
    },
    { to: "/usuarios", label: "Usuarios", icon: <Users size={18} /> },
    {
      to: "/configuracion",
      label: "Configuración",
      icon: <Settings size={18} />,
    },
  ];

  return (
    <>
      {/* Botón hamburguesa solo en móviles */}
      <button
        className="md:hidden p-2 fixed top-4 left-4 z-50 bg-gray-800 text-white rounded"
        onClick={toggleSidebar}
      >
        <Menu />
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-md transform transition-transform duration-300 z-40 flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:w-64`}
      >
        {/* Encabezado */}
        <div className="p-4 font-bold text-lg border-b">🚗 AutoInventario</div>

        {/* Navegación principal */}
        <div className="flex-1 overflow-y-auto">
          <nav className="mt-4 flex flex-col space-y-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center px-4 py-2 hover:bg-gray-100 transition ${
                  location.pathname === link.to
                    ? "bg-gray-200 font-semibold"
                    : ""
                }`}
                onClick={() => setIsOpen(false)} // autocierra en móvil
              >
                <span className="mr-2">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Cerrar sesión */}
        <div className="p-4 border-t">
          <button
            className="flex items-center text-sm text-red-600 hover:text-red-800"
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
          >
            <LogOut className="mr-2" size={18} />
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
