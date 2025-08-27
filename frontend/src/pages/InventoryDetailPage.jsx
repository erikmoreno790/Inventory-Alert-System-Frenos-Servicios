import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, History } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';
import api from '../api'

const InventoryDetailPage = () => {
  const { id } = useParams();
  const token = localStorage.getItem('token');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [producto, setProducto] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const fetchDetalleProducto = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [prodRes, movRes, alertasRes] = await Promise.all([
          api.get(`/products/${id}`, config),
          api.get(`/products/movimientos/${id}`, config),
          api.get(`/alerts/products/${id}`, config),
        ]);

        setProducto(prodRes.data);
        setMovimientos(movRes.data);
        setAlertas(alertasRes.data);
      } catch (error) {
        console.error('Error cargando el detalle:', error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetalleProducto();
  }, [id, token]);

  if (loading) {
    return <div className="p-6 text-gray-600">Cargando detalles...</div>;
  }

  if (!producto) {
    return <div className="p-6 text-red-500">Producto no encontrado.</div>;
  }

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
        <Link to="/inventario" className="text-blue-600 hover:underline flex items-center mb-4">
          <ArrowLeft className="mr-2" size={16} /> Volver al Inventario
        </Link>
        <h1 className="text-2xl font-bold mb-2">{producto.nombre}</h1>
        <p className="text-gray-600 mb-4">{producto.descripcion || 'Sin descripción disponible.'}</p>
        {/* Info del repuesto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg shadow mb-6">
          <p><strong>Categoría:</strong> {producto.categoria}</p>
          <p><strong>Proveedor:</strong> {producto.proveedor || 'No especificado'}</p>
          <p><strong>Stock actual:</strong> {producto.stock}</p>
          <p><strong>Stock mínimo:</strong> {producto.stock_minimo}</p>
          <p><strong>Ubicación:</strong> {producto.ubicacion || 'No asignada'}</p>
          <p><strong>Código:</strong> {producto.codigo || 'N/A'}</p>
        </div>
        {/* Alertas asociadas */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-red-600">
            <AlertTriangle size={20} /> Alertas Asociadas
          </h2>
          {alertas.length > 0 ? (
            <ul className="space-y-2 bg-white p-4 rounded-lg shadow">
              {alertas.map((alerta, index) => (
                <li key={index} className="text-sm border-b pb-2">
                  🔔 {alerta.mensaje || alerta.descripcion}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No hay alertas asociadas a este repuesto.</p>
          )}
        </div>
        {/* Historial de movimientos */}
        <div>
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <History size={20} /> Historial de Movimientos
          </h2>
          {movimientos.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border rounded-lg shadow">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left px-4 py-2">Tipo</th>
                    <th className="text-left px-4 py-2">Cantidad</th>
                    <th className="text-left px-4 py-2">Fecha</th>
                    <th className="text-left px-4 py-2">Responsable</th>
                    <th className="text-left px-4 py-2">Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientos.map((mov, i) => (
                    <tr key={i} className="border-t hover:bg-gray-50 text-sm">
                      <td className="px-4 py-2 capitalize">{mov.tipo}</td>
                      <td className="px-4 py-2">{mov.cantidad}</td>
                      <td className="px-4 py-2">{new Date(mov.fecha).toLocaleDateString()}</td>
                      <td className="px-4 py-2">{mov.usuario || 'N/A'}</td>
                      <td className="px-4 py-2">{mov.observacion || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Este repuesto no tiene movimientos registrados.</p>
          )}
        </div>
      </div>
    </main>
          </div>
        </div>  
  );
};

export default InventoryDetailPage;
