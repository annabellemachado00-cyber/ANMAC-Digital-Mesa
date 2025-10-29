import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import PanelPage from './pages/PanelPage';
import OrdersPage from './pages/OrdersPage';
import ProductsPage from './pages/ProductsPage';
import InventoryPage from './pages/InventoryPage';
import CostingPage from './pages/CostingPage';
import BreakevenPage from './pages/BreakevenPage';
import OperatorsPage from './pages/OperatorsPage';
import AttendancePage from './pages/AttendancePage';
import CustomersPage from './pages/CustomersPage';
import SuppliersPage from './pages/SuppliersPage';
import InvoicesPage from './pages/InvoicesPage';
import AdminPage from './pages/AdminPage';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={<ProtectedRoute isAllowed={isAuthenticated} redirectTo="/login" />}
      >
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/panel" replace />} />
          <Route path="panel" element={<PanelPage />} />
          <Route path="pedidos" element={<OrdersPage />} />
          <Route path="productos" element={<ProductsPage />} />
          <Route path="inventario" element={<InventoryPage />} />
          <Route path="costeo" element={<CostingPage />} />
          <Route path="equilibrio" element={<BreakevenPage />} />
          <Route path="operarias" element={<OperatorsPage />} />
          <Route path="asistencia" element={<AttendancePage />} />
          <Route path="clientes" element={<CustomersPage />} />
          <Route path="proveedores" element={<SuppliersPage />} />
          <Route path="facturas" element={<InvoicesPage />} />
          <Route path="admin" element={<AdminPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to={isAuthenticated ? '/panel' : '/login'} replace />} />
    </Routes>
  );
};

export default App;
