import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import { useNavigate } from "react-router-dom";
import api from "../api";

const QuotationsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [setForm] = useState({});
  const [setItems] = useState([]);

  // 🔹 Un solo estado para todo
  const [formData, setFormData] = useState({
    cliente: "",
    nit: "",
    telefono: "",
    email: "",
    placa: "",
    vehiculo: "",
    modelo: "",
    kilometraje: "",
    fechaVencimiento: "",
    items: [],
    discountPercent: 0,
    subtotal: 0,
    discount: 0,
    total: 0,
    empresa: {
      nombre: "Frenos & Servicios",
      direccion: "Calle 123, Barranquilla",
      telefono: "3001234567",
      email: "contacto@test.com",
      redes: "@frenosyservicios",
    },
  });

  const [servicesList, setServicesList] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // 🔹 Recalcular subtotal, descuento y total automáticamente
  useEffect(() => {
    const subtotal = formData.items.reduce(
      (sum, item) => sum + item.cantidad * item.precio,
      0
    );
    const discount = (subtotal * formData.discountPercent) / 100;
    const total = subtotal - discount;

    setFormData((prev) => ({
      ...prev,
      subtotal,
      discount,
      total,
    }));
  }, [formData.items, formData.discountPercent]);

  // 🔹 Cargar datos del backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [servicesRes, inventoryRes] = await Promise.all([
          api.get("/service-orders", config),
          api.get("/products", config),
        ]);
        setServicesList(servicesRes.data);
        setInventoryList(inventoryRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  // 🔹 Handlers
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addManualItem = (tipo) => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { tipo, descripcion: "", cantidad: 1, precio: 0, origen: "manual" },
      ],
    }));
  };

  const addFromList = (tipo) => {
    const list = tipo === "servicio" ? servicesList : inventoryList;
    const selected = window.prompt(
      `Escribe el ID del ${tipo} que deseas agregar:\n` +
        list.map((el) => `${el.id} - ${el.nombre}`).join("\n")
    );
    const itemData = list.find((el) => el.id.toString() === selected);
    if (itemData) {
      setFormData((prev) => ({
        ...prev,
        items: [
          ...prev.items,
          {
            tipo,
            descripcion: itemData.nombre,
            cantidad: 1,
            precio: itemData.precio || 0,
            origen: "lista",
          },
        ],
      }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] =
      field === "cantidad" || field === "precio" ? Number(value) : value;
    setFormData({ ...formData, items: newItems });
  };

  const removeItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const applyDiscount = () => {
    const input = prompt("Ingrese el descuento en porcentaje (0-100):");
    if (!input) return;
    const percent = parseFloat(input.trim());
    if (!isNaN(percent) && percent >= 0 && percent <= 100) {
      setFormData({ ...formData, discountPercent: percent });
    } else {
      alert("Por favor ingrese un número válido");
    }
  };

  const handleSubmit = async () => {
    try {
      await api.post("quotations", formData);
      alert("Cotización guardada con éxito");
      setFormData({
        cliente: "",
        nit: "",
        telefono: "",
        email: "",
        placa: "",
        vehiculo: "",
        modelo: "",
        kilometraje: "",
        fechaVencimiento: "",
        items: [],
        discountPercent: 0,
        subtotal: 0,
        discount: 0,
        total: 0,
        empresa: formData.empresa,
      });
    } catch (err) {
      console.error(err);
      alert("Error al guardar la cotización");
    }
  };

  const handlePrint = () => {
    // 🔹 Guardar temporalmente en localStorage
    localStorage.setItem("currentQuotation", JSON.stringify(formData));

    // 🔹 Navegar sin necesidad de pasar state
    navigate("/cotizacion/pdf");
  };

  useEffect(() => {
    const savedQuotation = localStorage.getItem("currentQuotation");
    if (savedQuotation) {
      const data = JSON.parse(savedQuotation);
      setForm(data);
      setItems(data.items || []);
    }
  }, []);

  const handleCrearOrden = () => {
    const quotationData = {
      placa: formData.placa,
      vehiculo: formData.vehiculo,
      modelo: formData.modelo,
      cliente: formData.cliente,
      nit: formData.nit,
      telefono: formData.telefono,
      email: formData.email,
      kilometraje: formData.kilometraje,
      fecha_servicio: new Date().toISOString().split("T")[0],
      mecanicos: "",
      fotos: [],
    };
    navigate("/service-order/new", { state: quotationData });
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
            <div className="flex justify-between items-center border-b pb-4 mb-6">
              <h2 className="text-3xl font-bold text-gray-800">
                Nueva cotización
              </h2>
              <button
                onClick={() => navigate(-1)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg"
              >
                Regresar
              </button>
            </div>

            {/* Campos cliente */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                "cliente",
                "nit",
                "telefono",
                "email",
                "placa",
                "vehiculo",
                "modelo",
                "kilometraje",
              ].map((field) => (
                <input
                  key={field}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  className="border p-2"
                />
              ))}
              <input
                type="date"
                name="fechaVencimiento"
                value={formData.fechaVencimiento}
                onChange={handleChange}
                className="border p-2"
              />
            </div>

            {/* Botones agregar */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => addFromList("servicio")}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Servicio desde lista
              </button>
              <button
                onClick={() => addManualItem("servicio")}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Servicio manual
              </button>
              <button
                onClick={() => addFromList("repuesto")}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Repuesto desde inventario
              </button>
              <button
                onClick={() => addManualItem("repuesto")}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Repuesto manual
              </button>
            </div>

            {/* Tabla de ítems */}
            <table className="w-full border mb-4">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border p-2">Tipo</th>
                  <th className="border p-2">Descripción</th>
                  <th className="border p-2">Cantidad</th>
                  <th className="border p-2">Precio</th>
                  <th className="border p-2">Subtotal</th>
                  <th className="border p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="border p-2">{item.tipo}</td>
                    <td className="border p-2">
                      <input
                        value={item.descripcion}
                        onChange={(e) =>
                          handleItemChange(idx, "descripcion", e.target.value)
                        }
                        className="border p-1 w-full"
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="number"
                        value={item.cantidad}
                        onChange={(e) =>
                          handleItemChange(idx, "cantidad", e.target.value)
                        }
                        className="border p-1 w-16"
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="number"
                        value={item.precio}
                        onChange={(e) =>
                          handleItemChange(idx, "precio", e.target.value)
                        }
                        className="border p-1 w-24"
                      />
                    </td>
                    <td className="border p-2">
                      {(item.cantidad * item.precio).toFixed(2)}
                    </td>
                    <td className="border p-2">
                      <button
                        onClick={() => removeItem(idx)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        X
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Descuento */}
            <button
              onClick={applyDiscount}
              className="bg-yellow-500 text-white px-4 py-2 rounded mb-4"
            >
              Aplicar Descuento
            </button>

            {/* Totales */}
            <div className="text-right mb-4">
              <p>Subtotal: ${formData.subtotal.toFixed(2)}</p>
              {formData.discount > 0 && (
                <p>Descuento: -${formData.discount.toFixed(2)}</p>
              )}
              <p className="font-bold">Total: ${formData.total.toFixed(2)}</p>
            </div>

            {/* Botones finales */}
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleSubmit}
                className="bg-indigo-600 text-white px-4 py-2 rounded"
              >
                Guardar Cotización
              </button>
              <button
                onClick={handlePrint}
                className="bg-gray-600 text-white px-4 py-2 rounded"
              >
                Imprimir
              </button>
              <button
                onClick={handleCrearOrden}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Crear Orden
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default QuotationsPage;
