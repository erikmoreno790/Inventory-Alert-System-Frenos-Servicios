import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import api from "../api";

const EditarCotizacionPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // id de la cotización a editar
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const [cotizacion, setCotizacion] = useState({
    fecha: new Date().toISOString().split("T")[0],
    nombre_cliente: "",
    nit_cc: "",
    telefono: "",
    vehiculo: "",
    modelo: "",
    placa: "",
    kilometraje: "",
    nombre_mecanico: "",
    observaciones: "",
    estatus: "Pendiente",
    porcentaje_descuento: 0,
    items: [{ descripcion: "", cantidad: 1, precio_unitario: 0, sub_total: 0 }],
    imagenes: [],
  });

  // 🔹 Traer cotización existente
  useEffect(() => {
    const fetchCotizacion = async () => {
      try {
        const { data } = await api.get(`/cotizaciones/${id}`, config);
        const items = data.items.map((item) => ({
          ...item,
          sub_total: item.cantidad * item.precio_unitario,
        }));
        setCotizacion({ ...data, items, imagenes: data.imagenes || [] });
      } catch (err) {
        console.error(err);
        alert("Error cargando la cotización");
      } finally {
        setLoading(false);
      }
    };

    fetchCotizacion();
  }, [id]);

  // 🔹 Calcular totales
  const calcularTotales = () => {
    let subtotal = 0;
    const items = cotizacion.items.map((item) => {
      const sub_total = item.cantidad * item.precio_unitario;
      subtotal += sub_total;
      return { ...item, sub_total };
    });
    const descuento = (subtotal * cotizacion.porcentaje_descuento) / 100;
    const total = subtotal - descuento;
    return { items, subtotal, descuento, total };
  };

  const { items, subtotal, descuento, total } = calcularTotales();

  // 🔹 Cambiar valores generales
  const handleChange = (e) => {
    setCotizacion({ ...cotizacion, [e.target.name]: e.target.value });
  };

  // 🔹 Manejar selección de imágenes nuevas
  const handleImageChange = (e) => {
    setNewImages([...newImages, ...e.target.files]);
  };

  // 🔹 Eliminar imagen existente
  const handleDeleteImage = async (imgUrl) => {
    if (!window.confirm("¿Eliminar esta imagen?")) return;

    try {
      await api.delete(`/cotizaciones/${id}/imagenes`, {
        ...config,
        data: { imagen_url: imgUrl },
      });
      setCotizacion({
        ...cotizacion,
        imagenes: cotizacion.imagenes.filter((img) => img.url !== imgUrl),
      });
      alert("Imagen eliminada");
    } catch (error) {
      console.error(error);
      alert("Error al eliminar imagen");
    }
  };

  // 🔹 Subir imágenes nuevas
  const handleUploadImages = async () => {
    if (newImages.length === 0) {
      alert("Selecciona imágenes primero");
      return;
    }

    const formData = new FormData();
    newImages.forEach((img) => formData.append("imagenes", img));

    try {
      await api.post(`/cotizaciones/${id}/imagenes`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Imágenes subidas correctamente");
      setNewImages([]);
      // Refrescar cotización
      const { data } = await api.get(`/cotizaciones/${id}`, config);
      setCotizacion(data);
    } catch (error) {
      console.error(error);
      alert("Error al subir imágenes");
    }
  };
  // 🔹 Cambiar valores de ítems
  const handleItemChange = (index, field, value) => {
    const newItems = [...cotizacion.items];
    newItems[index][field] =
      field === "cantidad" || field === "precio_unitario"
        ? parseFloat(value) || 0
        : value;
    setCotizacion({ ...cotizacion, items: newItems });
  };

  const addItem = () => {
    setCotizacion({
      ...cotizacion,
      items: [
        ...cotizacion.items,
        { descripcion: "", cantidad: 1, precio_unitario: 0, sub_total: 0 },
      ],
    });
  };

  const removeItem = (index) => {
    setCotizacion({
      ...cotizacion,
      items: cotizacion.items.filter((_, i) => i !== index),
    });
  };

  // 🔹 Guardar cambios
  const handleSubmit = async () => {
    if (!cotizacion.nombre_cliente.trim() || !cotizacion.placa.trim()) {
      alert("El nombre del cliente y la placa son obligatorios.");
      return;
    }

    try {
      await api.put(
        `/cotizaciones/${id}`,
        { ...cotizacion, items, subtotal, descuento, total },
        config
      );
      alert("¡Cotización actualizada exitosamente!");
      navigate("/historial-cotizaciones");
    } catch (error) {
      console.error(error);
      alert("Error al actualizar la cotización.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-500">Cargando cotización...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div
        className={`flex-1 ${
          sidebarOpen ? "ml-64" : ""
        } transition-all duration-300`}
      >
        <TopNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main>
          <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center border-b pb-4 mb-6">
              <h2 className="text-3xl font-bold">Editar Cotización</h2>
              <button
                onClick={() => navigate(-1)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Regresar
              </button>
            </div>

            {/* Datos generales */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <input
                type="date"
                name="fecha"
                value={cotizacion.fecha}
                onChange={handleChange}
                className="border p-2"
              />
              <input
                name="nombre_cliente"
                value={cotizacion.nombre_cliente}
                onChange={handleChange}
                placeholder="Nombre del cliente *"
                className="border p-2"
              />
              <input
                name="nit_cc"
                value={cotizacion.nit_cc}
                onChange={handleChange}
                placeholder="NIT o C.C."
                className="border p-2"
              />
              <input
                name="telefono"
                value={cotizacion.telefono}
                onChange={handleChange}
                placeholder="Teléfono"
                className="border p-2"
              />
              <input
                name="placa"
                value={cotizacion.placa}
                onChange={handleChange}
                placeholder="Placa del vehículo *"
                className="border p-2"
              />
              <input
                name="vehiculo"
                value={cotizacion.vehiculo}
                onChange={handleChange}
                placeholder="Vehículo"
                className="border p-2"
              />
              <input
                name="modelo"
                value={cotizacion.modelo}
                onChange={handleChange}
                placeholder="Modelo"
                className="border p-2"
              />
              <input
                name="kilometraje"
                value={cotizacion.kilometraje}
                onChange={handleChange}
                placeholder="Kilometraje"
                className="border p-2"
              />
              <input
                name="nombre_mecanico"
                value={cotizacion.nombre_mecanico}
                onChange={handleChange}
                placeholder="Mecánico"
                className="border p-2"
              />
            </div>

            {/* Observaciones */}
            <textarea
              name="observaciones"
              value={cotizacion.observaciones}
              onChange={handleChange}
              placeholder="Observaciones"
              className="border p-2 w-full mb-6"
              rows={3}
            />

            {/* 🔹 Imágenes existentes */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Imágenes Asociadas</h3>
              {cotizacion.imagenes && cotizacion.imagenes.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {cotizacion.imagenes.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative border rounded-lg overflow-hidden group"
                    >
                      <img
                        src={img.url}
                        alt={`Imagen ${idx + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      <button
                        onClick={() => handleDeleteImage(img.url)}
                        className="absolute top-1 right-1 bg-red-600 text-white px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">
                  No hay imágenes para esta cotización
                </p>
              )}
            </div>

            {/* 🔹 Subir nuevas imágenes */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Agregar Imágenes</h3>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="border p-2 mb-3"
              />
              {newImages.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {Array.from(newImages).map((file, idx) => (
                    <div key={idx} className="text-sm text-gray-600">
                      {file.name}
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={handleUploadImages}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Subir Imágenes
              </button>
            </div>

            {/* Items */}
            {/* ... resto de la tabla y totales igual que antes ... */}

            {/* Totales */}
            <div className="text-right mb-6 border-t pt-4">
              <p>
                Subtotal:{" "}
                {subtotal.toLocaleString("es-CO", {
                  style: "currency",
                  currency: "COP",
                })}
              </p>
              {descuento > 0 && (
                <p className="text-yellow-600">
                  Descuento: -{" "}
                  {descuento.toLocaleString("es-CO", {
                    style: "currency",
                    currency: "COP",
                  })}
                </p>
              )}
              <p className="font-bold text-2xl text-green-700">
                Total a pagar:{" "}
                {total.toLocaleString("es-CO", {
                  style: "currency",
                  currency: "COP",
                })}
              </p>
            </div>

            {/* Botón */}
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleSubmit}
                className="bg-indigo-600 text-white px-4 py-2 rounded"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EditarCotizacionPage;
