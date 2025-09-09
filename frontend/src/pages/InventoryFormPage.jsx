import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import api from "../api";

const InventoryFormPage = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    stock_actual: "",
    stock_minimo: "",
    precio_costo: "",
    ubicacion: "",
    codigo: "",
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // 🔹 Si hay ID, cargar datos del producto para edición
  useEffect(() => {
    if (!id) return;

    const fetchProducto = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await api.get(`products/${id}`, config);
        setForm({
          nombre: res.data.nombre || "",
          descripcion: res.data.descripcion || "",
          stock_actual: res.data.stock_actual || "",
          stock_minimo: res.data.stock_minimo || "",
          precio_costo: res.data.precio_costo || "",
          ubicacion: res.data.ubicacion || "",
          codigo: res.data.codigo || "",
        });
      } catch (err) {
        console.error("Error cargando producto:", err);
      }
    };

    fetchProducto();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    try {
      if (id) {
        await api.put(`/products/${id}`, form, config);
      } else {
        await api.post("/products", form, config);
      }
      navigate("/inventario");
    } catch (err) {
      console.error("Error al guardar el repuesto:", err.response?.data || err.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={`flex-1 ${sidebarOpen ? "ml-64" : ""} transition-all duration-300`}>
        <TopNavbar onToggleSidebar={toggleSidebar} />
        <main className="p-6 max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              {id ? "Editar Repuesto" : "Nuevo Repuesto"}
            </h2>
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Regresar
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-lg p-8 grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Nombre */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Nombre *</label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Código */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Código interno</label>
              <input
                type="text"
                name="codigo"
                value={form.codigo}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Descripción */}
            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2 font-medium">Descripción</label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                rows={3}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Stock actual */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Stock actual *</label>
              <input
                type="number"
                name="stock_actual"
                value={form.stock_actual}
                onChange={handleChange}
                required
                min={0}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Stock mínimo */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Stock mínimo *</label>
              <input
                type="number"
                name="stock_minimo"
                value={form.stock_minimo}
                onChange={handleChange}
                required
                min={0}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Precio */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Precio de costo *</label>
              <input
                type="number"
                name="precio_costo"
                value={form.precio_costo}
                onChange={handleChange}
                required
                min={0}
                step="0.01"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Ubicación */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Ubicación</label>
              <input
                type="text"
                name="ubicacion"
                value={form.ubicacion}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Botón */}
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition"
              >
                {id ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default InventoryFormPage;
