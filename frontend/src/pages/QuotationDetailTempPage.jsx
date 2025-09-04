import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Printer, Edit, Trash2, CheckCircle } from "lucide-react";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import api from "../api";

const QuotationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quotation, setQuotation] = useState(null);
  const [items, setItems] = useState([]); // 🔹 Items de la cotización
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Cargar cotización y sus ítems
  useEffect(() => {
    const fetchQuotationDetail = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 🔹 Obtener cotización
        const quotationRes = await api.get(`/quotations/${id}`, config);
        setQuotation(quotationRes.data);

        // 🔹 Obtener items desde quotation_items_snapshot
        const itemsRes = await api.get(
          `/quotation-temp/quotation/${id}`,
          config
        );
        setItems(itemsRes.data || []);
      } catch (error) {
        console.error(
          "Error cargando la cotización:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchQuotationDetail();
  }, [id, token]);

  const handleApprove = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await api.put(`/quotations/${id}/approve`, {}, config);
      alert("Cotización aprobada");
      navigate("/cotizaciones");
    } catch (error) {
      console.error("Error al aprobar:", error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Seguro que deseas eliminar esta cotización?")) return;

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await api.delete(`/quotations/${id}`, config);
      alert("Cotización eliminada");
      navigate("/cotizaciones");
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const handlePrint = () => {
    localStorage.setItem(
      "currentQuotation",
      JSON.stringify({ ...quotation, items })
    );
    navigate(`/cotizacion/pdf/${id}`, { state: { ...quotation, items } });
  };

  if (loading)
    return <div className="p-6 text-gray-600">Cargando cotización...</div>;
  if (!quotation)
    return <div className="p-6 text-red-500">Cotización no encontrada.</div>;

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
            <Link
              to="/cotizaciones"
              className="text-blue-600 hover:underline flex items-center mb-4"
            >
              <ArrowLeft className="mr-2" size={16} /> Volver a Cotizaciones
            </Link>

            <h1 className="text-2xl font-bold mb-2">
              Cotización #{quotation.id_quotation}
            </h1>
            <p className="text-gray-600 mb-4">
              Estado:{" "}
              <span
                className={`px-2 py-1 rounded ${
                  quotation.estado === "approved"
                    ? "bg-green-100 text-green-700"
                    : quotation.estado === "rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {quotation.estado}
              </span>
            </p>

            {/* Información general */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg shadow mb-6">
              <p>
                <strong>Cliente:</strong> {quotation.cliente}
              </p>
              <p>
                <strong>NIT:</strong> {quotation.nit || "N/A"}
              </p>
              <p>
                <strong>Teléfono:</strong> {quotation.telefono || "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {quotation.email || "N/A"}
              </p>
              <p>
                <strong>Placa:</strong> {quotation.placa}
              </p>
              <p>
                <strong>Vehículo:</strong> {quotation.vehiculo}
              </p>
              <p>
                <strong>Modelo:</strong> {quotation.modelo}
              </p>
              <p>
                <strong>Kilometraje:</strong> {quotation.kilometraje} km
              </p>
              <p>
                <strong>Fecha:</strong>{" "}
                {new Date(quotation.fecha_cotizacion).toLocaleDateString()}
              </p>
            </div>

            {/* Tabla de Items */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <h2 className="text-lg font-semibold mb-4">
                Productos Cotizados
              </h2>
              <table className="min-w-full border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2">Producto</th>
                    <th className="border p-2">Cantidad</th>
                    <th className="border p-2">Precio</th>
                    <th className="border p-2">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length > 0 ? (
                    items.map((item) => (
                      <tr key={item.id_quotation_item}>
                        <td className="border p-2">{item.producto}</td>
                        <td className="border p-2">{item.cantidad}</td>
                        <td className="border p-2">${item.precio}</td>
                        <td className="border p-2">${item.subtotal}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center p-4 text-gray-500">
                        No hay productos cotizados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totales */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <p>
                <strong>Subtotal:</strong> ${quotation.subtotal}
              </p>
              <p>
                <strong>Descuento:</strong> ${quotation.discount}
              </p>
              <p>
                <strong>Total:</strong> ${quotation.total}
              </p>
            </div>

            {/* Botones */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleApprove}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                <CheckCircle className="mr-2" size={18} /> Aprobar
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <Printer className="mr-2" size={18} /> Imprimir
              </button>
              <Link
                to={`/cotizaciones/editar/${quotation.id_quotation}`}
                className="bg-yellow-500 text-white px-4 py-2 rounded"
              >
                Editar
              </Link>
              <button
                onClick={handleDelete}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                <Trash2 className="mr-2" size={18} /> Eliminar
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default QuotationDetailPage;
