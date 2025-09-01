import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

const EntriesPage = () => {
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState({
    producto_id: "",
    cantidad: "",
    tipo: "compra",
    observacion: "",
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await api.get("/products", config);
        setProductos(res.data);
      } catch (err) {
        console.error("Error al cargar productos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };
      await api.post("/inventory/entries", form, config);
      navigate("/inventario");
    } catch (err) {
      console.error(
        "Error al registrar entrada:",
        err.response?.data || err.message
      );
    }
  };

  if (loading)
    return <div className="p-6 text-gray-600">Cargando productos...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link
        to="/inventario"
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Volver al inventario
      </Link>

      <h1 className="text-2xl font-bold mb-4">Registrar Entrada de Repuesto</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded shadow"
      >
        <div>
          <label className="block mb-1">Repuesto</label>
          <select
            name="producto_id"
            value={form.producto_id}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Seleccione un repuesto</option>
            {productos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} ({p.codigo})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">Cantidad</label>
          <input
            type="number"
            name="cantidad"
            value={form.cantidad}
            onChange={handleChange}
            required
            min={1}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1">Tipo de entrada</label>
          <select
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          >
            <option value="compra">Compra</option>
            <option value="devolucion">Devolución</option>
            <option value="ajuste">Ajuste</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        <div>
          <label className="block mb-1">Observación</label>
          <textarea
            name="observacion"
            value={form.observacion}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="text-right">
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
          >
            Registrar Entrada
          </button>
        </div>
      </form>
    </div>
  );
};

export default EntriesPage;
