import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import api from "../api";

const ServiceOrderFormPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const initialData = location.state || {
    placa: "",
    vehiculo: "",
    modelo: "",
    cliente: "",
    nit: "",
    telefono: "",
    email: "",
    kilometraje: "",
    fecha_servicio: "",
    mecanicos: "",
    fotos: [],
  };

  const [formData, setFormData] = useState(initialData);

  const token = localStorage.getItem("token");

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      fotos: Array.from(e.target.files),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "fotos") {
        value.forEach((file) => dataToSend.append("fotos", file));
      } else {
        dataToSend.append(key, value);
      }
    });

    try {
      console.log("Intento de enviar datos: ", dataToSend);
      const response = await api.post("/service-orders", dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const nuevaOrdenId = response.data.id_service_order || response.data._id;
      navigate(`/use-parts/${nuevaOrdenId}`);
    } catch (error) {
      console.error("Error al registrar la orden de servicio:", error);
      alert("Error al guardar la orden");
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
          <div className="p-6 max-w-4xl mx-auto">
            <div className="flex flex-wrap justify-between items-center border-b pb-4 mb-6">
              <h2 className="text-3xl font-bold text-gray-800">
                Información del Servicio
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
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded shadow"
            >
              <input
                name="placa"
                placeholder="Placa"
                value={formData.placa}
                onChange={handleChange}
                className="border p-2 rounded"
                required
              />
              <input
                name="vehiculo"
                placeholder="Vehículo"
                value={formData.vehiculo}
                onChange={handleChange}
                className="border p-2 rounded"
                required
              />
              <input
                name="modelo"
                placeholder="Modelo"
                value={formData.modelo}
                onChange={handleChange}
                className="border p-2 rounded"
                required
              />
              <input
                name="cliente"
                placeholder="Cliente o Empresa"
                value={formData.cliente}
                onChange={handleChange}
                className="border p-2 rounded"
                required
              />
              <input
                name="nit"
                placeholder="NIT o CC"
                value={formData.nit}
                onChange={handleChange}
                className="border p-2 rounded"
                required
              />
              <input
                name="telefono"
                placeholder="Teléfono"
                value={formData.telefono}
                onChange={handleChange}
                className="border p-2 rounded"
              />
              <input
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="border p-2 rounded"
              />
              <input
                name="kilometraje"
                placeholder="Kilometraje"
                value={formData.kilometraje}
                onChange={handleChange}
                className="border p-2 rounded"
              />
              <input
                type="date"
                name="fecha_servicio"
                value={formData.fecha_servicio}
                onChange={handleChange}
                className="border p-2 rounded"
                required
              />
              <input
                name="mecanicos"
                placeholder="Nombre de los mecánicos"
                value={formData.mecanicos}
                onChange={handleChange}
                className="border p-2 rounded"
                required
              />
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Fotos del servicio (opcional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="border p-2 rounded w-full"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Guardar Orden
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ServiceOrderFormPage;
