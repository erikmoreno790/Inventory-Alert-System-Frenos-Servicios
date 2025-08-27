import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import api from "../api";

const ServiceOrderDetailPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const token = localStorage.getItem("token");

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await api.get(
          `/service-orders/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setOrder(response.data);
      } catch (error) {
        console.error("Error al obtener los detalles de la orden:", error);
      }
    };

    fetchOrderDetails();
  }, [id, token]);

  const handlePrint = () => {
    window.print();
  };

  if (!order) {
    return <div className="p-6">Cargando detalles...</div>;
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
          <div className="p-6 print:p-0 max-w-5xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200">
            {/* Encabezado */}
            <div className="flex flex-wrap justify-between items-center border-b pb-4 mb-6">
              <h2 className="text-3xl font-bold text-gray-800">
                Orden de Servicio <span className="text-blue-600">#{id}</span>
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(-1)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Regresar
                </button>
                <button
                  onClick={handlePrint}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors print:hidden"
                >
                  Imprimir
                </button>
              </div>
            </div>

            {/* Información Cliente y Vehículo */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-4 shadow-sm border">
                <h3 className="font-semibold text-lg text-gray-700 mb-3">
                  Información del Cliente
                </h3>
                <ul className="space-y-1 text-gray-600">
                  <li>
                    <strong>Cliente / Empresa:</strong> {order.cliente}
                  </li>
                  <li>
                    <strong>NIT / CC:</strong> {order.identificacion}
                  </li>
                  <li>
                    <strong>Teléfono:</strong> {order.telefono}
                  </li>
                  <li>
                    <strong>Email:</strong> {order.email}
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 shadow-sm border">
                <h3 className="font-semibold text-lg text-gray-700 mb-3">
                  Información del Vehículo
                </h3>
                <ul className="space-y-1 text-gray-600">
                  <li>
                    <strong>Placa:</strong> {order.placa}
                  </li>
                  <li>
                    <strong>Vehículo:</strong> {order.vehiculo}
                  </li>
                  <li>
                    <strong>Modelo:</strong> {order.modelo}
                  </li>
                  <li>
                    <strong>Kilometraje:</strong> {order.kilometraje} km
                  </li>
                  <li>
                    <p>
                      <strong>Fecha de servicio:</strong>{" "}
                      {new Date(order.fecha_servicio)
                        .toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "2-digit",
                        })
                        .replace(/\s+de\s+/g, "/")}
                    </p>
                  </li>
                </ul>
              </div>
            </div>

            {/* Mecánicos */}
            <div className="mb-8">
              <h3 className="font-semibold text-lg text-gray-700 mb-3">
                Mecánicos
              </h3>
              <p className="text-gray-600">
                {Array.isArray(order.mecanicos)
                  ? order.mecanicos.join(", ")
                  : typeof order.mecanicos === "string"
                  ? order.mecanicos
                  : "—"}
              </p>
            </div>

            {/* Repuestos Usados */}
            <div className="mb-8">
              <h3 className="font-semibold text-lg text-gray-700 mb-3">
                Repuestos Usados
              </h3>
              {order.repuestos_usados && order.repuestos_usados.length > 0 ? (
                <table className="w-full border border-gray-200 text-sm rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-blue-50 text-gray-700">
                      <th className="border px-3 py-2 text-left">Cantidad</th>
                      <th className="border px-3 py-2 text-left">Nombre</th>
                      <th className="border px-3 py-2 text-left">
                        Observación
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.repuestos_usados.map((r, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border px-3 py-2">{r.cantidad}</td>
                        <td className="border px-3 py-2">{r.nombre}</td>
                        <td className="border px-3 py-2">{r.observacion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500 italic">
                  No se registraron repuestos usados.
                </p>
              )}
            </div>

            {/* Fotos */}
            {order.fotos && order.fotos.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-lg text-gray-700 mb-3">
                  Fotos del Servicio
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {order.fotos.map((foto, index) => (
                    <img
                      key={index}
                      src={`http://localhost:3000/uploads/${foto}`}
                      alt={`Foto ${index + 1}`}
                      className="rounded-lg shadow border border-gray-200"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ServiceOrderDetailPage;
