import { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const MovementsHistoryPage = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [filters, setFilters] = useState({
    tipo: '',
    producto_id: '',
    fecha_inicio: '',
    fecha_fin: '',
  });
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  const fetchMovimientos = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const params = {};

      if (filters.tipo) params.tipo = filters.tipo;
      if (filters.producto_id) params.producto_id = filters.producto_id;
      if (filters.fecha_inicio) params.fecha_inicio = filters.fecha_inicio;
      if (filters.fecha_fin) params.fecha_fin = filters.fecha_fin;

      const res = await axios.get('http://localhost:3000/api/inventory/movements', {
        ...config,
        params,
      });
      setMovimientos(res.data);
    } catch (err) {
      console.error('Error al obtener movimientos:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductos = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProductos(res.data);
    } catch (err) {
      console.error('Error al cargar productos:', err);
    }
  };

  useEffect(() => {
    fetchProductos();
    fetchMovimientos();
    // eslint-disable-next-line
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilter = (e) => {
    e.preventDefault();
    fetchMovimientos();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Historial de Movimientos</h1>

      {/* Filtros */}
      <form className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded shadow mb-6" onSubmit={handleFilter}>
        <div>
          <label className="block text-sm mb-1">Tipo</label>
          <select name="tipo" value={filters.tipo} onChange={handleChange} className="w-full border rounded px-2 py-1">
            <option value="">Todos</option>
            <option value="entrada">Entrada</option>
            <option value="salida">Salida</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Producto</label>
          <select name="producto_id" value={filters.producto_id} onChange={handleChange} className="w-full border rounded px-2 py-1">
            <option value="">Todos</option>
            {productos.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Desde</label>
          <input type="date" name="fecha_inicio" value={filters.fecha_inicio} onChange={handleChange} className="w-full border rounded px-2 py-1" />
        </div>

        <div>
          <label className="block text-sm mb-1">Hasta</label>
          <input type="date" name="fecha_fin" value={filters.fecha_fin} onChange={handleChange} className="w-full border rounded px-2 py-1" />
        </div>

        <div className="md:col-span-4 text-right">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Aplicar Filtros</button>
        </div>
      </form>

      {/* Tabla */}
      {loading ? (
        <div className="text-gray-500">Cargando movimientos...</div>
      ) : movimientos.length === 0 ? (
        <div className="text-gray-500">No se encontraron movimientos.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-3 py-2 text-left">Fecha</th>
                <th className="border px-3 py-2 text-left">Tipo</th>
                <th className="border px-3 py-2 text-left">Producto</th>
                <th className="border px-3 py-2 text-left">Cantidad</th>
                <th className="border px-3 py-2 text-left">Usuario</th>
                <th className="border px-3 py-2 text-left">Observación</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((m) => (
                <tr key={m.id}>
                  <td className="border px-3 py-2">{format(new Date(m.fecha), 'yyyy-MM-dd HH:mm')}</td>
                  <td className="border px-3 py-2 capitalize">{m.tipo}</td>
                  <td className="border px-3 py-2">{m.producto?.nombre || '—'}</td>
                  <td className="border px-3 py-2">{m.cantidad}</td>
                  <td className="border px-3 py-2">{m.usuario}</td>
                  <td className="border px-3 py-2">{m.observacion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MovementsHistoryPage;
