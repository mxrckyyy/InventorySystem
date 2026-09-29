import { Boxes, CircleDollarSign, PackageX, TriangleAlert } from 'lucide-react';
import StatCard from './StatCard.jsx';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

export default function MetricsBar({ products = [] }) {
  const totalProducts = products.length;

  const totalValuation = products.reduce((sum, product) => {
    const price = Number(product.unit_price) || 0;
    const quantity = Number(product.quantity) || 0;
    return sum + price * quantity;
  }, 0);

  const lowStockCount = products.filter((product) => {
    const quantity = Number(product.quantity) || 0;
    const minLevel = Number(product.min_reorder_level) || 0;
    return quantity <= minLevel && quantity > 0;
  }).length;

  const outOfStockCount = products.filter(
    (product) => (Number(product.quantity) || 0) === 0
  ).length;

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Total Products"
        value={totalProducts}
        icon={Boxes}
        tone="cyan"
        hint="Catalogue size"
      />
      <StatCard
        title="Total Valuation"
        value={currency.format(totalValuation)}
        icon={CircleDollarSign}
        tone="emerald"
        hint="Price x quantity"
      />
      <StatCard
        title="Low Stock"
        value={lowStockCount}
        icon={TriangleAlert}
        tone="amber"
        hint="At or below reorder level"
      />
      <StatCard
        title="Out of Stock"
        value={outOfStockCount}
        icon={PackageX}
        tone="rose"
        hint="Quantity is zero"
      />
    </section>
  );
}
