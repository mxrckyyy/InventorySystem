const phpCurrency = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP'
});

export function formatPHP(value) {
  return phpCurrency.format(Number(value) || 0);
}

export function formatPHPCompact(value) {
  const amount = Number(value) || 0;
  if (Math.abs(amount) >= 1_000_000) {
    return `${phpCurrency.format(amount / 1_000_000)}M`;
  }
  return phpCurrency.format(amount);
}
