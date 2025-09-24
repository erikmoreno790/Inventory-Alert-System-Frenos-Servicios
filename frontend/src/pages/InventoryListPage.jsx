import { useState, useEffect } from "react";
import api from "../api";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";

const InventoryListPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inventario, setInventario] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const fetchInventario = async () => {
      try {
        const response = await api.get("/repuestos", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response.data);
        setInventario(response.data); // Ajusta si tu backend devuelve { data: [] } u otro formato
      } catch (error) {
        console.error(
          "Error al obtener los productos:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInventario();
  }, [token]);

  const handleFiltrado = () => {
    return inventario.filter(
      (item) =>
        item.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        item.categoria.toLowerCase().includes(busqueda.toLowerCase())
    );
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
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Inventario de Repuestos</h1>
              <Link
                to="/inventario/nuevo"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                + Nuevo Repuesto
              </Link>
            </div>
            <div className="relative mb-4 max-w-md">
              <Search className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o categoría..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {loading ? (
              <div className="text-center text-gray-600">Cargando...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded-lg shadow">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left px-4 py-2">Nombre</th>
                      <th className="text-left px-4 py-2">Categoría</th>
                      <th className="text-center px-4 py-2">Cantidad Actual</th>
                      <th className="text-center px-4 py-2">Cantidad Mínima</th>
                      <th className="text-center px-4 py-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {handleFiltrado().map((item) => (
                      <tr key={item.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2">{item.nombre}</td>
                        <td className="px-4 py-2">{item.categoria}</td>
                        <td
                          className={`px-4 py-2 text-center ${
                            item.stock < item.stock_minimo
                              ? "text-red-600 font-bold"
                              : ""
                          }`}
                        >
                          {item.stock}
                        </td>
                        <td className="px-4 py-2 text-center">
                          {item.stock_minimo}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <Link
                            to={`/inventario/${item.id}`}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            Ver
                          </Link>{" "}
                          |{" "}
                          <Link
                            to={`/inventario/editar/${item.id}`}
                            className="text-green-600 hover:underline text-sm"
                          >
                            Editar
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {handleFiltrado().length === 0 && (
                      <tr>
                        <td
                          colSpan="5"
                          className="text-center py-4 text-gray-500"
                        >
                          No se encontraron repuestos.
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

export default InventoryListPage;
