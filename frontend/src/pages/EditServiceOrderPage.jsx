import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import api from '../api'

const EditarServicio = () => {
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    cliente: "",
    placa: "",
    vehiculo: "",
    modelo: "",
    nit_cc: "",
    telefono: "",
    email: "",
    kilometraje: "",
    fecha_servicio: "",
    observaciones: "",
  });
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Cargar datos del servicio
  useEffect(() => {
    const fetchServicio = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const res = await api.get(
          `/service-orders/${id}`,
          config
        );

        setFormData({
          cliente: res.data.cliente || "",
          placa: res.data.placa || "",
          vehiculo: res.data.vehiculo || "",
          modelo: res.data.modelo || "",
          nit_cc: res.data.nit_cc || "",
          telefono: res.data.telefono || "",
          email: res.data.email || "",
          kilometraje: res.data.kilometraje || "",
          fecha_servicio: res.data.fecha_servicio
            ? res.data.fecha_servicio.split("T")[0]
            : "",
          observaciones: res.data.observaciones || "",
        });
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar el servicio", error);
        setLoading(false);
      }
    };
    fetchServicio();
  }, [id]);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Guardar cambios
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(
        `/service-orders/${id}`,
        formData
      );
      navigate("/ordenes-servicio");
    } catch (error) {
      console.error("Error al actualizar el servicio", error);
    }
  };

  if (loading) return <p className="p-4">Cargando datos...</p>;

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
              </div>
            </div>
            <div className="max-w-2xl mx-auto bg-white shadow-md p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">Editar Servicio</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Placa */}
                <input
                  name="placa"
                  value={formData.placa}
                  onChange={handleChange}
                  placeholder="Placa"
                  className="w-full border p-2 rounded"
                  required
                />
                {/* Vehiculo */}
                <input
                  name="vehiculo"
                  value={formData.vehiculo}
                  onChange={handleChange}
                  placeholder="Vehículo"
                  className="w-full border p-2 rounded"
                  required
                />
                {/* Modelo */}
                <input
                  name="modelo"
                  value={formData.modelo}
                  onChange={handleChange}
                  placeholder="Modelo"
                  className="w-full border p-2 rounded"
                  required
                />
                {/* Cliente */}
                <input
                  name="cliente"
                  value={formData.cliente}
                  onChange={handleChange}
                  placeholder="Cliente"
                  className="w-full border p-2 rounded"
                  required
                />
                {/* NIT/CC */}
                <input
                  name="nit_cc"
                  value={formData.nit_cc}
                  onChange={handleChange}
                  placeholder="NIT/CC"
                  className="w-full border p-2 rounded"
                  required
                />
                {/* Teléfono */}
                <input
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="Teléfono"
                  className="w-full border p-2 rounded"
                  required
                />
                {/* Email */}
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="w-full border p-2 rounded"
                  required
                />
                {/* Kilometraje */}
                <input
                  type="number"
                  name="kilometraje"
                  value={formData.kilometraje}
                  onChange={handleChange}
                  placeholder="Kilometraje"
                  className="w-full border p-2 rounded"
                  required
                />
                <input
                  type="date"
                  name="fecha_servicio"
                  value={formData.fecha_servicio}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                />
                <input
                  name="mecanico"
                  value={formData.mecanico}
                  onChange={handleChange}
                  placeholder="Mecánico"
                  className="w-full border p-2 rounded"
                />
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  placeholder="Descripción"
                  className="w-full border p-2 rounded"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800"
                >
                  Guardar Cambios
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EditarServicio;
