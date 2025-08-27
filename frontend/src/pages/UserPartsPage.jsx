import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";

const UsePartsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const [parts, setParts] = useState([
    { nombre: "", cantidad: "", observacion: "" },
  ]);
  const [allParts, setAllParts] = useState([]);
  const [filteredParts, setFilteredParts] = useState([]);
  const token = localStorage.getItem("token");

  // Cargar todos los repuestos existentes
  useEffect(() => {
    const fetchParts = async () => {
      try {
        const res = await api.get("/products", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllParts(res.data);
      } catch (err) {
        console.error("Error al cargar los repuestos:", err);
      }
    };
    fetchParts();
  }, [token]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handlePartChange = (index, field, value) => {
    const updatedParts = [...parts];
    updatedParts[index][field] = value;

    // Filtrar lista solo cuando se escribe en "nombre"
    if (field === "nombre") {
      const filtro = value.toLowerCase();
      setFilteredParts(
        allParts.filter((p) => p.nombre.toLowerCase().includes(filtro))
      );
    }
    setParts(updatedParts);
  };

  const handleNameBlur = async (index) => {
    const nombre = parts[index].nombre.trim().toLowerCase();
    if (!nombre) return;

    const exists = allParts.some((p) => p.nombre.toLowerCase() === nombre);

    if (!exists) {
      const confirmCreate = window.confirm(
        "El repuesto no existe en la base de datos, ¿Desea crearlo?"
      );

      if (confirmCreate) {
        navigate("/inventario/nuevo");
      } else {
        try {
          const res = await api.post(
            "/products/minimal",
            { nombre: parts[index].nombre },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          // Actualizar lista local con el nuevo repuesto mínimo
          setAllParts([...allParts, res.data]);
          alert("Repuesto creado con valores mínimos para edición posterior.");
        } catch (err) {
          console.error("Error al crear repuesto mínimo:", err);
        }
      }
    }
  };

  const selectSuggestion = (index, nombre) => {
    const updatedParts = [...parts];
    updatedParts[index].nombre = nombre;
    setParts(updatedParts);
    setFilteredParts([]);
  };

  const addPartRow = () => {
    setParts([...parts, { nombre: "", cantidad: "", observacion: "" }]);
    setFilteredParts([]);
  };

  const removePartRow = (index) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(
        `/service-orders/${id}/used-parts`,
        { parts },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Repuestos registrados con éxito");
      setParts([{ nombre: "", cantidad: "", observacion: "" }]);
    } catch (error) {
      console.error("Error al registrar los repuestos usados:", error);
      alert("Error al guardar los repuestos");
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
            <h2 className="text-2xl font-bold mb-4">
              Registrar Repuestos Usados para la Orden de Servicio #{id}
            </h2>
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Regresar
            </button>
            <form
              onSubmit={handleSubmit}
              className="space-y-4 bg-white p-6 rounded shadow"
            >
              {parts.map((part, index) => (
                <div
                  key={index}
                  className="relative grid grid-cols-1 md:grid-cols-4 gap-3"
                >
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Nombre del repuesto"
                      value={part.nombre}
                      onChange={(e) =>
                        handlePartChange(index, "nombre", e.target.value)
                      }
                      onBlur={() => handleNameBlur(index)}
                      className="border p-2 rounded w-full"
                      required
                    />
                    {filteredParts.length > 0 && part.nombre && (
                      <ul className="absolute z-10 bg-white border w-full max-h-40 overflow-y-auto rounded shadow">
                        {filteredParts.map((p) => (
                          <li
                            key={p.id}
                            className="p-2 hover:bg-gray-200 cursor-pointer"
                            onClick={() => selectSuggestion(index, p.nombre)}
                          >
                            {p.nombre}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <input
                    type="number"
                    placeholder="Cantidad"
                    value={part.cantidad}
                    onChange={(e) =>
                      handlePartChange(index, "cantidad", e.target.value)
                    }
                    className="border p-2 rounded"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Observación"
                    value={part.observacion}
                    onChange={(e) =>
                      handlePartChange(index, "observacion", e.target.value)
                    }
                    className="border p-2 rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removePartRow(index)}
                    className="bg-red-500 text-white rounded px-3 py-1 hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addPartRow}
                className="bg-gray-200 text-gray-800 rounded px-4 py-2 hover:bg-gray-300"
              >
                + Añadir repuesto
              </button>
              <div>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Guardar repuestos usados
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UsePartsPage;
