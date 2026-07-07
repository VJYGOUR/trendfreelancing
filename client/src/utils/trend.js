export function calculateTrend(values) {
  if (values.length < 2) return "Stable";

  const first = Number(values[0]);
  const last = Number(values[values.length - 1]);

  if (last > first) return "Up";

  if (last < first) return "Down";

  return "Stable";
}

export function calculateBusinessHealth(entries) {
  if (entries.length < 2) {
    return "Not Enough Data";
  }

  const revenueTrend = calculateTrend(entries.map((entry) => entry.revenue));

  const clientTrend = calculateTrend(entries.map((entry) => entry.clients));

  if (revenueTrend === "Up" && clientTrend === "Up") {
    return "🟢 Improving";
  }

  if (revenueTrend === "Down" && clientTrend === "Down") {
    return "🔴 Declining";
  }

  return "🟡 Stable";
}
