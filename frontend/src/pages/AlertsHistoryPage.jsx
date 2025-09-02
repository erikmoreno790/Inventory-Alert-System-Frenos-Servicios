import { useEffect, useState } from "react";
import { format } from "date-fns";
import { AlertCircle, Clock, AlertTriangle } from "lucide-react";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import api from '../api'

const AlertsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const fetchAlertas = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        "inventory/alerts",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAlertas(res.data);
    } catch (err) {
      console.error("Error al cargar alertas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertas();
  }, []);

  const iconByTipo = (tipo) => {
    switch (tipo) {
      case "stock_bajo":
        return <AlertTriangle className="text-red-600" size={20} />;
      case "vencimiento":
        return <Clock className="text-yellow-600" size={20} />;
      case "critico":
        return <AlertCircle className="text-orange-600" size={20} />;
      default:
        return null;
    }
  };

  const nombreTipo = (tipo) => {
    switch (tipo) {
      case "stock_bajo":
        return "Stock bajo";
      case "vencimiento":
        return "Vencimiento";
      case "critico":
        return "Repuesto crítico";
      default:
        return "Otro";
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div
        className={`flex-1 ${
          sidebarOpen ? "ml-64" : ""
        } transition-all duration-300`}
      >
        <TopNavbar onToggleSidebar={toggleSidebar} />
        <main>
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Alertas del Inventario</h1>
            {loading ? (
              <div className="text-gray-500">Cargando alertas...</div>
            ) : alertas.length === 0 ? (
              <div className="text-gray-500">No hay alertas registradas.</div>
            ) : (
              <div className="space-y-4">
                {alertas.map((alerta) => (
                  <div
                    key={alerta.id}
                    className="flex items-start bg-white shadow rounded p-4 border-l-4 border-red-500"
                  >
                    <div className="mr-3">{iconByTipo(alerta.tipo)}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-lg text-gray-800">
                        {nombreTipo(alerta.tipo)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {alerta.mensaje}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Producto:{" "}
                        <strong>{alerta.producto?.nombre || "—"}</strong> |
                        Stock: {alerta.producto?.stock ?? "—"} / Mínimo:{" "}
                        {alerta.producto?.stock_minimo ?? "—"}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Generado:{" "}
                        {format(new Date(alerta.fecha), "yyyy-MM-dd HH:mm")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AlertsPage;
