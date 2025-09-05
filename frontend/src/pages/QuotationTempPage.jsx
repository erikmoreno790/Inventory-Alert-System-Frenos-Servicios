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

const QuotationsTempPage = () => {
  const { id } = useParams(); // ID de cotización temporal
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const formData = useSelector((state) => state.quotation);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // 🔹 Cargar cotización temporal y sus items
  useEffect(() => {
    const fetchQuotationTemp = async () => {
      if (!id) return;
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Obtener datos de cotización
        const { data: quotation } = await api.get(
          `/quotations-temp/${id}`,
          config
        );
        dispatch(
          updateFormData({
            cliente: quotation.cliente,
            nit: quotation.nit,
            telefono: quotation.telefono,
            email: quotation.email,
            placa: quotation.placa,
            vehiculo: quotation.vehiculo,
            modelo: quotation.modelo,
            kilometraje: quotation.kilometraje,
            fecha_cotizacion: quotation.fecha_cotizacion?.split("T")[0] || "",
            discount: quotation.discount || 0,
          })
        );

        // Obtener items
        const { data: items } = await api.get(
          `/quotations-temp/${id}/items`,
          config
        );
        if (items.length > 0) {
          items.forEach((item) => {
            dispatch(
              addItem({
                descripcion: item.descripcion,
                cantidad: item.cantidad,
                precio: item.precio,
                origen: "manual",
              })
            );
          });
        }
      } catch (err) {
        console.error(err);
        alert("Error cargando cotización temporal");
      }
    };

    if (id) {
      dispatch(resetForm());
      fetchQuotationTemp();
    }
  }, [id, dispatch]);

  // 🔹 Recalcular totales cuando cambian items o descuento
  useEffect(() => {
    dispatch(updateCalculations());
  }, [formData.items, formData.discount, dispatch]);

  // 🔹 Guardar o actualizar cotización temporal
  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (id) {
        console.log(`🔹 PUT => /quotations-temp/${id}`);
        await api.put(
          `/quotations-temp/${id}`,
          {
            cliente: formData.cliente,
            nit: formData.nit,
            telefono: formData.telefono,
            email: formData.email,
            placa: formData.placa,
            vehiculo: formData.vehiculo,
            modelo: formData.modelo,
            kilometraje: formData.kilometraje,
            fecha_cotizacion: formData.fecha_cotizacion,
            discount: formData.discount,
          },
          config
        );

        console.log(`🔹 DELETE => /quotations-temp/${id}/items`);
        await api.delete(`/quotations-temp/${id}/items`, config);

        for (const item of formData.items) {
          console.log(`🔹 POST => /quotations-temp/${id}/items`, item);
          await api.post(
            `/quotations-temp/${id}/items`,
            {
              descripcion: item.descripcion,
              cantidad: item.cantidad,
              precio: item.precio,
            },
            config
          );
        }

        alert("Cotización temporal actualizada");
      } else {
        console.log(`🔹 POST => /quotations-temp`);
        const { data: quotation } = await api.post(
          "/quotations-temp",
          {
            cliente: formData.cliente,
            nit: formData.nit,
            telefono: formData.telefono,
            email: formData.email,
            placa: formData.placa,
            vehiculo: formData.vehiculo,
            modelo: formData.modelo,
            kilometraje: formData.kilometraje,
            fecha_cotizacion: formData.fecha_cotizacion,
            discount: formData.discount,
          },
          config
        );

        for (const item of formData.items) {
          console.log(
            `🔹 POST => /quotations-temp/${quotation.id_quotation}/items`,
            item
          );
          await api.post(
            `/quotations-temp/${quotation.id_quotation}/items`,
            {
              producto: item.producto, // ✅ CAMBIADO
              cantidad: item.cantidad,
              precio: item.precio,
            },
            config
          );
        }

        alert("Cotización temporal creada");
      }

      dispatch(resetForm());
      navigate("/historial-cotizaciones-temp");
    } catch (err) {
      console.error("❌ Error al guardar cotización:", err);
      alert(err.response?.data?.message || "Error al guardar la cotización");
    }
  };

  // 🔹 Manejo de campos cliente
  const handleChange = (e) => {
    dispatch(updateFormData({ [e.target.name]: e.target.value }));
  };

  // 🔹 Agregar ítem manual
  const addManualItem = () => {
    dispatch(
      addItem({
        descripcion: "",
        cantidad: 1,
        precio: 0,
        origen: "manual",
      })
    );
  };

  // 🔹 Manejo de cambios en ítems
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

  // 🔹 Eliminar ítem
  const removeItemHandler = (index) => {
    dispatch(removeItem(index));
  };

  // 🔹 Aplicar descuento
  const applyDiscount = () => {
    const input = prompt("Ingrese el descuento en porcentaje (0-100):");
    if (!input) return;
    const percent = parseFloat(input.trim());
    if (!isNaN(percent) && percent >= 0 && percent <= 100) {
      dispatch(updateFormData({ discount: percent }));
    } else {
      alert("Por favor ingrese un número válido");
    }
  };

  const handlePrint = () => {
    navigate("/cotizacion-temp/pdf", { state: formData });
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
                {id
                  ? "Editar Cotización Temporal"
                  : "Nueva Cotización Temporal"}
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
                name="fecha_cotizacion"
                value={formData.fecha_cotizacion}
                onChange={handleChange}
                className="border p-2"
              />
            </div>

            {/* Botón agregar ítem manual */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={addManualItem}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                Agregar ítem manual
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
                {id
                  ? "Actualizar Cotización Temporal"
                  : "Guardar Cotización Temporal"}
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

export default QuotationsTempPage;
