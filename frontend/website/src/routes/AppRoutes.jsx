import { Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "../components/layout/DashboardLayout";

import Dashboard from "../features/dashboard/pages/Dashboard";
import Farmers from "@/features/farmers/pages/Farmers";
import ProcurementLots from "../features/procurement/pages/ProcurementLots";

function AppRoutes() {
    return (
        <Routes>

            {/* Default route */}
            <Route
                path="/"
                element={<Navigate to="/dashboard" replace />}
            />

            {/* Dashboard layout */}
            <Route element={<DashboardLayout />}>

                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />

                <Route
                    path="/farmers"
                    element={<Farmers />}
                />
                <Route
                    path="/procurement/lots"
                    element={<ProcurementLots />}
                />
            </Route>

        </Routes>
    );
}

export default AppRoutes;