import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import InventoryListPage from "./pages/InventoryListPage";
import InventoryForm from "./pages/InventoryFormPage";
import InventoryDetailPage from "./pages/InventoryDetailPage";
import EntriesPage from "./pages/EntriesPage";
import ExitsPage from "./pages/ExitsPage";
import MovementsHistoryPage from "./pages/MovementsHistoryPage";
import AlertsPage from "./pages/AlertsHistoryPage";
import QuotationPage from "./pages/QuotationPage";
import QuotationPDFView from "./pages/QuotationPDFView";
import QuotationsHistoryPage from "./pages/QuotationsHistoryPage";
import QuotationDetailPage from "./pages/QuotationDetailPage";
import EditQuotationPage from "./pages/EditQuotationPage";
import ReporteRepuestosPage from "./pages/ReporteRepuestosPage";
// import AlertSettingsPage from './pages/AlertSettingsPage'
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />
        <Route path="*" element={<Login />} />
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/inventario"
          element={
            <PrivateRoute>
              <InventoryListPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/inventario/:id"
          element={
            <PrivateRoute>
              <InventoryDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/inventario/nuevo"
          element={
            <PrivateRoute>
              <InventoryForm />
            </PrivateRoute>
          }
        />

        <Route
          path="/inventario/entradas"
          element={
            <PrivateRoute>
              <EntriesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/inventario/salidas"
          element={
            <PrivateRoute>
              <ExitsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/inventario/movimientos"
          element={
            <PrivateRoute>
              <MovementsHistoryPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/alertas"
          element={
            <PrivateRoute>
              <AlertsPage />
            </PrivateRoute>
          }
        />
        {/* <Route path="/alertas/configuracion" element={<PrivateRoute><AlertSettingsPage/></PrivateRoute>} /> */}
        <Route
          path="/cotizacion"
          element={
            <PrivateRoute>
              <QuotationPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/cotizaciones/editar/:id"
          element={
            <PrivateRoute>
              <EditQuotationPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/cotizacion/:id"
          element={
            <PrivateRoute>
              <QuotationDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/cotizacion/pdf/:id"
          element={
            <PrivateRoute>
              <QuotationPDFView />
            </PrivateRoute>
          }
        />
        <Route
          path="/historial-cotizaciones"
          element={
            <PrivateRoute>
              <QuotationsHistoryPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/reporte-repuestos-usados"
          element={
            <PrivateRoute>
              <ReporteRepuestosPage/>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
