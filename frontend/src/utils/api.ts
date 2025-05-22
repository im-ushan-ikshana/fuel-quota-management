export async function fetchFuelQuotas() {
  // Replace with real API endpoint
  const res = await fetch("/api/fuel-quota");
  if (!res.ok) throw new Error("Failed to fetch fuel quotas");
  return res.json();
}
