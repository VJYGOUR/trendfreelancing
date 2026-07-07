export default function BusinessHealth({
  businessHealth,
  revenueTrend,
  moodTrend,
  stressTrend,
}) {
  return (
    <div className="border rounded-xl p-6 shadow-sm mb-10">
      <h2 className="text-2xl font-bold mb-4">Business Health</h2>

      <div className="space-y-2">
        <p>
          <strong>Overall:</strong> {businessHealth}
        </p>

        <p>
          <strong>Revenue Trend:</strong> {revenueTrend}
        </p>

        <p>
          <strong>Mood Trend:</strong> {moodTrend}
        </p>

        <p>
          <strong>Stress Trend:</strong> {stressTrend}
        </p>
      </div>
    </div>
  );
}
