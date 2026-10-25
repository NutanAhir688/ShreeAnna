import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";
import {
  Sprout,
  Search,
  Heart,
  ShoppingCart,
  User,
  ShieldCheck,
  Check,
  Trash2,
  Plus,
  Minus,
  Truck,
  Phone,
  ArrowRight,
  X,
  CreditCard,
  QrCode,
  Sparkles,
  Layers,
  Wheat,
  Banknote,
  Store,
  ChevronDown,
  KeyRound,
  RotateCcw,
  CheckCircle2,
  PackageCheck,
  MapPin,
  Clock,
  Navigation,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { marketplaceApi, ordersApi, auth, getInMemoryToken } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import ProductDetails from "../components/ProductDetails";
import OrderLiveTrackingMap from "../components/OrderLiveTrackingMap";
import OrderRazorpayPaymentDialog from "../components/OrderRazorpayPaymentDialog";

export default function CustomerMarketplace() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: routeProductId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user: authUser } = useAuth();

  // -------------------------------------------------------------
  // 1. STATE & DATA
  // -------------------------------------------------------------
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [selectedMilletType, setSelectedMilletType] = useState("all");
  const [selectedProducerType, setSelectedProducerType] = useState("all");
  const [activeFilterTab, setActiveFilterTab] = useState("categories");
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [wishlistCount, setWishlistCount] = useState(1);
  const [currentView, setCurrentView] = useState("marketplace"); // "marketplace" | "product-details" | "my-orders"

  // User state (integrates with global AuthContext, fallback to local storage)
  const [localUser, setLocalUser] = useState(() => {
    const saved = localStorage.getItem("shreeanna_customer_user");
    return saved ? JSON.parse(saved) : null;
  });

  const currentUser = useMemo(() => {
    if (authUser) {
      return {
        name: authUser.memberName || authUser.email?.split("@")[0] || "Customer",
        email: authUser.email,
        role: authUser.role,
      };
    }
    return localUser;
  }, [authUser, localUser]);

  // Cart state
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("shreeanna_customer_cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [cartOpen, setCartOpen] = useState(false);

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Checkout modal state
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [shippingDetails, setShippingDetails] = useState({
    name: "Mukund Sharma",
    phone: "+91 98765 43210",
    address: "B-402, Green Fields Residency, Satellite",
    city: "Ahmedabad",
    state: "Gujarat",
    pincode: "380015",
    paymentMethod: "UPI",
  });
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Order Confirmation & Tracking state
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [paymentModalOrder, setPaymentModalOrder] = useState(null);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState(null);
  const [otpVerificationInput, setOtpVerificationInput] = useState("");
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");

  // Location permission & Coordinates
  const [deliveryCoordinates, setDeliveryCoordinates] = useState({
    lat: 22.8398,
    lng: 74.2536,
    accuracy: null,
    granted: false,
    loading: false,
    error: null,
  });

  const requestDeliveryLocation = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setDeliveryCoordinates((prev) => ({
        ...prev,
        error: "Geolocation not supported by browser. Using verified hub GPS.",
      }));
      return;
    }

    setDeliveryCoordinates((prev) => ({ ...prev, loading: true, error: null }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        const accuracy = Math.round(pos.coords.accuracy);
        setDeliveryCoordinates({
          lat,
          lng,
          accuracy,
          granted: true,
          loading: false,
          error: null,
        });
      },
      (err) => {
        console.warn("Geolocation permission note:", err.message);
        setDeliveryCoordinates((prev) => ({
          ...prev,
          granted: false,
          loading: false,
          error: "Location permission denied. Using verified default coordinates (Dahod Hub).",
        }));
      },
      { enableHighAccuracy: true, timeout: 7000 }
    );
  }, []);

  // Customer Orders List state
  const [customerOrders, setCustomerOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Sync cart to local storage
  useEffect(() => {
    localStorage.setItem("shreeanna_customer_cart", JSON.stringify(cart));
  }, [cart]);

  // Sync user to local storage
  useEffect(() => {
    if (localUser) {
      localStorage.setItem("shreeanna_customer_user", JSON.stringify(localUser));
    } else {
      localStorage.removeItem("shreeanna_customer_user");
    }
  }, [localUser]);

  // -------------------------------------------------------------
  // 2. LOAD PRODUCTS & DATA
  // -------------------------------------------------------------
  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await marketplaceApi.getAll();
      if (Array.isArray(data) && data.length > 0) {
        setProducts(data);
      } else {
        // Fallback default processor products matching Image 5
        setProducts([
          {
            id: "aa11bb22-3344-5566-7788-9900aabbccdd",
            title: "Pearl Millet Flour",
            category: "Flours",
            brand: "Millet Shakti SHG",
            farmerName: "Millet Shakti SHG (Processor)",
            pricePerKg: 180,
            imageUrl: "/images/products/pearl_millet_flour.jpg",
            milletType: "Pearl Millet",
            quantityKg: 1500,
            description: "Finely milled pearl millet (bajra) flour, stone-ground to preserve nutrients. Ideal for rotis, baking, and healthy meals.",
          },
          {
            id: "bb22cc33-4455-6677-8899-0011bbccddee",
            title: "Ragi Cookies",
            category: "Cookies",
            brand: "Green Harvest SHG",
            farmerName: "Green Harvest SHG (Processor)",
            pricePerKg: 120,
            imageUrl: "/images/products/ragi_cookies.jpg",
            milletType: "Finger Millet (Ragi)",
            quantityKg: 800,
            description: "Handcrafted artisan chocolate finger millet (ragi) cookies studded with roasted almonds. High in calcium and 100% gluten-free.",
          },
          {
            id: "cc33dd44-5566-7788-9900-1122ccddeeff",
            title: "Organic Foxtail Millet Upma Mix",
            category: "Ready-to-Eat",
            brand: "Dahod Women SHG",
            farmerName: "Dahod Women SHG (Processor)",
            pricePerKg: 95,
            imageUrl: "/images/products/foxtail_upma_mix.jpg",
            milletType: "Foxtail Millet",
            quantityKg: 500,
            description: "Instant wholesome breakfast upma mix made from unpolished foxtail millet, curry leaves, and mustard seeds.",
          },
          {
            id: "dd44ee55-6677-8899-0011-2233ddeeff00",
            title: "Multi-Millet Energy Bars",
            category: "Snacks",
            brand: "Gramin Vikas FPO",
            farmerName: "Gramin Vikas FPO (Processor)",
            pricePerKg: 160,
            imageUrl: "/images/products/millet_energy_bars.jpg",
            milletType: "Multi-Millet",
            quantityKg: 600,
            description: "Nutrient-packed multi-millet snack bars with jaggery, chia seeds, and roasted almonds. 100% natural energy without refined sugars.",
          },
        ]);
      }
    } catch (err) {
      console.warn("Failed to fetch products from backend, using default items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Sync route param or query param to select a product directly
  useEffect(() => {
    const targetId = routeProductId || searchParams.get("product");
    if (targetId && products.length > 0) {
      const found = products.find(
        (p) =>
          String(p.id).toLowerCase() === String(targetId).toLowerCase() ||
          p.title?.toLowerCase().replace(/\s+/g, "-") === String(targetId).toLowerCase()
      );
      if (found) {
        setSelectedProduct(found);
        setCurrentView("product-details");
      }
    }
  }, [routeProductId, searchParams, products]);

  // Sync buy intent after login to immediately open checkout
  useEffect(() => {
    if (currentUser && searchParams.get("intent") === "buy") {
      setCheckoutModalOpen(true);
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("intent");
      setSearchParams(nextParams, { replace: true });
    }
  }, [currentUser, searchParams, setSearchParams]);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setCurrentView("product-details");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const customerEmail = currentUser?.email || "mukund@example.com";

  const loadCustomerOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const data = await ordersApi.getAll(customerEmail);
      if (Array.isArray(data)) {
        setCustomerOrders(data);
      }
    } catch (err) {
      console.warn("Error fetching customer orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  }, [customerEmail]);

  useEffect(() => {
    if (currentView === "my-orders") {
      loadCustomerOrders();
    }
  }, [currentView, loadCustomerOrders]);

  // -------------------------------------------------------------
  // 3. FILTERING & SORTING
  // -------------------------------------------------------------
  const categoriesList = ["All Products", "Flours", "Snacks", "Cookies", "Ready-to-Eat", "Traditional Foods"];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter
      const matchesCategory =
        selectedCategory === "All Products" ||
        (product.category && product.category.toLowerCase().includes(selectedCategory.toLowerCase())) ||
        (selectedCategory === "Flours" && (product.category?.includes("Flour") || product.title?.includes("Flour"))) ||
        (selectedCategory === "Cookies" && (product.category?.includes("Cookie") || product.title?.includes("Cookie"))) ||
        (selectedCategory === "Snacks" && (product.category?.includes("Snack") || product.title?.includes("Bar"))) ||
        (selectedCategory === "Ready-to-Eat" && (product.category?.includes("Ready") || product.title?.includes("Mix")));

      // Millet Type filter
      const matchesMillet =
        selectedMilletType === "all" ||
        (product.milletType && product.milletType.toLowerCase().includes(selectedMilletType.toLowerCase())) ||
        (product.title && product.title.toLowerCase().includes(selectedMilletType.toLowerCase()));

      // Search Query
      const matchesSearch =
        searchQuery.trim() === "" ||
        product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesMillet && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === "price-low") return Number(a.pricePerKg) - Number(b.pricePerKg);
      if (sortBy === "price-high") return Number(b.pricePerKg) - Number(a.pricePerKg);
      return 0; // featured
    });
  }, [products, selectedCategory, selectedMilletType, searchQuery, sortBy]);

  // -------------------------------------------------------------
  // 4. CART & BUY ACTIONS
  // -------------------------------------------------------------
  const handleAddToCart = (product) => {
    const packSize = product.selectedPackSize || "1 kg";
    const qtyToAdd = product.quantity || 1;
    const itemPrice = Number(product.pricePerKg) || 180;
    const cartItemId = `${product.id}_${packSize}`;

    setCart((prev) => {
      const existing = prev.find(
        (item) => item.cartItemId === cartItemId || item.id === cartItemId || item.id === product.id
      );
      if (existing) {
        return prev.map((item) =>
          item.cartItemId === cartItemId || item.id === cartItemId || item.id === product.id
            ? { ...item, quantity: item.quantity + qtyToAdd }
            : item
        );
      }
      return [
        ...prev,
        {
          id: cartItemId,
          cartItemId,
          productId: product.id,
          title: product.title,
          category: product.category || "Millet Food",
          brand: product.brand || product.farmerName || "SHG Verified",
          price: itemPrice,
          unit: packSize,
          imageUrl: product.imageUrl || "/images/products/pearl_millet_flour.jpg",
          quantity: qtyToAdd,
        },
      ];
    });
    setCartOpen(true);
  };

  const handleBuyNow = (product) => {
    handleAddToCart(product);
    requestDeliveryLocation();
    if (!currentUser) {
      const returnUrl = location.pathname + location.search;
      navigate(`/login?redirect=${encodeURIComponent(returnUrl)}&intent=buy`);
      return;
    }
    setCheckoutModalOpen(true);
  };

  const updateQuantity = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id || item.cartItemId === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id && item.cartItemId !== id));
  };

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = cartSubtotal > 500 ? 0 : 40;
  const cartGrandTotal = cartSubtotal + deliveryFee;

  // -------------------------------------------------------------
  // 5. AUTH HANDLER
  // -------------------------------------------------------------
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    try {
      if (authMode === "login") {
        const data = await auth.login(authEmail.trim(), authPassword);
        setLocalUser({
          email: authEmail.trim(),
          name: data?.memberName || authEmail.split("@")[0],
          role: data?.role || "Customer",
        });
        setAuthModalOpen(false);
      } else {
        const data = await auth.register(authEmail.trim(), authPassword, authName.trim() || "Customer");
        setLocalUser({
          email: authEmail.trim(),
          name: authName.trim() || authEmail.split("@")[0],
          role: "Customer",
        });
        setAuthModalOpen(false);
      }
    } catch (err) {
      setAuthError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleQuickDemoLogin = () => {
    setLocalUser({
      email: "customer@shreeanna.com",
      name: "Mukund Sharma",
      role: "Customer",
    });
    setAuthModalOpen(false);
  };

  const handleLogout = () => {
    auth.logout();
    setLocalUser(null);
  };

  // -------------------------------------------------------------
  // 6. ORDER CREATION & CHECKOUT
  // -------------------------------------------------------------
  const handleProceedToCheckout = () => {
    requestDeliveryLocation();
    if (!currentUser) {
      setCartOpen(false);
      const returnUrl = location.pathname + location.search;
      navigate(`/login?redirect=${encodeURIComponent(returnUrl)}&intent=buy`);
      return;
    }
    setCartOpen(false);
    setCheckoutModalOpen(true);
  };

  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setSubmittingOrder(true);
    try {
      // Fix 400 error: Extract pure GUID for productId
      const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const orderPayload = {
        customerName: shippingDetails.name,
        customerEmail: currentUser?.email || "customer@shreeanna.com",
        customerPhone: shippingDetails.phone,
        shippingAddress: shippingDetails.address,
        city: shippingDetails.city,
        state: shippingDetails.state,
        pincode: shippingDetails.pincode,
        paymentMethod: shippingDetails.paymentMethod,
        customerLatitude: deliveryCoordinates.lat,
        customerLongitude: deliveryCoordinates.lng,
        items: cart.map((item) => {
          let validProductId = null;
          const rawId = item.productId || item.id || "";
          const guidCandidate = typeof rawId === "string" ? rawId.split("_")[0] : null;
          if (guidCandidate && guidRegex.test(guidCandidate)) {
            validProductId = guidCandidate;
          }
          return {
            productId: validProductId,
            productTitle: item.title,
            category: item.category,
            producerName: item.brand,
            imageUrl: item.imageUrl,
            price: item.price,
            quantity: item.quantity,
          };
        }),
      };

      const created = await ordersApi.create(orderPayload);
      setCart([]);
      setCheckoutModalOpen(false);
      loadCustomerOrders();

      if (shippingDetails.paymentMethod === "COD") {
        setConfirmedOrder(created);
      } else {
        setPaymentModalOrder(created);
      }
    } catch (err) {
      alert("Order placement failed: " + (err.message || "Unknown error"));
    } finally {
      setSubmittingOrder(false);
    }
  };

  const handleOrderPaymentSuccess = (paidOrder) => {
    setPaymentModalOrder(null);
    setConfirmedOrder(paidOrder);
    loadCustomerOrders();
  };

  // -------------------------------------------------------------
  // 7. OTP CONFIRMATION & LIVE LOGISTICS
  // -------------------------------------------------------------
  const handleVerifyDeliveryOtp = async (orderId, otpToVerify) => {
    if (!otpToVerify || otpToVerify.trim().length !== 4) {
      setOtpMessage("Please enter the complete 4-digit OTP provided by customer.");
      return;
    }

    setOtpVerifying(true);
    setOtpMessage("");
    try {
      const updated = await ordersApi.confirmDelivery(orderId, otpToVerify.trim());
      setConfirmedOrder(updated);
      if (activeTrackingOrder && activeTrackingOrder.id === orderId) {
        setActiveTrackingOrder(updated);
      }
      setOtpMessage("Delivery verified successfully! Driver released back to available.");
      // Refresh customer orders list
      loadCustomerOrders();
    } catch (err) {
      setOtpMessage(err.message || "Invalid OTP code. Please check and retry.");
    } finally {
      setOtpVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#142017] font-sans">
      {/* ─────────────────────────────────────────────────────────────
          1. TOP NAVIGATION BAR (Exact Match to Image 5)
      ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E7ECE4] shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#1B4324] flex items-center justify-center text-white shadow-2xs">
                <Sprout className="w-5 h-5 text-[#86D49B]" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-[#142017]">
                Shree<span className="text-[#266838]">Anna</span>
              </span>
            </a>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#4D5A50]">
              <a href="/" className="hover:text-[#1B4324] transition-colors py-1">
                Home
              </a>
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setCurrentView("marketplace");
                }}
                className={`cursor-pointer py-1 font-semibold relative ${
                  currentView === "marketplace" || currentView === "product-details"
                    ? "text-[#1B4324] after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2px] after:bg-[#1B4324] after:rounded-full"
                    : "hover:text-[#1B4324]"
                }`}
              >
                Products
              </button>
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setCurrentView("marketplace");
                  setSelectedCategory("All Products");
                }}
                className="hover:text-[#1B4324] transition-colors py-1 cursor-pointer"
              >
                Categories
              </button>
              <button
                onClick={() => {
                  if (!currentUser) {
                    navigate(`/login?redirect=${encodeURIComponent("/my-orders")}`);
                  } else {
                    setCurrentView("my-orders");
                  }
                }}
                className={`cursor-pointer py-1 font-semibold relative flex items-center gap-1.5 ${
                  currentView === "my-orders"
                    ? "text-[#1B4324] after:absolute after:bottom-[-2px] after:left-0 after:right-0 after:h-[2px] after:bg-[#1B4324] after:rounded-full"
                    : "hover:text-[#1B4324]"
                }`}
              >
                <span>My Orders</span>
                {customerOrders.some((o) => o.status === "ASSIGNED_TO_DRIVER") && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </button>
            </nav>
          </div>

          {/* Right Action Icons: Search, Wishlist, Cart, User (matching Image 5) */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search Bar */}
            <div className="relative hidden sm:block w-56 md:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#F4F7F2] border border-[#E0E8DC] focus:outline-none focus:ring-2 focus:ring-[#1B4324]/30 focus:bg-white transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Wishlist Icon */}
            <button
              onClick={() => setWishlistCount((c) => c + 1)}
              className="p-2 text-slate-700 hover:text-[#1B4324] hover:bg-slate-50 rounded-full transition-colors relative cursor-pointer"
              title="Saved items"
            >
              <Heart className="w-5 h-5 text-slate-700" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-600" />
              )}
            </button>

            {/* Cart Icon with Item Badge (Showing '2' or current items count) */}
            <button
              onClick={() => setCartOpen(true)}
              className="p-2 text-slate-700 hover:text-[#1B4324] hover:bg-slate-50 rounded-full transition-colors relative cursor-pointer"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5 text-slate-700" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#1B4324] text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* User Avatar / Login */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
                <button
                  onClick={() => setCurrentView(currentView === "my-orders" ? "marketplace" : "my-orders")}
                  className="flex items-center gap-2 cursor-pointer p-1 rounded-full hover:bg-slate-100 transition-colors"
                  title="Profile & Orders"
                >
                  <div className="w-8 h-8 rounded-full bg-[#1B4324] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                    {currentUser.name?.[0] || "C"}
                  </div>
                  <span className="hidden lg:block text-xs font-semibold text-slate-800">
                    {currentUser.name.split(" ")[0]}
                  </span>
                </button>
                <button
                  onClick={handleLogout}
                  className="hidden sm:block text-[11px] text-slate-500 hover:text-red-600 ml-1 cursor-pointer font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const returnUrl = location.pathname + location.search;
                  navigate(`/login?redirect=${encodeURIComponent(returnUrl)}`);
                }}
                className="h-9 px-4 rounded-full text-xs font-semibold border-[#C5D5C0] text-[#1B4324] hover:bg-[#EFF5EB] cursor-pointer flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-[#1B4324]" />
                <span>Sign In</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN BODY (Product Details OR Marketplace Catalog OR My Orders)
      ───────────────────────────────────────────────────────────── */}
      {currentView === "product-details" && selectedProduct ? (
        <ProductDetails
          product={selectedProduct}
          onBack={() => {
            setSelectedProduct(null);
            setCurrentView("marketplace");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
        />
      ) : currentView === "marketplace" ? (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ─────────────────────────────────────────────────────────────
                LEFT SIDEBAR: Filters (Exact layout as in Image 5)
            ───────────────────────────────────────────────────────────── */}
            <aside className="lg:col-span-3 bg-[#F4F8F3] rounded-2xl p-5 border border-[#E3ECE0] space-y-6">
              <div>
                <h3 className="text-base font-bold text-[#142017]">Filters</h3>
                <p className="text-xs text-[#5D6B60] mt-0.5">Refine your search</p>
              </div>

              {/* Sidebar Filter Buttons matching Image 5 */}
              <div className="space-y-2">
                {/* 1. Categories Pill (Active highlighted in green) */}
                <button
                  onClick={() => setActiveFilterTab("categories")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                    activeFilterTab === "categories"
                      ? "bg-[#C4E8C9] text-[#1B4324] shadow-2xs"
                      : "bg-white/80 hover:bg-white text-slate-700 border border-[#E0E8DC]"
                  }`}
                >
                  <Layers className="w-4 h-4 text-[#1B4324]" />
                  <span>Categories</span>
                </button>

                {/* 2. Millet Types */}
                <button
                  onClick={() => setActiveFilterTab("millet-types")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                    activeFilterTab === "millet-types"
                      ? "bg-[#C4E8C9] text-[#1B4324] shadow-2xs"
                      : "bg-white/80 hover:bg-white text-slate-700 border border-[#E0E8DC]"
                  }`}
                >
                  <Wheat className="w-4 h-4 text-slate-600" />
                  <span>Millet Types</span>
                </button>

                {/* 3. Price Range */}
                <button
                  onClick={() => setActiveFilterTab("price-range")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                    activeFilterTab === "price-range"
                      ? "bg-[#C4E8C9] text-[#1B4324] shadow-2xs"
                      : "bg-white/80 hover:bg-white text-slate-700 border border-[#E0E8DC]"
                  }`}
                >
                  <Banknote className="w-4 h-4 text-slate-600" />
                  <span>Price Range</span>
                </button>

                {/* 4. Producer Type */}
                <button
                  onClick={() => setActiveFilterTab("producer-type")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                    activeFilterTab === "producer-type"
                      ? "bg-[#C4E8C9] text-[#1B4324] shadow-2xs"
                      : "bg-white/80 hover:bg-white text-slate-700 border border-[#E0E8DC]"
                  }`}
                >
                  <Store className="w-4 h-4 text-slate-600" />
                  <span>Producer Type</span>
                </button>
              </div>

              {/* Sub-options for selected filter */}
              {activeFilterTab === "millet-types" && (
                <div className="bg-white p-3 rounded-xl border border-[#E0E8DC] space-y-1.5 text-xs">
                  {["all", "Pearl Millet", "Finger Millet (Ragi)", "Foxtail Millet", "Multi-Millet"].map((m) => (
                    <button
                      key={m}
                      onClick={() => setSelectedMilletType(m)}
                      className={`block w-full text-left px-2 py-1 rounded font-medium ${
                        selectedMilletType === m ? "bg-emerald-100 text-emerald-800 font-bold" : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {m === "all" ? "All Millets" : m}
                    </button>
                  ))}
                </div>
              )}

              {activeFilterTab === "price-range" && (
                <div className="bg-white p-3 rounded-xl border border-[#E0E8DC] space-y-2 text-xs">
                  <div className="flex justify-between font-medium text-slate-600">
                    <span>Under ₹100</span>
                    <button onClick={() => setSortBy("price-low")} className="text-emerald-700 font-bold">Apply</button>
                  </div>
                  <div className="flex justify-between font-medium text-slate-600">
                    <span>₹100 - ₹200</span>
                    <button onClick={() => setSortBy("featured")} className="text-emerald-700 font-bold">Apply</button>
                  </div>
                </div>
              )}

              {/* Reset All Button (matching Image 5) */}
              <div className="pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCategory("All Products");
                    setSelectedMilletType("all");
                    setSearchQuery("");
                    setSortBy("featured");
                    setActiveFilterTab("categories");
                  }}
                  className="w-full h-10 rounded-xl border-[#CCDBC6] bg-white text-[#1B4324] hover:bg-[#EBF3E8] font-semibold text-xs cursor-pointer shadow-2xs"
                >
                  Reset All
                </Button>
              </div>
            </aside>

            {/* ─────────────────────────────────────────────────────────────
                RIGHT MAIN: Marketplace Header, Pills, Products Grid
            ───────────────────────────────────────────────────────────── */}
            <section className="lg:col-span-9 space-y-6">
              {/* Header Title */}
              <div>
                <h1 className="text-3xl font-extrabold text-[#142017] tracking-tight">Marketplace</h1>
                <p className="text-sm text-[#5D6B60] mt-1">
                  Healthy millet products, directly from verified producers.
                </p>
              </div>

              {/* Category Filter Pills (matching Image 5: All Products, Flours, Snacks, Cookies, Ready-to-Eat, Traditional Foods) */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {categoriesList.map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#1B4324] text-white shadow-xs"
                          : "bg-white text-slate-700 border border-[#D5E0D0] hover:bg-[#F3F7F1] hover:text-[#1B4324]"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Counter and Sort Row */}
              <div className="flex items-center justify-between border-b border-[#E7ECE4] pb-4 text-xs">
                <p className="text-[#5D6B60] font-medium">
                  Showing <span className="font-bold text-[#142017]">{filteredProducts.length}</span> products
                </p>

                <div className="flex items-center gap-2">
                  <span className="text-[#5D6B60]">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white border border-[#D5E0D0] rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1B4324]"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {/* Product Cards Grid (Matching Image 5 layout exactly) */}
              {loading ? (
                <div className="py-20 text-center text-slate-500 space-y-2">
                  <div className="w-8 h-8 rounded-full border-2 border-[#1B4324] border-t-transparent animate-spin mx-auto" />
                  <p className="text-xs">Loading fresh verified products...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-[#E7ECE4] space-y-3">
                  <PackageCheck className="w-10 h-10 text-slate-400 mx-auto" />
                  <h3 className="text-base font-bold text-slate-800">No products found</h3>
                  <p className="text-xs text-slate-500">Try adjusting your filters or category selection.</p>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedCategory("All Products");
                      setSelectedMilletType("all");
                      setSearchQuery("");
                    }}
                    className="bg-[#1B4324] text-white text-xs rounded-full"
                  >
                    Reset Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => {
                    const priceLabel =
                      product.category === "Cookies"
                        ? `₹${product.pricePerKg} / 250g`
                        : product.category === "Snacks"
                        ? `₹${product.pricePerKg} / pack`
                        : `₹${product.pricePerKg} / kg`;

                    return (
                      <div
                        key={product.id}
                        onClick={() => handleProductClick(product)}
                        className="bg-white rounded-2xl border border-[#E3ECE0] overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                      >
                        {/* Real Image Container with Floating Badges (matching Image 5) */}
                        <div className="relative aspect-4/3 w-full bg-slate-50 overflow-hidden">
                          <img
                            src={product.imageUrl}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                            onError={(e) => {
                              e.target.src = "/images/products/pearl_millet_flour.jpg";
                            }}
                          />

                          {/* Floating Badges */}
                          <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-xs text-[10px] font-bold text-[#1B4324] border border-emerald-200 shadow-xs">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              Quality Certified
                            </span>

                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-xs text-[10px] font-bold text-slate-700 border border-slate-200 shadow-xs">
                              <QrCode className="w-3 h-3 text-emerald-600" />
                              Traceable
                            </span>

                            {product.brand?.includes("SHG") && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-[#1B4324] text-white">
                                SHG Made
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Product Card Body */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-1.5">
                            <p className="text-[11px] font-semibold text-slate-500">
                              {product.brand || product.farmerName || "Verified Producer"}
                            </p>
                            <h3 className="text-base font-bold text-[#142017] leading-snug line-clamp-1 group-hover:text-[#1B4324] transition-colors">
                              {product.title}
                            </h3>
                            <p className="text-lg font-extrabold text-[#142017]">
                              {priceLabel}
                            </p>
                          </div>

                          {/* Action Button: View Product Details */}
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProductClick(product);
                            }}
                            className="w-full bg-[#1B4324] hover:bg-[#14341C] text-white font-semibold text-xs h-10 rounded-xl shadow-2xs cursor-pointer flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01]"
                          >
                            <span>Buy Product</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </main>
      ) : (
        /* ─────────────────────────────────────────────────────────────
            3. MY ORDERS DASHBOARD (Live Tracking & OTP Verification)
        ───────────────────────────────────────────────────────────── */
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#142017]">My Customer Orders</h1>
              <p className="text-xs text-slate-500 mt-1">
                Track your active delivery, driver assignment, and verify customer delivery OTP.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentView("marketplace")}
              className="text-xs rounded-full border-[#C5D5C0] text-[#1B4324]"
            >
              Back to Marketplace
            </Button>
          </div>

          {ordersLoading ? (
            <div className="py-16 text-center text-slate-500 text-xs">Loading orders...</div>
          ) : customerOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#E7ECE4] space-y-3">
              <PackageCheck className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No orders placed yet</h3>
              <p className="text-xs text-slate-500">Browse verified processor items and place your first order!</p>
              <Button
                onClick={() => setCurrentView("marketplace")}
                className="bg-[#1B4324] text-white text-xs rounded-full"
              >
                Start Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {customerOrders.map((order) => {
                const isDelivered = order.status === "DELIVERED";
                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-[#E3ECE0] p-6 shadow-sm space-y-5"
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div>
                        <span className="text-xs font-mono font-bold text-slate-600 block">
                          {order.orderNumber}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Placed on {new Date(order.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {order.paymentStatus === "PENDING" && (
                          <Button
                            size="sm"
                            onClick={() => setPaymentModalOrder(order)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold rounded-lg h-7 px-2.5 flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Pay via MockGateway</span>
                          </Button>
                        )}
                        <Badge
                          variant="outline"
                          className={
                            order.paymentStatus === "PAID"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]"
                              : "bg-amber-50 text-amber-700 border-amber-200 text-[10px]"
                          }
                        >
                          {order.paymentStatus === "PAID" ? "Paid" : "Payment Pending"} • {order.paymentMethod || "Online"}
                        </Badge>
                        <Badge
                          className={
                            isDelivered
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : "bg-amber-100 text-amber-800 border-amber-300 animate-pulse"
                          }
                        >
                          {isDelivered ? "Delivered" : "Assigned to Driver / In Transit"}
                        </Badge>
                        <span className="text-sm font-black text-[#142017]">₹{order.totalAmount}</span>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-3">
                      {order.items?.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <img
                            src={item.imageUrl || "/images/products/pearl_millet_flour.jpg"}
                            alt={item.productTitle}
                            className="w-12 h-12 rounded-lg object-cover border border-slate-100 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 truncate">{item.productTitle}</h4>
                            <p className="text-[11px] text-slate-500">
                              Qty: {item.quantity} × ₹{item.unitPrice}
                            </p>
                          </div>
                          <span className="text-xs font-bold text-slate-800">₹{item.totalPrice}</span>
                        </div>
                      ))}
                    </div>

                    {/* Driver & Delivery OTP Section */}
                    <div className="bg-[#F8FAF7] rounded-xl p-4 border border-[#E2EBE0] grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                      {/* Driver Details */}
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-[#2E7D42] uppercase tracking-wider flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5" />
                          <span>Assigned Fleet Driver</span>
                        </p>
                        <p className="text-sm font-bold text-slate-900">
                          {order.driverName || "Assignment Pending"}
                        </p>
                        <p className="text-xs text-slate-600 flex items-center gap-2">
                          <span>Phone: {order.driverPhone || "—"}</span>
                          <span>•</span>
                          <span>Vehicle: {order.vehicleNumber || "Pending"}</span>
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Destination: {order.shippingAddress}, {order.city}
                        </p>
                        <div className="pt-2">
                          <Button
                            size="sm"
                            onClick={() => setActiveTrackingOrder(order)}
                            className="bg-[#1B4324] hover:bg-[#14341C] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 h-8 cursor-pointer shadow-2xs"
                          >
                            <Navigation className="w-3.5 h-3.5 text-emerald-300" />
                            <span>View Live Map & Driver Telemetry</span>
                          </Button>
                        </div>
                      </div>

                      {/* OTP & Delivery Action */}
                      <div className="border-t md:border-t-0 md:border-l border-slate-200 md:pl-5 space-y-2">
                        {isDelivered ? (
                          <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                            <CheckCircle2 className="w-5 h-5 shrink-0" />
                            <div>
                              <p className="text-xs font-bold">Delivered & Verified</p>
                              <p className="text-[10px] text-emerald-600">
                                Delivery OTP verified on {new Date(order.deliveredAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 flex items-center justify-between">
                              <div>
                                <span className="text-[10px] font-bold text-amber-800 uppercase block">
                                  Customer Delivery OTP
                                </span>
                                <span className="text-lg font-black tracking-widest text-[#1B4324]">
                                  {order.deliveryOtp}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-500 max-w-[130px] text-right">
                                Share code with driver upon delivery
                              </span>
                            </div>

                            <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200/80 flex items-center justify-between">
                              <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                                <Truck className="w-3.5 h-3.5 text-emerald-700" />
                                <span>Driver verifies OTP at doorstep</span>
                              </span>
                              <span className="text-[10px] text-emerald-700 font-bold">Awaiting Handover</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. SHOPPING CART DRAWER / MODAL
      ───────────────────────────────────────────────────────────── */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#1B4324]" />
                <h3 className="text-base font-bold text-slate-900">Your Cart ({totalCartCount})</h3>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              {cart.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-sm font-semibold text-slate-600">Your cart is empty</p>
                  <p className="text-xs text-slate-400">Add verified millet flours and snacks to start!</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FAF7] border border-[#E3ECE0]"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{item.title}</h4>
                      <p className="text-[11px] text-slate-500">{item.brand}</p>
                      <p className="text-xs font-black text-[#1B4324] mt-1">₹{item.price}</p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-slate-200">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-0.5 text-slate-500 hover:text-slate-800"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-0.5 text-slate-500 hover:text-slate-800"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-slate-100 bg-white space-y-3">
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-900">₹{cartSubtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="font-semibold text-slate-900">
                      {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-[#142017] pt-2 border-t border-slate-100">
                    <span>Total Amount</span>
                    <span>₹{cartGrandTotal}</span>
                  </div>
                </div>

                <Button
                  onClick={handleProceedToCheckout}
                  className="w-full bg-[#1B4324] hover:bg-[#14341C] text-white font-semibold text-xs h-11 rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Proceed to Delivery & Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. AUTH MODAL (Login / Register using Email & Password)
      ───────────────────────────────────────────────────────────── */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in-50 zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#1B4324] flex items-center justify-center text-white">
                  <Sprout className="w-4 h-4 text-emerald-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Customer Account</h3>
                  <p className="text-[11px] text-slate-500">Sign in to buy & track your deliveries</p>
                </div>
              </div>
              <button
                onClick={() => setAuthModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex rounded-xl bg-slate-100 p-1">
              <button
                onClick={() => {
                  setAuthMode("login");
                  setAuthError("");
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  authMode === "login" ? "bg-white text-[#1B4324] shadow-xs" : "text-slate-600"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setAuthMode("register");
                  setAuthError("");
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  authMode === "register" ? "bg-white text-[#1B4324] shadow-xs" : "text-slate-600"
                }`}
              >
                Create Account
              </button>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {authError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              {authMode === "register" && (
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Full Name</label>
                  <Input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="e.g. Mukund Sharma"
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Email Address</label>
                <Input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="h-10 text-xs rounded-xl"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Password</label>
                <Input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-10 text-xs rounded-xl"
                />
              </div>

              <Button
                type="submit"
                disabled={authLoading}
                className="w-full bg-[#1B4324] hover:bg-[#14341C] text-white font-semibold text-xs h-10 rounded-xl cursor-pointer"
              >
                {authLoading ? "Authenticating..." : authMode === "login" ? "Sign In & Continue" : "Create Account & Continue"}
              </Button>
            </form>

            {/* Quick 1-click Demo Buyer Login for instant convenience */}
            <div className="pt-2 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="text-xs font-semibold text-[#1B4324] hover:underline cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>One-Click Demo Buyer Login</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. CHECKOUT MODAL (Shipping Address & Payment Method)
      ───────────────────────────────────────────────────────────── */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in-50 zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Delivery Address & Payment</h3>
                <p className="text-[11px] text-slate-500">Order Total: ₹{cartGrandTotal} ({cart.length} items)</p>
              </div>
              <button
                onClick={() => setCheckoutModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmOrder} className="space-y-4">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#1B4324] uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>1. Shipping Details</span>
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Recipient Name</label>
                    <Input
                      required
                      value={shippingDetails.name}
                      onChange={(e) => setShippingDetails({ ...shippingDetails, name: e.target.value })}
                      className="h-9 text-xs rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Phone Number</label>
                    <Input
                      required
                      value={shippingDetails.phone}
                      onChange={(e) => setShippingDetails({ ...shippingDetails, phone: e.target.value })}
                      className="h-9 text-xs rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Street Address</label>
                  <Input
                    required
                    value={shippingDetails.address}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, address: e.target.value })}
                    className="h-9 text-xs rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">City</label>
                    <Input
                      required
                      value={shippingDetails.city}
                      onChange={(e) => setShippingDetails({ ...shippingDetails, city: e.target.value })}
                      className="h-9 text-xs rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">State</label>
                    <Input
                      required
                      value={shippingDetails.state}
                      onChange={(e) => setShippingDetails({ ...shippingDetails, state: e.target.value })}
                      className="h-9 text-xs rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Pincode</label>
                    <Input
                      required
                      value={shippingDetails.pincode}
                      onChange={(e) => setShippingDetails({ ...shippingDetails, pincode: e.target.value })}
                      className="h-9 text-xs rounded-lg"
                    />
                  </div>
                </div>

                {/* GPS Location Relay Card */}
                <div className="p-3 rounded-xl bg-[#EFF6ED] border border-[#CFE4CB] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#1B4324]">
                      <Navigation className="w-3.5 h-3.5 text-[#2E7D42]" />
                      <span>Delivery GPS Pin (Relayed to Driver)</span>
                    </div>
                    <button
                      type="button"
                      onClick={requestDeliveryLocation}
                      className="text-[11px] font-bold text-[#1B4324] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className={`w-3 h-3 ${deliveryCoordinates.loading ? "animate-spin" : ""}`} />
                      <span>{deliveryCoordinates.loading ? "Locating..." : "Use Live GPS"}</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-700 font-mono bg-white px-3 py-1.5 rounded-lg border border-[#D5E3D2]">
                    <span>
                      📍 {deliveryCoordinates.lat.toFixed(4)}° N, {deliveryCoordinates.lng.toFixed(4)}° E
                    </span>
                    {deliveryCoordinates.granted ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        GPS Locked {deliveryCoordinates.accuracy ? `(±${deliveryCoordinates.accuracy}m)` : ""}
                      </span>
                    ) : (
                      <span className="text-slate-500">Default Verified Hub</span>
                    )}
                  </div>
                  {deliveryCoordinates.error && (
                    <p className="text-[10px] text-amber-800">{deliveryCoordinates.error}</p>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-[#1B4324] uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>2. Payment Method</span>
                </h4>

                <div className="grid grid-cols-3 gap-2">
                  {["UPI", "Card", "COD"].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setShippingDetails({ ...shippingDetails, paymentMethod: method })}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        shippingDetails.paymentMethod === method
                          ? "border-[#1B4324] bg-emerald-50 text-[#1B4324] font-bold"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50 text-xs"
                      }`}
                    >
                      <span className="block text-xs font-bold">
                        {method === "UPI" ? "⚡ UPI / QR" : method === "Card" ? "💳 Debit/Credit" : "💵 Cash on Delivery"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Confirm Button */}
              <div className="pt-3">
                <Button
                  type="submit"
                  disabled={submittingOrder}
                  className="w-full bg-[#1B4324] hover:bg-[#14341C] text-white font-semibold text-xs h-11 rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>
                    {submittingOrder
                      ? "Processing Order & Gateway..."
                      : shippingDetails.paymentMethod === "COD"
                      ? `Confirm COD Order (₹${cartGrandTotal})`
                      : `Proceed to Pay via MockGateway (₹${cartGrandTotal})`}
                  </span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6.5 MOCKGATEWAY PAYMENT DIALOG
      ───────────────────────────────────────────────────────────── */}
      {paymentModalOrder && (
        <OrderRazorpayPaymentDialog
          order={paymentModalOrder}
          open={!!paymentModalOrder}
          onOpenChange={(isOpen) => {
            if (!isOpen) setPaymentModalOrder(null);
          }}
          onPaymentSuccess={handleOrderPaymentSuccess}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          7. ORDER SUCCESS & LIVE DRIVER / MAP MODAL
      ───────────────────────────────────────────────────────────── */}
      {confirmedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="max-w-4xl w-full animate-in fade-in-50 zoom-in-95 duration-200">
            <OrderLiveTrackingMap
              order={confirmedOrder}
              onClose={() => {
                setConfirmedOrder(null);
                setCurrentView("my-orders");
              }}
            />
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          8. ACTIVE TRACKING MODAL (From "My Orders" tab)
      ───────────────────────────────────────────────────────────── */}
      {activeTrackingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="max-w-4xl w-full animate-in fade-in-50 zoom-in-95 duration-200">
            <OrderLiveTrackingMap
              order={activeTrackingOrder}
              onClose={() => setActiveTrackingOrder(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
