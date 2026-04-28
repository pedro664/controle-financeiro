import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Layout } from "./components/layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import { FixedCosts } from "./pages/FixedCosts";
import { Transactions } from "./pages/Transactions";
import { Categories } from "./pages/Categories";
import { ImportPDF } from "./pages/ImportPDF";
import { Settings } from "./pages/Settings";
import { CreditCardBills } from "./pages/CreditCardBills";
import { SeasonalBalance } from "./pages/SeasonalBalance";
import { Accounts } from "./pages/Accounts";
import { Login } from "./pages/Login";

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emeraldApp-50 dark:bg-gray-950">
        <div className="text-emeraldApp-700 dark:text-emeraldApp-300">Carregando...</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <RequireAuth>
          <Layout />
        </RequireAuth>
      }>
        <Route index element={<Dashboard />} />
        <Route path="fixed-costs" element={<FixedCosts />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="categories" element={<Categories />} />
        <Route path="import" element={<ImportPDF />} />
        <Route path="settings" element={<Settings />} />
        <Route path="credit-card-bills" element={<CreditCardBills />} />
        <Route path="seasonal-balance" element={<SeasonalBalance />} />
        <Route path="accounts" element={<Accounts />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <HashRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </HashRouter>
  );
}

export default App;
