import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import api from "../api";

const EntryFormPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [repuestos, setRepuestos] = useState([]);
  const [form, setForm] = useState({
    repuesto_id: "",
    tipo_entrada: "",
    cantidad: "",
    proveedor: "",
    factura: "",
    observacion: "",
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // 🔹 Cargar repuestos existentes
  useEffect(() => {
    const fetchRepuestos = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await api.get("/repuestos", config);
        setRepuestos(res.data);
      } catch (err) {
        console.error("Error cargando repuestos:", err);
      }
    };
    fetchRepuestos();
  }, [token]);

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
      await api.post("/entradas", form, config);
      navigate("/entradas"); // redirige al listado de entradas
    } catch (err) {
      console.error("Error registrando entrada:", err.response?.data || err.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={`flex-1 ${sidebarOpen ? "ml-64" : ""} transition-all duration-300`}>
        <TopNavbar onToggleSidebar={toggleSidebar} />
        <main className="p-6 max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Registrar Entrada</h2>
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
            {/* Repuesto */}
            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2 font-medium">Repuesto *</label>
              <select
                name="repuesto_id"
                value={form.repuesto_id}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione un repuesto</option>
                {repuestos.map((r) => (
                  <option key={r.repuesto_id} value={r.repuesto_id}>
                    {r.nombre} ({r.codigo})
                  </option>
                ))}
              </select>
            </div>

            {/* Cantidad */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Cantidad *</label>
              <input
                type="number"
                name="cantidad"
                value={form.cantidad}
                onChange={handleChange}
                required
                min={1}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/*Tipo de entrada*/}
            <div>
          <label className="block text-gray-700 mb-2 font-medium">Tipo de entrada</label>
          <select
            name="tipo"
            value={form.tipo_entrada}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="compra">Compra</option>
            <option value="devolucion">Devolución</option>
            <option value="ajuste">Ajuste</option>
            <option value="otro">Otro</option>
          </select>
        </div>

            {/* Proveedor */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Proveedor</label>
              <input
                type="text"
                name="proveedor"
                value={form.proveedor}
                onChange={handleChange}
                placeholder="Opcional si es distinto al registrado"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Factura */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Factura / Documento</label>
              <input
                type="text"
                name="factura"
                value={form.factura}
                onChange={handleChange}
                placeholder="Número de factura o guía"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Observación */}
            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2 font-medium">Observación</label>
              <textarea
                name="observacion"
                value={form.observacion}
                onChange={handleChange}
                rows={3}
                placeholder="Detalles de la entrada (ej. lote, vencimiento, condiciones)"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Botón */}
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700 transition"
              >
                Guardar Entrada
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default EntryFormPage;




