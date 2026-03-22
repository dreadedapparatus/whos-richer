export const formatNetWorth = (value: number) => {
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(1).replace(/\.0$/, '')} Billion`;
  }
  if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(1).replace(/\.0$/, '')} Million`;
  }
  return `$${value.toLocaleString()}`;
};
