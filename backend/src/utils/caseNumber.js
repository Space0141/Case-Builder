export function makeCaseNumber(id) {
  const year = new Date().getFullYear();
  return `CB-${year}-${String(id).padStart(6, "0")}`;
}
