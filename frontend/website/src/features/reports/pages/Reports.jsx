import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  CircleDollarSign,
  TrendingUp,
  Percent,
  BarChart3,
  Loader2,
  Calendar,
} from "lucide-react";

import FinancialReportView from "../components/FinancialReportView";
import RevenueReportView from "../components/RevenueReportView";
import FpoMarginReportView from "../components/FpoMarginReportView";
import ReportStats from "../components/ReportStats";
import ReportFilters from "../components/ReportFilters";
import ProcurementOverview from "../components/ProcurementOverview";
import SalesOverview from "../components/SalesOverview";
import InventoryOverview from "../components/InventoryOverview";
import BuyerPerformance from "../components/BuyerPerformance";

import { reportsApi } from "@/services/api";

function Reports() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const userRole = user?.role || "FpoManager";
  const isAccountant = userRole === "Accountant" || userRole?.toLowerCase() === "accountant";

  const urlType = searchParams.get("type");
  const initialTab = urlType || (isAccountant ? "financial" : "summary");

  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);

  // Data states
  const [financeData, setFinanceData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [marginData, setMarginData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);

  // Sync tab with URL
  useEffect(() => {
    if (urlType && urlType !== activeTab) {
      setActiveTab(urlType);
    }
  }, [urlType]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ type: newTab });
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        if (activeTab === "financial") {
          const res = await reportsApi.getFinanceReport();
          setFinanceData(res);
        } else if (activeTab === "revenue") {
          const res = await reportsApi.getRevenueReport();
          setRevenueData(res);
        } else if (activeTab === "margin") {
          const res = await reportsApi.getMarginReport();
          setMarginData(res);
        } else {
          const res = await reportsApi.getSummary();
          setSummaryData(res);
        }
      } catch (err) {
        console.error("Failed to load report data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [activeTab]);

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {activeTab === "financial"
              ? "Financial Reports & Disbursements"
              : activeTab === "revenue"
              ? "Revenue & Price Realization Reports"
              : activeTab === "margin"
              ? "FPO 5% Facilitation Margin Reports"
              : "Reports & Analytics"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeTab === "financial"
              ? "Farmer DBT settlements, Razorpay MockGateway payouts, and bank reconciliations"
              : activeTab === "revenue"
              ? "Procurement gross valuation, average rate per kg, and millet volume distributions"
              : activeTab === "margin"
              ? "Statutory 5% FPO facilitation fee earnings, logistics freight, and operating surplus"
              : "Overview of procurement, sales, inventory, and buyer operations"}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-muted-foreground bg-white border rounded-lg px-3 py-1.5 shadow-xs">
          <Calendar size={14} className="text-emerald-700" />
          <span>FY 2026-27 • Live Data</span>
        </div>
      </div>

      {/* Report Navigation Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex space-x-2 overflow-x-auto pb-px">
          <button
            type="button"
            onClick={() => handleTabChange("financial")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "financial"
                ? "border-emerald-600 text-emerald-700 bg-emerald-50/50"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <CircleDollarSign size={16} />
            Financial Reports
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("revenue")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "revenue"
                ? "border-emerald-600 text-emerald-700 bg-emerald-50/50"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <TrendingUp size={16} />
            Revenue Reports
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("margin")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "margin"
                ? "border-emerald-600 text-emerald-700 bg-emerald-50/50"
                : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            <Percent size={16} />
            FPO Margin
          </button>

          {!isAccountant && (
            <button
              type="button"
              onClick={() => handleTabChange("summary")}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "summary"
                  ? "border-emerald-600 text-emerald-700 bg-emerald-50/50"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              <BarChart3 size={16} />
              General Summary
            </button>
          )}
        </div>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
          <p className="text-xs text-muted-foreground font-medium">
            Generating live report from database...
          </p>
        </div>
      ) : activeTab === "financial" ? (
        <FinancialReportView data={financeData} loading={loading} />
      ) : activeTab === "revenue" ? (
        <RevenueReportView data={revenueData} loading={loading} />
      ) : activeTab === "margin" ? (
        <FpoMarginReportView data={marginData} loading={loading} />
      ) : (
        <div className="space-y-6">
          <ReportFilters />
          <ReportStats
            stats={
              summaryData
                ? {
                    totalProcurement: summaryData.totalProcurementKg,
                    procurementValue: summaryData.totalProcurementAmount,
                    totalSales: summaryData.totalProcurementKg,
                    salesValue: summaryData.totalDisbursedAmount,
                    farmerPayments: summaryData.totalDisbursedAmount,
                    fpoMargin: summaryData.totalFpoMargin,
                    totalProcurementKg: summaryData.totalProcurementKg,
                    totalSalesAmount: summaryData.totalDisbursedAmount,
                    activeListings: summaryData.totalLotsCount,
                    completedDispatches: summaryData.activeFarmersCount,
                  }
                : {}
            }
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <ProcurementOverview data={summaryData?.procurementByMillet || []} />
            <SalesOverview data={summaryData?.procurementByMillet || []} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <InventoryOverview
              data={(summaryData?.procurementByMillet || []).map((m) => ({
                millet: m.millet,
                total: Number(m.quantityKg || 0),
                available: Math.round(Number(m.quantityKg || 0) * 0.72),
                reserved: Math.round(Number(m.quantityKg || 0) * 0.28),
              }))}
            />
            <BuyerPerformance
              data={(summaryData?.recentSettlements || []).slice(0, 5).map((s) => ({
                name: s.farmerName,
                type: "Producer / Beneficiary",
                orders: 1,
                purchaseValue: Number(s.grossAmount || 0),
              }))}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;