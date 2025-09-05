// QuotationPage.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  const { id } = useParams(); // ID de cotización si es edición
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inventoryList, setInventoryList] = useState([]); // Inventario cargado desde backend
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const formData = useSelector((state) => state.quotation);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // 🔹 Cargar inventario
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await api.get("/products", config);
        setInventoryList(data);
      } catch (err) {
        console.error(err);
        alert("Error cargando inventario");
      }
    };
    fetchInventory();
  }, []);

  // 🔹 Cargar cotización existente
  useEffect(() => {
    const fetchQuotation = async () => {
      if (!id) return;
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await api.get(`/quotations/${id}`, config);

        // Datos generales
        dispatch(
          updateFormData({
            cliente: data.cliente,
            telefono: data.telefono,
            email: data.email,
            placa: data.placa,
            vehiculo: data.vehiculo,
            kilometraje: data.kilometraje,
            fechaVencimiento: data.fecha || "",
            discountPercent: data.discount_percent || 0,
          })
        );

        // Ítems
        if (data.items?.length > 0) {
          data.items.forEach((item) => {
            dispatch(
              addItem({
                tipo: "repuesto",
                descripcion: item.descripcion,
                cantidad: item.cantidad,
                precio_unitario: parseFloat(item.precio_unitario),
                productId: item.product_id || null,
              })
            );
          });
        }
      } catch (err) {
        console.error(err);
        alert("Error cargando la cotización");
      }
    };

    dispatch(resetForm());
    if (id) fetchQuotation();
  }, [id, dispatch]);

  // 🔹 Recalcular totales
  useEffect(() => {
    dispatch(updateCalculations());
  }, [formData.items, formData.discountPercent, dispatch]);

  // 🔹 Guardar/Actualizar cotización
  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const quotationData = {
        ...formData,
        subtotal: formData.subtotal,
        discount: formData.discount,
        total: formData.total,
        items: formData.items,
      };

      if (id) {
        await api.put(`/quotations/${id}`, quotationData, config);
        alert("Cotización actualizada con éxito");
      } else {
        const { data: newQuotation } = await api.post(
          "/quotations",
          quotationData,
          config
        );

        for (const item of formData.items) {
          await api.post(
            `/quotations/${newQuotation.id}/items`,
            { ...item },
            config
          );
        }
        alert("Cotización creada con éxito");
      }

      dispatch(resetForm());
      navigate("/historial-cotizaciones");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error guardando cotización");
    }
  };

  // 🔹 Cambiar datos generales
  const handleChange = (e) => {
    dispatch(updateFormData({ [e.target.name]: e.target.value }));
  };

  // 🔹 Agregar item manual
  const addManualItem = () => {
    dispatch(
      addItem({
        tipo: "repuesto",
        descripcion: "",
        cantidad: 1,
        precio_unitario: 0,
      })
    );
  };

  // 🔹 Agregar item desde inventario
  const addFromInventory = () => {
    const selected = window.prompt(
      "Escribe el ID del producto que deseas agregar:\n" +
        inventoryList.map((el) => `${el.id} - ${el.nombre}`).join("\n")
    );
    const itemData = inventoryList.find(
      (el) => el.id.toString() === selected
    );
    if (itemData) {
      dispatch(
        addItem({
          tipo: "repuesto",
          descripcion: itemData.nombre,
          cantidad: 1,
          precio_unitario: itemData.precio_unitario || 0,
          productId: itemData.id,
        })
      );
    }
  };

  // 🔹 Actualizar item
  const handleItemChange = (index, field, value) => {
    dispatch(
      updateItem({
        index,
        field,
        value:
          field === "cantidad" || field === "precio_unitario"
            ? Number(value)
            : value,
      })
    );
  };

  // 🔹 Eliminar item
  const removeItemHandler = (index) => {
    dispatch(removeItem(index));
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
            {/* Encabezado */}
            <div className="flex justify-between items-center border-b pb-4 mb-6">
              <h2 className="text-3xl font-bold">
                {id ? "Editar Cotización" : "Nueva Cotización"}
              </h2>
              <button
                onClick={() => navigate(-1)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Regresar
              </button>
            </div>

            {/* Campos de cotización */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                "cliente",
                "telefono",
                "email",
                "placa",
                "vehiculo",
                "kilometraje",
              ].map((field) => (
                <input
                  key={field}
                  name={field}
                  value={formData[field] || ""}
                  onChange={handleChange}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  className="border p-2"
                />
              ))}
              <input
                type="date"
                name="fechaVencimiento"
                value={formData.fechaVencimiento || ""}
                onChange={handleChange}
                className="border p-2"
              />
            </div>

            {/* Botones de agregar */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={addFromInventory}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Agregar desde inventario
              </button>
              <button
                onClick={addManualItem}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Agregar manual
              </button>
            </div>

            {/* Tabla de ítems */}
            <table className="w-full border mb-4">
              <thead className="bg-gray-200">
                <tr>
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
                        value={item.precio_unitario}
                        onChange={(e) =>
                          handleItemChange(idx, "precio_unitario", e.target.value)
                        }
                        className="border p-1 w-24"
                      />
                    </td>
                    <td className="border p-2">
                      {(item.cantidad * item.precio_unitario).toLocaleString(
                        "es-CO",
                        {
                          style: "currency",
                          currency: "COP",
                          minimumFractionDigits: 2,
                        }
                      )}
                    </td>
                    <td className="border p-2 text-center">
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
            <div className="mb-4 flex items-center gap-4">
              <label className="font-medium text-gray-700">Descuento (%):</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.discountPercent || 0}
                onChange={(e) => {
                  let value = Number(e.target.value);
                  if (isNaN(value)) value = 0;
                  if (value < 0) value = 0;
                  if (value > 100) value = 100;
                  dispatch(updateFormData({ discountPercent: value }));
                }}
                className="border p-2 w-24"
              />
              {formData.discountPercent > 0 && (
                <span className="text-gray-700 font-medium">
                  Aplicado: {formData.discountPercent}%
                </span>
              )}
            </div>

            {/* Totales */}
            <div className="text-right mb-6 border-t pt-4">
              <p className="text-gray-700">
                Subtotal:{" "}
                {formData.subtotal.toLocaleString("es-CO", {
                  style: "currency",
                  currency: "COP",
                  minimumFractionDigits: 2,
                })}
              </p>
              {formData.discount > 0 && (
                <p className="text-yellow-600">
                  Descuento: -{" "}
                  {formData.discount.toLocaleString("es-CO", {
                    style: "currency",
                    currency: "COP",
                    minimumFractionDigits: 2,
                  })}
                </p>
              )}
              <p className="font-bold text-2xl text-green-700">
                Total a pagar:{" "}
                {formData.total.toLocaleString("es-CO", {
                  style: "currency",
                  currency: "COP",
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>

            {/* Botones finales */}
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleSubmit}
                className="bg-indigo-600 text-white px-4 py-2 rounded"
              >
                {id ? "Actualizar Cotización" : "Guardar Cotización"}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default QuotationsPage;
