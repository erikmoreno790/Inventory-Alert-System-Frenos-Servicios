import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import api from "../api";

const QuotationsHistoryPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quotations, setQuotations] = useState([]);
  const [search, setSearch] = useState("");
  const [fecha, setFecha] = useState("");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchOrders();
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get("/quotations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setQuotations(response.data);
    } catch (error) {
      console.error("Error al obtener las órdenes de servicio:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrado de órdenes basado en búsqueda, mecánico y fecha
  const filteredOrders = quotations.filter((quotation) => {
    const term = search.toLowerCase();
    const matchSearch =
      quotation.placa?.toLowerCase().includes(term) ||
      quotation.cliente?.toLowerCase().includes(term);

    const matchFecha = fecha
      ? new Date(quotation.fecha_servicio).toISOString().slice(0, 10) === fecha
      : true;

    return matchSearch && matchFecha;
  });

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
          <div className="p-6 max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">
              Historial de Cotizaciones
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <input
                type="text"
                placeholder="Buscar por placa o cliente"
                className="border p-2 rounded"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <input
                type="date"
                className="border p-2 rounded"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
              <button
                onClick={fetchOrders}
                className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
              >
                Recargar
              </button>
            </div>
            {loading ? (
              <p>Cargando cotizaciones...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto border text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-2 py-1">#</th>
                      <th className="border px-2 py-1">Fecha</th>
                      <th className="border px-2 py-1">Placa</th>
                      <th className="border px-2 py-1">Vehículo</th>
                      <th className="border px-2 py-1">Cliente</th>
                      <th className="border px-2 py-1">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((quotation, index) => (
                      <tr key={quotation.id}>
                        <td className="border px-2 py-1 text-center">
                          {index + 1}
                        </td>
                        <td className="border px-2 py-1">
                          {new Date(quotation.fecha_servicio)
                            .toISOString()
                            .slice(0, 10)}
                        </td>
                        <td className="border px-2 py-1">{quotation.placa}</td>
                        <td className="border px-2 py-1">
                          {quotation.vehiculo}
                        </td>
                        <td className="border px-2 py-1">
                          {quotation.cliente}
                        </td>
                        <td className="border px-2 py-1 text-center space-x-2">
                          <Link
                            to={`/ordenes-servicio/${quotation.id_service_order}`}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                          >
                            Ver
                          </Link>
                          <Link
                            to={`/use-parts/${quotation.id_service_order}`}
                            className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
                          >
                            Usar Repuestos
                          </Link>
                          <Link
                            to={`/ordenes-servicio/edit/${quotation.id_service_order}`}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded text-xs"
                          >
                            Editar
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center py-3">
                          No se encontraron cotizaciones.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default QuotationsHistoryPage;
