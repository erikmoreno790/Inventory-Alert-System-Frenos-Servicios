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
// import AlertSettingsPage from './pages/AlertSettingsPage'
import ServiceOrderFormPage from "./pages/ServiceOrderFormPage";
import ServiceOdersListPage from "./pages/ServiceOrdersHistoryPage";
import ServiceOrderDetailPage from "./pages/ServiceOrderDetailPage";
import EditServiceOrderPage from "./pages/EditServiceOrderPage";
import UserPartsPage from "./pages/UserPartsPage";
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
          path="/cotizacion/:id"
          element={
            <PrivateRoute>
              <QuotationDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/cotizacion/pdf"
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
          path="/ordenes-servicio"
          element={
            <PrivateRoute>
              <ServiceOdersListPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/ordenes-servicio/nueva"
          element={
            <PrivateRoute>
              <ServiceOrderFormPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/ordenes-servicio/:id"
          element={
            <PrivateRoute>
              <ServiceOrderDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/ordenes-servicio/edit/:id"
          element={
            <PrivateRoute>
              <EditServiceOrderPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/use-parts/:id"
          element={
            <PrivateRoute>
              <UserPartsPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
