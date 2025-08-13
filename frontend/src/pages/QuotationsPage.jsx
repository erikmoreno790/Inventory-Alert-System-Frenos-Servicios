import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";

const QuotationsPage = () => {
  const [form, setForm] = useState({
    cliente: "",
    nit: "",
    telefono: "",
    email: "",
    placa: "",
    vehiculo: "",
    modelo: "",
    kilometraje: "",
    fechaVencimiento: "",
  });

  const [items, setItems] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [discount, setDiscount] = useState(0);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const calculateSubtotal = () =>
    items.reduce((sum, item) => sum + item.cantidad * item.precio, 0);

  const applyDiscount = () => {
  const input = prompt("Ingrese el descuento en porcentaje (ej: 10 para 10%)");
  if (!input) return;

  const percent = parseFloat(input.trim());
  if (!isNaN(percent) && percent >= 0 && percent <= 100) {
    setDiscountPercent(percent);
  } else {
    alert("Por favor ingrese un número válido entre 0 y 100");
  }
};

  // Cargar datos del backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, inventoryRes] = await Promise.all([
          axios.get("/api/services"),
          axios.get("/api/products"),
        ]);
        setServicesList(servicesRes.data);
        setInventoryList(inventoryRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addManualItem = (tipo) => {
    setItems([
      ...items,
      { tipo, descripcion: "", cantidad: 1, precio: 0, origen: "manual" },
    ]);
  };

  const addFromList = (tipo) => {
    const list = tipo === "servicio" ? servicesList : inventoryList;
    const selected = window.prompt(
      `Escribe el ID del ${tipo} que deseas agregar:\n` +
        list.map((el) => `${el.id} - ${el.nombre}`).join("\n")
    );
    const itemData = list.find((el) => el.id.toString() === selected);
    if (itemData) {
      setItems([
        ...items,
        {
          tipo,
          descripcion: itemData.nombre,
          cantidad: 1,
          precio: itemData.precio || 0,
          origen: "lista",
        },
      ]);
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] =
      field === "cantidad" || field === "precio" ? Number(value) : value;
    setItems(newItems);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = calculateSubtotal();
  const total = subtotal - discount;

  const handleSubmit = async () => {
    try {
      const payload = { ...form, items, subtotal, discount, total };
      await axios.post("/api/quotations", payload);
      alert("Cotización guardada con éxito");
      setForm({
        cliente: "",
        nit: "",
        telefono: "",
        email: "",
        placa: "",
        vehiculo: "",
        modelo: "",
        kilometraje: "",
        fechaVencimiento: "",
      });
      setItems([]);
      setDiscount(0);
    } catch (err) {
      console.error(err);
      alert("Error al guardar la cotización");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div
        className={`flex-1 ${sidebarOpen ? "ml-64" : ""} transition-all duration-300`}
      >
        <TopNavbar onToggleSidebar={toggleSidebar} />
        <main>
          <div className="p-6 max-w-4xl mx-auto">
            <div className="flex flex-wrap justify-between items-center border-b pb-4 mb-6">
              <h2 className="text-3xl font-bold text-gray-800">
                Nueva cotización
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

            {/* Datos del cliente */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <input name="cliente" value={form.cliente} onChange={handleFormChange} placeholder="Cliente / Empresa" className="border p-2" />
              <input name="nit" value={form.nit} onChange={handleFormChange} placeholder="NIT / CC" className="border p-2" />
              <input name="telefono" value={form.telefono} onChange={handleFormChange} placeholder="Teléfono" className="border p-2" />
              <input name="email" value={form.email} onChange={handleFormChange} placeholder="Email" className="border p-2" />
              <input name="placa" value={form.placa} onChange={handleFormChange} placeholder="Placa" className="border p-2" />
              <input name="vehiculo" value={form.vehiculo} onChange={handleFormChange} placeholder="Vehículo" className="border p-2" />
              <input name="modelo" value={form.modelo} onChange={handleFormChange} placeholder="Modelo" className="border p-2" />
              <input name="kilometraje" value={form.kilometraje} onChange={handleFormChange} placeholder="Kilometraje" className="border p-2" />
              <input type="date" name="fechaVencimiento" value={form.fechaVencimiento} onChange={handleFormChange} className="border p-2" />
            </div>

            {/* Botones de agregar */}
            <div className="flex gap-2 mb-4">
              <button onClick={() => addFromList("servicio")} className="bg-blue-500 text-white px-3 py-1 rounded">Agregar servicio desde lista</button>
              <button onClick={() => addManualItem("servicio")} className="bg-green-500 text-white px-3 py-1 rounded">Agregar servicio manual</button>
              <button onClick={() => addFromList("repuesto")} className="bg-blue-500 text-white px-3 py-1 rounded">Agregar repuesto desde inventario</button>
              <button onClick={() => addManualItem("repuesto")} className="bg-green-500 text-white px-3 py-1 rounded">Agregar repuesto manual</button>
            </div>

            {/* Tabla de items */}
            <table className="w-full border mb-4">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Tipo</th>
                  <th className="border p-2">Descripción</th>
                  <th className="border p-2">Cantidad</th>
                  <th className="border p-2">Precio</th>
                  <th className="border p-2">Subtotal</th>
                  <th className="border p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="border p-2">{item.tipo}</td>
                    <td className="border p-2">
                      <input value={item.descripcion} onChange={(e) => handleItemChange(idx, "descripcion", e.target.value)} className="border p-1 w-full" />
                    </td>
                    <td className="border p-2">
                      <input type="number" value={item.cantidad} onChange={(e) => handleItemChange(idx, "cantidad", e.target.value)} className="border p-1 w-16" />
                    </td>
                    <td className="border p-2">
                      <input type="number" value={item.precio} onChange={(e) => handleItemChange(idx, "precio", e.target.value)} className="border p-1 w-24" />
                    </td>
                    <td className="border p-2">{(item.cantidad * item.precio).toFixed(2)}</td>
                    <td className="border p-2">
                      <button onClick={() => removeItem(idx)} className="bg-red-500 text-white px-2 py-1 rounded">X</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Botón descuento */}
            <button 
              onClick={applyDiscount} 
              className="bg-yellow-500 text-white px-4 py-2 rounded"
            >
              Aplicar Descuento
            </button>

            {/* Totales */}
            <div className="text-right mb-4">
              <p>Subtotal: ${subtotal.toFixed(2)}</p>
              {discount > 0 && <p>Descuento: -${discount.toFixed(2)}</p>}
              <p className="font-bold">Total: ${total.toFixed(2)}</p>
            </div>

            {/* Guardar */}
            <button onClick={handleSubmit} className="bg-indigo-600 text-white px-4 py-2 rounded">Guardar Cotización</button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default QuotationsPage;
