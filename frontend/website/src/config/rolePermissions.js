import {
  LayoutDashboard,
  Users,
  Package,
  ClipboardCheck,
  FileText,
  Truck,
  Warehouse,
  Factory,
  ShoppingCart,
  Wallet,
  BarChart3,
  Settings,
  HelpCircle,
  FileCheck,
  CircleDollarSign,
  Building2,
  UsersRound,
} from "lucide-react";

export const ROLE_CONFIGS = {
  FpoManager: {
    roleName: "FPO Manager",
    portalTitle: "FPO Portal",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    sections: [
      {
        title: null,
        items: [
          { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        ],
      },
      {
        title: "OPERATIONS",
        items: [
          { to: "/farmers", icon: Users, label: "Farmers" },
          { to: "/farm-verification", icon: FileCheck, label: "Farm Verification", badgeCount: 2 },
          { to: "/procurement-lots", icon: Package, label: "Procurement Lots" },
          { to: "/agreements", icon: FileText, label: "Agreements" },
        ],
      },
      {
        title: "QUALITY MANAGEMENT",
        items: [
          { to: "/quality?tab=assigned", icon: ClipboardCheck, label: "Assigned Inspections" },
          { to: "/quality?tab=history", icon: FileText, label: "Inspection History" },
          { to: "/quality?tab=certifications", icon: FileCheck, label: "Certifications" },
        ],
      },
      {
        title: "LOGISTICS & INVENTORY",
        items: [
          { to: "/dispatches", icon: Truck, label: "Dispatch & Logistics" },
          {
            type: "dropdown",
            label: "Warehouse & Inventory",
            icon: Warehouse,
            items: [
              { to: "/inventory", icon: Warehouse, label: "Inventory", end: true },
              { to: "/inventory/movements", icon: Factory, label: "Stock Movements" },
              { to: "/warehouses", icon: Warehouse, label: "Warehouses", end: true },
              { to: "/warehouses/lots", icon: Package, label: "Lot Allocation" },
            ],
          },
        ],
      },
      {
        title: "BUSINESS",
        items: [
          { to: "/marketplace", icon: ShoppingCart, label: "Marketplace" },
          { to: "/orders", icon: ClipboardCheck, label: "Orders" },
          { to: "/settlements", icon: CircleDollarSign, label: "Settlements & Payments" },
          { to: "/finance", icon: Wallet, label: "Finance" },
          { to: "/reports", icon: BarChart3, label: "Reports & Analytics" },
        ],
      },
      {
        title: "MANAGEMENT",
        items: [
          { to: "/buyers", icon: Building2, label: "Buyers" },
          { to: "/fpo", icon: UsersRound, label: "FPO Members" },
        ],
      },
    ],
  },

  ProcurementOfficer: {
    roleName: "Procurement Officer",
    portalTitle: "Procurement Portal",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
    sections: [
      {
        title: null,
        items: [
          { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        ],
      },
      {
        title: "OPERATIONS",
        items: [
          { to: "/farmers", icon: Users, label: "Farmers" },
          { to: "/farm-verification", icon: FileCheck, label: "Verified Farms" },
          { to: "/procurement-lots", icon: Package, label: "Procurement Lots" },
          { to: "/agreements", icon: FileText, label: "Agreements" },
        ],
      },
      {
        title: "QUALITY",
        items: [
          { to: "/quality?tab=history", icon: ClipboardCheck, label: "Quality Results" },
        ],
      },
      {
        title: "BUSINESS",
        items: [
          { to: "/settlements", icon: CircleDollarSign, label: "Farmer Payments" },
          { to: "/reports", icon: BarChart3, label: "Reports" },
        ],
      },
    ],
  },

  QualityInspector: {
    roleName: "Quality Inspector",
    portalTitle: "Quality Portal",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
    sections: [
      {
        title: null,
        items: [
          { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        ],
      },
      {
        title: "OPERATIONS",
        items: [
          { to: "/farmers", icon: Users, label: "Farmers" },
          { to: "/farm-verification", icon: FileCheck, label: "Farm Verification" },
          { to: "/procurement-lots", icon: Package, label: "Procurement Lots" },
        ],
      },
      {
        title: "QUALITY",
        items: [
          { to: "/quality?tab=assigned", icon: ClipboardCheck, label: "Assigned Inspections" },
          { to: "/quality?tab=history", icon: FileText, label: "Inspection History" },
          { to: "/quality?tab=certifications", icon: FileCheck, label: "Certifications" },
        ],
      },
      {
        title: "REFERENCE",
        items: [
          { to: "/warehouses", icon: Warehouse, label: "Warehouses" },
          { to: "/reports", icon: BarChart3, label: "Reports" },
        ],
      },
    ],
  },

  WarehouseManager: {
    roleName: "Warehouse Manager",
    portalTitle: "Warehouse Portal",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
    sections: [
      {
        title: null,
        items: [
          { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        ],
      },
      {
        title: "WAREHOUSE OPERATIONS",
        items: [
          { to: "/inventory", icon: Warehouse, label: "Inventory" },
          { to: "/inventory/movements", icon: Factory, label: "Stock Movements" },
          { to: "/warehouses", icon: Building2, label: "Warehouses" },
          { to: "/warehouses/lots", icon: Package, label: "Lot Allocation" },
        ],
      },
      {
        title: "PROCUREMENT",
        items: [
          { to: "/procurement-lots", icon: Package, label: "Procurement Lots" },
          { to: "/quality?tab=history", icon: ClipboardCheck, label: "Quality Results" },
        ],
      },
      {
        title: "ORDERS",
        items: [
          { to: "/orders", icon: ShoppingCart, label: "Approved Orders" },
        ],
      },
      {
        title: "LOGISTICS",
        items: [
          { to: "/dispatches", icon: Truck, label: "Dispatch Requests" },
        ],
      },
      {
        title: "REPORTS",
        items: [
          { to: "/reports", icon: BarChart3, label: "Inventory Reports" },
        ],
      },
    ],
  },

  LogisticsCoordinator: {
    roleName: "Logistics Coordinator",
    portalTitle: "Logistics Portal",
    badgeColor: "bg-cyan-100 text-cyan-800 border-cyan-300",
    sections: [
      {
        title: null,
        items: [
          { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        ],
      },
      {
        title: "LOGISTICS",
        items: [
          { to: "/dispatches", icon: Truck, label: "Dispatches" },
          { to: "/dispatches", icon: ClipboardCheck, label: "Pending Dispatch" },
          { to: "/dispatches", icon: Truck, label: "In Transit" },
          { to: "/dispatches", icon: FileCheck, label: "Delivered" },
          { to: "/dispatches", icon: Truck, label: "Vehicles & Drivers" },
        ],
      },
      {
        title: "INVENTORY",
        items: [
          { to: "/warehouses", icon: Warehouse, label: "Warehouses" },
          { to: "/inventory", icon: Package, label: "Available Stock" },
        ],
      },
      {
        title: "ORDERS",
        items: [
          { to: "/orders", icon: ShoppingCart, label: "Approved Orders" },
        ],
      },
      {
        title: "REPORTS",
        items: [
          { to: "/reports", icon: BarChart3, label: "Logistics Reports" },
        ],
      },
    ],
  },

  Accountant: {
    roleName: "Accountant",
    portalTitle: "Finance Portal",
    badgeColor: "bg-green-100 text-green-800 border-green-300",
    sections: [
      {
        title: null,
        items: [
          { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        ],
      },
      {
        title: "FINANCE",
        items: [
          { to: "/settlements", icon: Wallet, label: "Farmer Payments" },
          { to: "/settlements", icon: CircleDollarSign, label: "Settlements" },
          { to: "/settlements", icon: FileText, label: "Transactions" },
          { to: "/settlements", icon: CircleDollarSign, label: "Payment History" },
        ],
      },
      {
        title: "BUSINESS",
        items: [
          { to: "/procurement-lots", icon: Package, label: "Procurement Lots" },
          { to: "/orders", icon: ShoppingCart, label: "Orders" },
          { to: "/buyers", icon: Building2, label: "Buyers" },
        ],
      },
      {
        title: "REPORTS",
        items: [
          { to: "/reports", icon: BarChart3, label: "Financial Reports" },
          { to: "/reports", icon: BarChart3, label: "Revenue Reports" },
          { to: "/reports", icon: BarChart3, label: "FPO Margin" },
        ],
      },
      {
        title: "REFERENCE",
        items: [
          { to: "/farmers", icon: Users, label: "Farmers" },
        ],
      },
    ],
  },
};

export const COMMON_SYSTEM_SECTION = {
  title: "SYSTEM",
  items: [
    { to: "/settings", icon: Settings, label: "Settings" },
    { to: "/support", icon: HelpCircle, label: "Support" },
  ],
};
