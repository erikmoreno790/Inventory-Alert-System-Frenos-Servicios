// pages/QuotationsHistoryPage.jsx
// ========================================================
// Página para listar el historial de cotizaciones
// Adaptada a la estructura de la tabla "cotizaciones"
// ========================================================

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import api from "../api";

const QuotationsHistoryPage = () => {
  // Estado para controlar la visibilidad del sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Lista de cotizaciones
  const [quotations, setQuotations] = useState([]);

  // Filtros de búsqueda
  const [search, setSearch] = useState(""); // Buscar por cliente o placa
  const [fecha, setFecha] = useState(""); // Filtrar por fecha

  // Control de carga
  const [loading, setLoading] = useState(true);

  // Token de autenticación almacenado en localStorage
  const token = localStorage.getItem("token");

  // Ejecuta la carga inicial de cotizaciones
  useEffect(() => {
    fetchQuotations();
  }, []);

  // Alterna el estado del sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  /**
   * Obtiene todas las cotizaciones desde el backend
   */
  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const response = await api.get("/quotations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setQuotations(response.data); // Guardamos la lista de cotizaciones
    } catch (error) {
      console.error("Error al obtener las cotizaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filtra cotizaciones según búsqueda y fecha
   */
  const filteredQuotations = quotations.filter((quotation) => {
    const term = search.toLowerCase();

    // Filtra por placa o cliente
    const matchSearch =
      quotation.placa?.toLowerCase().includes(term) ||
      quotation.cliente?.toLowerCase().includes(term);

    // Filtra por fecha de cotización
    const matchFecha = fecha
      ? new Date(quotation.fecha_cotizacion).toISOString().slice(0, 10) ===
        fecha
      : true;

    return matchSearch && matchFecha;
  });

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Barra lateral */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div
        className={`flex-1 ${
          sidebarOpen ? "ml-64" : ""
        } transition-all duration-300`}
      >
        {/* Barra superior */}
        <TopNavbar onToggleSidebar={toggleSidebar} />

        <main>
          <div className="p-6 max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">
              Historial de Cotizaciones
            </h2>

            {/* Barra de búsqueda y filtros */}
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
                onClick={fetchQuotations}
                className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
              >
                Recargar
              </button>
            </div>

            {/* Tabla de cotizaciones */}
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
                      <th className="border px-2 py-1">Estado</th>
                      <th className="border px-2 py-1">Total</th>
                      <th className="border px-2 py-1">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuotations.map((quotation, index) => (
                      <tr key={quotation.id_quotation}>
                        {/* Índice */}
                        <td className="border px-2 py-1 text-center">
                          {index + 1}
                        </td>

                        {/* Fecha de cotización */}
                        <td className="border px-2 py-1">
                          {new Date(quotation.fecha_cotizacion)
                            .toISOString()
                            .slice(0, 10)}
                        </td>

                        {/* Placa */}
                        <td className="border px-2 py-1">{quotation.placa}</td>

                        {/* Vehículo */}
                        <td className="border px-2 py-1">
                          {quotation.vehiculo}
                        </td>

                        {/* Cliente */}
                        <td className="border px-2 py-1">
                          {quotation.cliente}
                        </td>

                        {/* Estado */}
                        <td className="border px-2 py-1 capitalize">
                          {quotation.estado}
                        </td>

                        {/* Total */}
                        <td className="border px-2 py-1 text-right">
                          ${quotation.total?.toLocaleString()}
                        </td>

                        {/* Acciones */}
                        <td className="border px-2 py-1 text-center space-x-2">
                          {/* Ver cotización */}
                          <Link
                            to={`/cotizacion/${quotation.id_quotation}`}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                          >
                            Ver
                          </Link>

                          {/* Editar cotización */}
                          <Link
                            to={`/cotizacion/editar/${quotation.id_quotation}`}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded text-xs"
                          >
                            Editar
                          </Link>
                        </td>
                      </tr>
                    ))}

                    {/* Mensaje cuando no hay resultados */}
                    {filteredQuotations.length === 0 && (
                      <tr>
                        <td colSpan="8" className="text-center py-3">
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
