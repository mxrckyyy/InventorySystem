const amountFormatter = new Intl.NumberFormat('en-PH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

export function formatPHP(value) {
  return `P${amountFormatter.format(Number(value) || 0)}`;
}

export function formatPHPCompact(value) {
  const amount = Number(value) || 0;
  if (Math.abs(amount) >= 1_000_000) {
    return `P${amountFormatter.format(amount / 1_000_000)}M`;
  }
  return formatPHP(amount);
}
