import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { CircleAlert, X } from 'lucide-react';
import useInventory from './hooks/useInventory.js';
import { useAuth } from './context/AuthContext.jsx';
import Header from './components/common/Header.jsx';
import ControlBar from './components/common/ControlBar.jsx';
import AuthGate from './components/common/AuthGate.jsx';
import LowStockBanner from './components/common/LowStockBanner.jsx';
import MetricsBar from './components/dashboard/MetricsBar.jsx';
import ProductTable from './components/inventory/ProductTable.jsx';
import ProductModal from './components/inventory/ProductModal.jsx';
import StockLogModal from './components/inventory/StockLogModal.jsx';
import Sidebar from './components/layout/Sidebar.jsx';
import { buildExportFilename, exportToExcel } from './utils/exportExcel.js';

const AnalyticsView = lazy(() => import('./components/dashboard/AnalyticsView.jsx'));

const VIEW_TABLE = 'table';
const VIEW_ANALYTICS = 'analytics';
const VIEW_ALERTS = 'alerts';

export default function App() {
  const { user, initializing, isAdmin } = useAuth();
  const {
    products,
    filteredProducts,
    categories,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    addProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    clearError
  } = useInventory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [logsProduct, setLogsProduct] = useState(null);
  const [view, setView] = useState(VIEW_TABLE);
  const [highlightAlerts, setHighlightAlerts] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickFilter, setQuickFilter] = useState('all');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return window.localStorage.getItem('inv-sidebar-collapsed') === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(
        'inv-sidebar-collapsed',
        sidebarCollapsed ? '1' : '0'
      );
    } catch {
      /* storage unavailable — state stays session-only */
    }
  }, [sidebarCollapsed]);

  const handleToggleSidebar = () => {
    const isDesktop =
      typeof window !== 'undefined' &&
      window.matchMedia('(min-width: 1024px)').matches;

    if (isDesktop) {
      setSidebarCollapsed((prev) => !prev);
      return;
    }
    setSidebarOpen((prev) => !prev);
  };

  const alertCount = useMemo(
    () =>
      products.filter((product) => {
        const quantity = Number(product.quantity) || 0;
        const minLevel = Number(product.min_reorder_level) || 0;
        return quantity <= minLevel;
      }).length,
    [products]
  );

  const displayProducts = useMemo(() => {
    if (quickFilter === 'all') return filteredProducts;

    return filteredProducts.filter((product) => {
      const quantity = Number(product.quantity) || 0;
      const minLevel = Number(product.min_reorder_level) || 0;

      if (quickFilter === 'low') return quantity > 0 && quantity <= minLevel;
      if (quickFilter === 'out') return quantity === 0;
      return true;
    });
  }, [filteredProducts, quickFilter]);

  const handleOpenAdd = () => {
    if (!isAdmin) return;
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    if (!isAdmin) return;
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSave = async (payload) => {
    if (!isAdmin) return false;

    if (editingProduct) {
      const result = await updateProduct(editingProduct.id, payload);
      return result.success;
    }

    const result = await addProduct(payload);
    return result.success;
  };

  const handleDelete = async (product) => {
    if (!isAdmin) return;

    const confirmed = window.confirm(
      `Delete "${product.name}" (${product.sku})? This cannot be undone.`
    );
    if (!confirmed) return;

    await deleteProduct(product.id);
  };

  const handleAdjust = async (product, delta) => {
    if (!isAdmin) return;
    await adjustStock(product.id, Number(product.quantity) || 0, delta);
  };

  const handleViewLogs = (product = null) => {
    setLogsProduct(product);
    setIsLogsOpen(true);
  };

  const handleExport = () => {
    const filename = buildExportFilename({
      category: selectedCategory,
      searchTerm
    });
    exportToExcel(displayProducts, filename);
  };

  const handleShowAllAlerts = () => {
    setView(VIEW_TABLE);
    setSelectedCategory('all');
    setSearchTerm('');
    setQuickFilter('all');
    setHighlightAlerts(true);
  };

  const handleLocateProduct = (product) => {
    if (!product) return;
    setView(VIEW_TABLE);
    setSelectedCategory('all');
    setSearchTerm(product.sku || product.name || '');
    setQuickFilter('all');
    setHighlightAlerts(true);

    window.setTimeout(() => {
      document
        .getElementById(`product-row-${product.id}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
  };

  const handleNavigate = (target) => {
    if (target === VIEW_ANALYTICS) {
      setView(VIEW_ANALYTICS);
      return;
    }

    if (target === VIEW_ALERTS) {
      handleShowAllAlerts();
      window.setTimeout(() => {
        document
          .getElementById('low-stock-banner')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
      return;
    }

    setView(VIEW_TABLE);
  };

  if (initializing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-950">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-amber-400" />
        <p className="text-sm text-slate-300">Booting inventory console...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthGate />;
  }

  const isInitialLoad = loading && products.length === 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.06),transparent_60%)]" />

      <Sidebar
        view={view}
        alertCount={alertCount}
        alertsActive={highlightAlerts}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        onNavigate={handleNavigate}
        onOpenLogs={() => handleViewLogs(null)}
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      <div
        className={`relative transition-[padding] duration-300 ease-out ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-6">
          <Header
            productCount={products.length}
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={handleToggleSidebar}
          />

          <div id="low-stock-banner" className="scroll-mt-6">
            <LowStockBanner
              products={products}
              highlightActive={highlightAlerts}
              onToggleHighlight={() => setHighlightAlerts((prev) => !prev)}
              onLocate={handleLocateProduct}
              onShowAll={handleShowAllAlerts}
            />
          </div>

          {!isAdmin ? (
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-300">
              <CircleAlert size={15} className="text-amber-300" />
              Viewer mode · read-only
            </span>
          ) : null}

          {error ? (
            <div className="flex items-start justify-between gap-3 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              <div className="flex items-start gap-2">
                <CircleAlert size={18} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={clearError}
                aria-label="Dismiss error"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition hover:bg-rose-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
              >
                <X size={18} />
              </button>
            </div>
          ) : null}

          <MetricsBar products={products} />

          <ControlBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onAddClick={handleOpenAdd}
            onExportClick={handleExport}
            onAuditLogsClick={() => handleViewLogs(null)}
            quickFilter={quickFilter}
            onQuickFilterChange={setQuickFilter}
            resultCount={displayProducts.length}
            canWrite={isAdmin}
          />

          {view === VIEW_ANALYTICS ? (
            <Suspense
              fallback={
                <section className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-amber-500/20 bg-slate-900 py-20">
                  <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-amber-400" />
                  <p className="text-sm text-slate-300">Loading analytics engine...</p>
                </section>
              }
            >
              <AnalyticsView products={products} />
            </Suspense>
          ) : isInitialLoad ? (
            <section className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-amber-500/20 bg-slate-900 py-20">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-amber-400" />
              <p className="text-sm text-slate-300">Fetching inventory from Supabase...</p>
            </section>
          ) : (
            <ProductTable
              products={displayProducts}
              loading={loading}
              canWrite={isAdmin}
              highlightAlerts={highlightAlerts}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
              onAdjust={handleAdjust}
              onViewLogs={handleViewLogs}
            />
          )}

          <footer className="border-t border-slate-800/80 pt-4 text-center text-sm text-slate-400">
            Inventory Management System &middot; React + Vite + Tailwind CSS + Supabase
          </footer>
        </div>
      </div>

      <ProductModal
        isOpen={isModalOpen}
        product={editingProduct}
        products={products}
        categories={categories}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />

      <StockLogModal
        isOpen={isLogsOpen}
        product={logsProduct}
        products={products}
        onClose={() => setIsLogsOpen(false)}
      />
    </div>
  );
}
