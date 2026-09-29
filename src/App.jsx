import { Suspense, lazy, useState } from 'react';
import { ChartColumnBig, CircleAlert, Table2, X } from 'lucide-react';
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
import { buildExportFilename, exportToCSV } from './utils/exportCsv.js';

const AnalyticsView = lazy(() => import('./components/dashboard/AnalyticsView.jsx'));

const VIEW_TABLE = 'table';
const VIEW_ANALYTICS = 'analytics';

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
    exportToCSV(filteredProducts, filename);
  };

  const handleLocateProduct = (product) => {
    if (!product) return;
    setView(VIEW_TABLE);
    setSelectedCategory('all');
    setSearchTerm(product.sku || product.name || '');
    setHighlightAlerts(true);

    window.setTimeout(() => {
      document
        .getElementById(`product-row-${product.id}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 60);
  };

  const handleShowAllAlerts = () => {
    setView(VIEW_TABLE);
    setSelectedCategory('all');
    setSearchTerm('');
    setHighlightAlerts(true);
  };

  if (initializing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-950">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />
        <p className="text-sm text-slate-400">Booting inventory console...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthGate />;
  }

  const isInitialLoad = loading && products.length === 0;

  const viewTabs = [
    { id: VIEW_TABLE, label: 'Inventory Table', icon: Table2 },
    { id: VIEW_ANALYTICS, label: 'Analytics Dashboard', icon: ChartColumnBig }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.10),transparent_55%)]" />

      <div className="relative mx-auto w-full max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Header productCount={products.length} />

        <LowStockBanner
          products={products}
          highlightActive={highlightAlerts}
          onToggleHighlight={() => setHighlightAlerts((prev) => !prev)}
          onLocate={handleLocateProduct}
          onShowAll={handleShowAllAlerts}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex w-fit rounded-xl border border-slate-800 bg-slate-900/70 p-1 backdrop-blur">
            {viewTabs.map((tab) => {
              const Icon = tab.icon;
              const active = view === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setView(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? 'bg-cyan-500/15 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {!isAdmin ? (
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1.5 text-xs text-slate-400">
              <CircleAlert size={13} />
              Viewer mode · read-only
            </span>
          ) : null}
        </div>

        {error ? (
          <div className="flex items-start justify-between gap-3 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            <div className="flex items-start gap-2">
              <CircleAlert size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={clearError}
              aria-label="Dismiss error"
              className="shrink-0 rounded-md p-1 transition hover:bg-rose-500/20"
            >
              <X size={16} />
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
          canWrite={isAdmin}
        />

        {view === VIEW_ANALYTICS ? (
          <Suspense
            fallback={
              <section className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 py-20">
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />
                <p className="text-sm text-slate-400">Loading analytics engine...</p>
              </section>
            }
          >
            <AnalyticsView products={products} />
          </Suspense>
        ) : isInitialLoad ? (
          <section className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 py-20">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-400" />
            <p className="text-sm text-slate-400">Fetching inventory from Supabase...</p>
          </section>
        ) : (
          <ProductTable
            products={filteredProducts}
            loading={loading}
            canWrite={isAdmin}
            highlightAlerts={highlightAlerts}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
            onAdjust={handleAdjust}
            onViewLogs={handleViewLogs}
          />
        )}

        <footer className="border-t border-slate-800/80 pt-4 text-center text-xs text-slate-600">
          Inventory Management System &middot; React + Vite + Tailwind CSS + Supabase
        </footer>
      </div>

      <ProductModal
        isOpen={isModalOpen}
        product={editingProduct}
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
