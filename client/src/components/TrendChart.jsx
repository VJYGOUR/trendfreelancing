import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function TrendChart({ title, data, dataKey }) {
  return (
    <div
      className="
        bg-white
        dark:bg-slate-900
        border
        border-slate-200
        dark:border-slate-800
        rounded-xl
        p-5
        shadow-sm
        transition-colors
        duration-300
      "
    >
      <h2
        className="
          text-xl
          font-semibold
          mb-6
          text-slate-900
          dark:text-white
        "
      >
        {title}
      </h2>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />

          <XAxis
            dataKey="date"
            tick={{
              fill: "currentColor",
            }}
          />

          <YAxis
            tick={{
              fill: "currentColor",
            }}
          />

          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "none",
            }}
          />

          <Line
            type="monotone"
            dataKey={dataKey}
            strokeWidth={3}
            dot={{
              r: 4,
            }}
            activeDot={{
              r: 7,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
