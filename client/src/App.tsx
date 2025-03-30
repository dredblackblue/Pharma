import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import InventoryPage from "@/pages/inventory-page";
import PatientsPage from "@/pages/patients-page";
import DoctorsPage from "@/pages/doctors-page";
import PrescriptionsPage from "@/pages/prescriptions-page";
import BillingPage from "@/pages/billing-page";
import SuppliersPage from "@/pages/suppliers-page";
import ReportsPage from "@/pages/reports-page";

// Add Pages
import AddMedicinePage from "@/pages/add-medicine-page";
import AddPatientPage from "@/pages/add-patient-page";
import AddDoctorPage from "@/pages/add-doctor-page";
import AddPrescriptionPage from "@/pages/add-prescription-page";
import AddSupplierPage from "@/pages/add-supplier-page";
import AddTransactionPage from "@/pages/add-transaction-page-fixed";

import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={DashboardPage} />
      
      {/* Main pages */}
      <ProtectedRoute path="/inventory" component={InventoryPage} />
      <ProtectedRoute path="/patients" component={PatientsPage} />
      <ProtectedRoute path="/doctors" component={DoctorsPage} />
      <ProtectedRoute path="/prescriptions" component={PrescriptionsPage} />
      <ProtectedRoute path="/billing" component={BillingPage} />
      <ProtectedRoute path="/suppliers" component={SuppliersPage} />
      <ProtectedRoute path="/reports" component={ReportsPage} />
      
      {/* Add new item pages */}
      <ProtectedRoute path="/inventory/new" component={AddMedicinePage} />
      <ProtectedRoute path="/patients/new" component={AddPatientPage} />
      <ProtectedRoute path="/doctors/new" component={AddDoctorPage} />
      <ProtectedRoute path="/prescriptions/new" component={AddPrescriptionPage} />
      <ProtectedRoute path="/suppliers/new" component={AddSupplierPage} />
      <ProtectedRoute path="/billing/new" component={AddTransactionPage} />
      <ProtectedRoute path="/transactions/new" component={AddTransactionPage} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router />
      <Toaster />
    </AuthProvider>
  );
}

export default App;
