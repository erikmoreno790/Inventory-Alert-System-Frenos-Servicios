import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import api from '../api'

const InventoryFormPage = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    categoria_id: "", // ✅ Este es el que realmente enviamos al backend
    proveedor_id: "",
    stock_minimo: "",
    precio_costo: "",
    ubicacion: "",
    codigo: "",
  });

  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // ✅ Cargar proveedores y categorías
  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [catRes, provRes] = await Promise.all([
          api.get("products/categorias", config),
          api.get("products/proveedores", config),
        ]);

        setCategorias(catRes.data); // [{id_categoria, nombre}, ...]
        setProveedores(provRes.data);
      } catch (err) {
        console.error("Error cargando categorías o proveedores:", err);
      }
    };

    fetchData();
  }, [token]);

  // ✅ Si hay ID, cargar datos del producto para edición
  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await api.get(
          `products/${id}`,
          config
        );
        setForm({
          nombre: res.data.nombre,
          descripcion: res.data.descripcion || "",
          categoria_id: res.data.categoria_id || "", // ✅ Se guarda como ID, no como texto
          proveedor_id: res.data.proveedor_id || "",
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

  // ✅ En el submit enviamos form con categoria_id como número
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
        await api.put(
          `/products/${id}`,
          form,
          config
        );
      } else {
        await api.post("/products", form, config);
      }
      navigate("/inventario");
    } catch (err) {
      console.error(
        "Error al guardar el repuesto:",
        err.response?.data || err.message
      );
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
                Información del Repuesto/Item
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
            <div className="p-6 max-w-2xl mx-auto">
              <form
                onSubmit={handleSubmit}
                className="space-y-4 bg-white p-6 rounded shadow"
              >
                <div>
                  <label className="block mb-1">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block mb-1">Descripción</label>
                  <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  ></textarea>
                </div>

                <div>
                  <label className="block mb-1">Categoría</label>
                  {/* ✅ Cambiado: usamos categoria_id como value */}
                  <select
                    name="categoria_id"
                    value={form.categoria_id}
                    onChange={handleChange} // Actualiza form.categoria_id
                    required
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Seleccione una categoría</option>
                    {categorias.map((cat) => (
                      <option key={cat.id_categoria} value={cat.id_categoria}>
                        {cat.nombre} {/* Texto visible */}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Proveedor</label>
                  <select
                    name="proveedor_id"
                    value={form.proveedor_id}
                    onChange={handleChange}
                    required
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Seleccione un proveedor</option>
                    {proveedores.map((prov) => (
                      <option key={prov.id} value={prov.id}>
                        {prov.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stock mínimo */}
                <div>
                  <label className="block mb-1">Stock mínimo</label>
                  <input
                    type="number"
                    name="stock_minimo"
                    value={form.stock_minimo}
                    onChange={handleChange}
                    required
                    min={0}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                {/* Precio */}
                <div>
                  <label className="block mb-1">Precio de costo</label>
                  <input
                    type="number"
                    name="precio_costo"
                    value={form.precio_costo}
                    onChange={handleChange}
                    required
                    min={0}
                    step="0.01"
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                {/* Ubicación */}
                <div>
                  <label className="block mb-1">Ubicación</label>
                  <input
                    type="text"
                    name="ubicacion"
                    value={form.ubicacion}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                {/* Código interno */}
                <div>
                  <label className="block mb-1">Código interno</label>
                  <input
                    type="text"
                    name="codigo"
                    value={form.codigo}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div className="text-right">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
                  >
                    {id ? "Actualizar" : "Guardar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InventoryFormPage;
