import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import api from "../services/api";

import BusinessHealth from "../components/BusinessHealth";
import StatCard from "../components/StatCard";
import TrendChart from "../components/TrendChart";

import { calculateTrend, calculateBusinessHealth } from "../utils/trend";

export default function Dashboard() {
  const { getToken } = useAuth();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntries();
  }, []);

  async function fetchEntries() {
    try {
      const token = await getToken();

      const res = await api.get("/entries", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setEntries(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteEntry(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this entry?",
    );

    if (!confirmDelete) return;

    try {
      const token = await getToken();

      await api.delete(`/entries/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setEntries((prev) => prev.filter((entry) => entry._id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  // ==========================
  // Dashboard Metrics
  // ==========================

  const totalRevenue = entries.reduce(
    (sum, entry) => sum + Number(entry.revenue),
    0,
  );

  const totalLeads = entries.reduce(
    (sum, entry) => sum + Number(entry.leads),
    0,
  );

  const totalClients = entries.reduce(
    (sum, entry) => sum + Number(entry.clients),
    0,
  );

  const averageMood =
    entries.length === 0
      ? 0
      : (
          entries.reduce((sum, entry) => sum + Number(entry.mood), 0) /
          entries.length
        ).toFixed(1);

  const chartData = [...entries].reverse().map((entry) => ({
    date: new Date(entry.date).toLocaleDateString(),
    revenue: Number(entry.revenue),
    mood: Number(entry.mood),
    stress: Number(entry.stress),
    clients: Number(entry.clients),
    leads: Number(entry.leads),
  }));

  const revenueTrend = calculateTrend(chartData.map((item) => item.revenue));

  const moodTrend = calculateTrend(chartData.map((item) => item.mood));

  const stressTrend = calculateTrend(chartData.map((item) => item.stress));

  const businessHealth = calculateBusinessHealth(chartData);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 text-xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats Cards */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard title="Revenue" value={`₹${totalRevenue}`} />

        <StatCard title="Leads" value={totalLeads} />

        <StatCard title="Clients" value={totalClients} />

        <StatCard title="Average Mood" value={averageMood} />
      </div>

      {/* Business Health */}

      <BusinessHealth
        businessHealth={businessHealth}
        revenueTrend={revenueTrend}
        moodTrend={moodTrend}
        stressTrend={stressTrend}
      />

      {/* Charts */}

      <div className="space-y-10 my-10">
        <TrendChart title="Revenue Trend" data={chartData} dataKey="revenue" />
        <TrendChart title="LEADS Trend" data={chartData} dataKey="leads" />
        <TrendChart title="Clients Trend" data={chartData} dataKey="clients" />
        <TrendChart title="Mood Trend" data={chartData} dataKey="mood" />

        <TrendChart title="Stress Trend" data={chartData} dataKey="stress" />
      </div>

      {/* Recent Entries */}

      <h2 className="text-2xl font-semibold mb-6">Recent Entries</h2>

      {entries.length === 0 ? (
        <div className="text-center py-16 border rounded-xl">
          <h3 className="text-2xl font-semibold">No Entries Yet</h3>

          <p className="text-gray-500 mt-2">Create your first journal entry.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {entries.map((entry) => (
            <div key={entry._id} className="border rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">
                  {new Date(entry.date).toLocaleDateString()}
                </h3>

                <button
                  onClick={() => deleteEntry(entry._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                  Delete
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <p>
                  <strong>Revenue:</strong> ₹{entry.revenue}
                </p>

                <p>
                  <strong>Leads:</strong> {entry.leads}
                </p>

                <p>
                  <strong>Clients:</strong> {entry.clients}
                </p>

                <p>
                  <strong>Mood:</strong> {entry.mood}
                </p>

                <p>
                  <strong>Stress:</strong> {entry.stress}
                </p>

                <p>
                  <strong>Confidence:</strong> {entry.confidence}
                </p>
              </div>

              <div className="mt-4">
                <strong>Note</strong>

                <p className="mt-1 text-gray-600">{entry.note || "No notes"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
