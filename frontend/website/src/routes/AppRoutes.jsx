import { Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "../components/layout/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";

import Login from "../features/auth/pages/Login";
import Dashboard from "../features/dashboard/pages/Dashboard";
import Farmers from "@/features/farmers/pages/Farmers";
import ProcurementLots from "../features/procurement/pages/ProcurementLots";
import Agreements from "../features/procurement/pages/Agreements";
import CreateAgreement from "../features/procurement/pages/CreateAgreement";
import FarmerDetails from "../features/farmers/pages/FarmerDetails";
import FarmVerification from "../features/farmers/pages/FarmVerification";
import FarmVerificationList from "../features/farmers/pages/FarmVerificationList";
import EditFarmer from "../features/farmers/pages/EditFarmer";
import ProcurementLotDetails from "../features/procurement/pages/ProcurementLotDetails";
import QualityInspection from "../features/quality/pages/QualityInspection";
import QualityManagement from "../features/quality/pages/QualityManagement";
import Certification from "../features/certification/pages/Certification";
import PaymentProcessing from "../features/payments/pages/PaymentProcessing";
import Marketplace from "../features/marketplace/pages/Marketplace";
import MarketplaceListingDetails from "../features/marketplace/pages/MarketplaceListingDetails";
import CreateMarketplaceListing from "../features/marketplace/pages/CreateMarketplaceListing";
import Orders from "../features/orders/pages/Orders";
import OrderDetails from "../features/orders/pages/OrderDetails";
import Logistics from "@/features/logistics/pages/Logistics";
import CreateShipment from "@/features/logistics/pages/CreateShipment";
import ShipmentDetails from "@/features/logistics/pages/ShipmentDetails";
import Inventory from "@/features/inventory/pages/Inventory";
import InventoryDetails from "@/features/inventory/pages/InventoryDetails";
import StockMovements from "@/features/inventory/pages/StockMovements";
import Warehouses from "@/features/warehouse/pages/Warehouses";
import WarehouseDetails from "@/features/warehouse/pages/WarehouseDetails";
import WarehouseLotAllocation from "@/features/warehouse/pages/WarehouseLotAllocation";
import Settlements from "@/features/settlements/pages/Settlements";
import SettlementDetails from "@/features/settlements/pages/SettlementDetails";
import Buyers from "@/features/buyers/pages/Buyers";
import BuyerDetails from "@/features/buyers/pages/BuyerDetails";
import FPOManagement from "@/features/fpo/pages/FPOManagement";
import FPOMemberDetails from "@/features/fpo/pages/FPOMemberDetails";
import Reports from "@/features/reports/pages/Reports";

import VerifyCertificate from "../features/quality/pages/VerifyCertificate";

function AppRoutes() {
  return (
    <Routes>
      {/* Public Login & Verification Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/verify-certificate" element={<VerifyCertificate />} />
      <Route path="/verify" element={<VerifyCertificate />} />

      {/* Default redirect to /dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />


      {/* Protected Dashboard Layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/farmers" element={<Farmers />} />
          <Route path="/farmers/:id" element={<FarmerDetails />} />
          <Route path="/farmers/:id/edit" element={<EditFarmer />} />

          <Route path="/farm-verification" element={<FarmVerificationList />} />
          <Route path="/farm-verification/:id" element={<FarmVerification />} />

          <Route path="/procurement/lots" element={<ProcurementLots />} />
          <Route path="/procurement-lots" element={<ProcurementLots />} />
          <Route path="/procurement-lots/:id" element={<ProcurementLotDetails />} />
          <Route path="/procurement-lots/:id/inspection" element={<QualityInspection />} />
          <Route path="/procurement-lots/:id/certification" element={<Certification />} />
          <Route path="/procurement-lots/:id/payment" element={<PaymentProcessing />} />
          <Route path="/agreements" element={<Agreements />} />
          <Route path="/agreements/new" element={<CreateAgreement />} />
          <Route path="/agreements/new/:lotId" element={<CreateAgreement />} />
          <Route path="/procurement-lots/:id/agreement" element={<CreateAgreement />} />

          <Route path="/quality" element={<QualityManagement />} />
          <Route path="/quality/assigned" element={<QualityManagement defaultTab="assigned" />} />
          <Route path="/quality/history" element={<QualityManagement defaultTab="history" />} />
          <Route path="/quality/certifications" element={<QualityManagement defaultTab="certifications" />} />

          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/new" element={<CreateMarketplaceListing />} />
          <Route path="/marketplace/:id" element={<MarketplaceListingDetails />} />

          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />

          <Route path="/logistics" element={<Logistics />} />
          <Route path="/logistics/create" element={<CreateShipment />} />
          <Route path="/logistics/:id" element={<ShipmentDetails />} />
          <Route path="/dispatches" element={<Logistics />} />
          <Route path="/dispatches/create" element={<CreateShipment />} />
          <Route path="/dispatches/:id" element={<ShipmentDetails />} />

          <Route path="/inventory" element={<Inventory />} />
          <Route path="/inventory/movements" element={<StockMovements />} />
          <Route path="/inventory/:id" element={<InventoryDetails />} />

          <Route path="/warehouses" element={<Warehouses />} />
          <Route path="/warehouses/lots" element={<WarehouseLotAllocation />} />
          <Route path="/warehouses/:id" element={<WarehouseDetails />} />

          <Route path="/settlements" element={<Settlements />} />
          <Route path="/settlements/:id" element={<SettlementDetails />} />
          <Route path="/finance" element={<Settlements />} />

          <Route path="/buyers" element={<Buyers />} />
          <Route path="/buyers/:id" element={<BuyerDetails />} />

          <Route path="/fpo" element={<FPOManagement />} />
          <Route path="/fpo/members/:id" element={<FPOMemberDetails />} />

          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Dashboard />} />
          <Route path="/support" element={<Dashboard />} />
        </Route>
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default AppRoutes;