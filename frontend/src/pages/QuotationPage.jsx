import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  updateFormData,
  updateItem,
  addItem,
  removeItem,
  resetForm,
  updateCalculations,
} from "../components/quotationSlice";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import api from "../api";

const QuotationsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [servicesList, setServicesList] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const formData = useSelector((state) => state.quotation);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // 🔹 Cargar servicios e inventario
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
        alert("Error cargando datos iniciales");
      }
    };
    fetchData();
  }, []);

  // 🔹 Recalcular totales
  useEffect(() => {
    dispatch(updateCalculations());
  }, [formData.items, formData.discountPercent, dispatch]);

  // 🔹 Handlers locales
  const handleChange = (e) => {
    dispatch(updateFormData({ [e.target.name]: e.target.value }));
  };

  const addManualItem = (tipo) => {
    dispatch(
      addItem({
        tipo,
        descripcion: "",
        cantidad: 1,
        precio: 0,
        origen: "manual",
      })
    );
  };

  const addFromList = (tipo) => {
    const list = tipo === "servicio" ? servicesList : inventoryList;
    const selected = window.prompt(
      `Escribe el ID del ${tipo} que deseas agregar:\n` +
        list.map((el) => `${el.id} - ${el.nombre}`).join("\n")
    );
    const itemData = list.find((el) => el.id.toString() === selected);
    if (itemData) {
      dispatch(
        addItem({
          tipo,
          descripcion: itemData.nombre,
          cantidad: 1,
          precio: itemData.precio || 0,
          origen: "lista",
          productId: tipo === "repuesto" ? itemData.id : null, // Para validar stock
        })
      );
    }
  };

  const handleItemChange = (index, field, value) => {
    dispatch(
      updateItem({
        index,
        field,
        value:
          field === "cantidad" || field === "precio" ? Number(value) : value,
      })
    );
  };

  const removeItemHandler = (index) => {
    dispatch(removeItem(index));
  };

  const applyDiscount = () => {
    const input = prompt("Ingrese el descuento en porcentaje (0-100):");
    if (!input) return;
    const percent = parseFloat(input.trim());
    if (!isNaN(percent) && percent >= 0 && percent <= 100) {
      dispatch(updateFormData({ discountPercent: percent }));
    } else {
      alert("Por favor ingrese un número válido");
    }
  };

  // 🔹 Guardar cotización (crea cotización + ítems)
  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // 1. Crear cotización
      const { data: quotation } = await api.post(
        "/quotations",
        {
          cliente: formData.cliente,
          nit: formData.nit,
          telefono: formData.telefono,
          email: formData.email,
          placa: formData.placa,
          vehiculo: formData.vehiculo,
          modelo: formData.modelo,
          kilometraje: formData.kilometraje,
          fechaVencimiento: formData.fechaVencimiento,
          discountPercent: formData.discountPercent,
        },
        config
      );

      // 2. Agregar ítems
      for (const item of formData.items) {
        await api.post(
          `/quotations/${quotation.id}/items`,
          {
            tipo: item.tipo,
            descripcion: item.descripcion,
            cantidad: item.cantidad,
            precio: item.precio,
            productId: item.productId || null, // Para validar stock
          },
          config
        );
      }

      alert("Cotización guardada con éxito");
      dispatch(resetForm());
      navigate("/historial-cotizaciones");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error al guardar la cotización");
    }
  };

  const handlePrint = () => {
    navigate("/cotizacion/pdf", { state: formData });
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
                  <th className="border p-2">Eliminar</th>
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
                        onClick={() => removeItemHandler(idx)}
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
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default QuotationsPage;
