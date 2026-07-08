import { useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "@clerk/clerk-react";
import api from "../services/api";

import BusinessHealth from "../components/BusinessHealth";
import StatCard from "../components/StatCard";
import TrendChart from "../components/TrendChart";

import { calculateTrend, calculateBusinessHealth } from "../utils/trend";

// ==========================
// Constants
// ==========================
// Add this after the safeNumber function (around line 80)
function getBooksFromPages(pages) {
  const BOOK_PAGES = 300;
  const books = Math.floor(pages / BOOK_PAGES);
  const remainingPages = pages % BOOK_PAGES;
  return { books, remainingPages };
}
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const RANGES = [
  { value: "week", label: "7D", full: "Last 7 Days" },
  { value: "month", label: "1M", full: "Last Month" },
  { value: "quarter", label: "3M", full: "Last Quarter" },
  { value: "sixMonths", label: "6M", full: "Last 6 Months" },
  { value: "year", label: "1Y", full: "Last Year" },
  { value: "all", label: "All", full: "All Time" },
];

// ==========================
// Utility Functions
// ==========================
function isWithinRange(date, range) {
  const today = new Date();
  const diff =
    (today.getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24);

  switch (range) {
    case "week":
      return diff <= 7;
    case "month":
      return diff <= 30;
    case "quarter":
      return diff <= 90;
    case "sixMonths":
      return diff <= 180;
    case "year":
      return diff <= 365;
    default:
      return true;
  }
}

function formatDate(date) {
  try {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return date;
  }
}

function getWeekNumber(date) {
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfMonth = date.getDate();
  return Math.ceil((dayOfMonth + startOfMonth.getDay()) / 7);
}

function getDateLabel(date, timeRange) {
  const d = new Date(date);

  switch (timeRange) {
    case "week":
      return WEEK_DAYS[d.getDay()];
    case "month": {
      const day = d.getDate();
      const month = MONTHS[d.getMonth()];

      if (day <= 7) return `1-7 ${month}`;
      if (day <= 14) return `8-14 ${month}`;
      if (day <= 21) return `15-21 ${month}`;
      if (day <= 28) return `22-28 ${month}`;
      return `29-31 ${month}`;
    }
    case "quarter":
    case "sixMonths":
    case "year":
      return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    default:
      return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }
}

function safeNumber(value) {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

// ==========================
// Main Component
// ==========================
export default function Dashboard() {
  const { getToken } = useAuth();

  // ==========================
  // State
  // ==========================
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("month");
  const [currentPage, setCurrentPage] = useState(1);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const ENTRIES_PER_PAGE = 10;

  // ==========================
  // Data Fetching
  // ==========================
  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getToken();

      if (!token) {
        throw new Error("Authentication required. Please sign in.");
      }

      const res = await api.get("/entries", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Ensure entries is always an array
      setEntries(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch entries:", err);
      setError(err.message || "Failed to load entries. Please try again.");
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Auto-refresh with cleanup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchEntries, 60000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchEntries]);

  // ==========================
  // Delete Entry
  // ==========================
  const deleteEntry = useCallback(
    async (id) => {
      if (!id) return;

      const confirmDelete = window.confirm(
        "Are you sure you want to delete this entry?",
      );

      if (!confirmDelete) return;

      try {
        const token = await getToken();

        if (!token) {
          throw new Error("Authentication required");
        }

        await api.delete(`/entries/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setEntries((prev) => prev.filter((entry) => entry._id !== id));
      } catch (err) {
        console.error("Failed to delete entry:", err);
        setError("Failed to delete entry. Please try again.");
      }
    },
    [getToken],
  );

  // ==========================
  // Data Processing - Memoized
  // ==========================
  const filteredEntries = useMemo(() => {
    if (!Array.isArray(entries) || entries.length === 0) return [];
    if (timeRange === "all") return entries;
    return entries.filter(
      (entry) => entry && entry.date && isWithinRange(entry.date, timeRange),
    );
  }, [entries, timeRange]);

  const chartData = useMemo(() => {
    if (!Array.isArray(filteredEntries) || filteredEntries.length === 0) {
      // Return empty chart data with default labels based on timeRange
      let defaultLabels = [];
      switch (timeRange) {
        case "week":
          defaultLabels = WEEK_DAYS;
          break;
        case "month": {
          const month = MONTHS[new Date().getMonth()];
          defaultLabels = [
            `1-7 ${month}`,
            `8-14 ${month}`,
            `15-21 ${month}`,
            `22-28 ${month}`,
            `29-31 ${month}`,
          ];
          break;
        }
        default:
          defaultLabels = [];
      }
      return defaultLabels.map((label) => ({
        label,
        revenue: 0,
        leads: 0,
        clients: 0,
        coding: 0,
        post: 0,
        bookPage: 0,
      }));
    }

    // Sort entries chronologically
    const sortedEntries = [...filteredEntries]
      .filter((entry) => entry && entry.date)
      .sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
      });

    const groups = {};

    sortedEntries.forEach((entry) => {
      const label = getDateLabel(entry.date, timeRange);

      if (!groups[label]) {
        groups[label] = {
          label,
          revenue: 0,
          leads: 0,
          clients: 0,
          coding: 0,
          post: 0,
          bookPage: 0,
          count: 0,
        };
      }

      groups[label].revenue += safeNumber(entry.revenue);
      groups[label].leads += safeNumber(entry.leads);
      groups[label].clients += safeNumber(entry.clients);
      groups[label].coding += safeNumber(entry.coding);
      groups[label].post += safeNumber(entry.post);
      groups[label].bookPage += safeNumber(entry.bookPage);
      groups[label].count++;
    });

    let labels = [];

    switch (timeRange) {
      case "week": {
        labels = WEEK_DAYS;
        break;
      }
      case "month": {
        const month = new Date().getMonth();
        const monthName = MONTHS[month];
        const dayRanges = [
          `1-7 ${monthName}`,
          `8-14 ${monthName}`,
          `15-21 ${monthName}`,
          `22-28 ${monthName}`,
          `29-31 ${monthName}`,
        ];

        // Only show ranges that have data or keep all for consistency
        const existingRanges = Object.keys(groups);
        labels = dayRanges.filter(
          (range) =>
            existingRanges.includes(range) || existingRanges.length === 0,
        );

        // If no ranges have data, show all
        if (labels.length === 0) {
          labels = dayRanges;
        }
        break;
      }
      case "quarter":
      case "sixMonths":
      case "year": {
        const uniqueLabels = [
          ...new Set(
            sortedEntries.map((e) => {
              const d = new Date(e.date);
              return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
            }),
          ),
        ];

        labels = uniqueLabels.sort((a, b) => {
          const [monthA, yearA] = a.split(" ");
          const [monthB, yearB] = b.split(" ");
          const dateA = new Date(`${monthA} 1, ${yearA}`);
          const dateB = new Date(`${monthB} 1, ${yearB}`);
          return dateA - dateB;
        });
        break;
      }
      default: {
        if (sortedEntries.length > 0) {
          const firstDate = new Date(sortedEntries[0].date);
          const lastDate = new Date(
            sortedEntries[sortedEntries.length - 1].date,
          );

          const allLabels = [];
          const currentDate = new Date(
            firstDate.getFullYear(),
            firstDate.getMonth(),
            1,
          );
          const endDate = new Date(
            lastDate.getFullYear(),
            lastDate.getMonth(),
            1,
          );

          while (currentDate <= endDate) {
            const monthYear = `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
            allLabels.push(monthYear);
            currentDate.setMonth(currentDate.getMonth() + 1);
          }

          labels = allLabels;
        } else {
          labels = Object.keys(groups).sort((a, b) => {
            const [monthA, yearA] = a.split(" ");
            const [monthB, yearB] = b.split(" ");
            if (monthA && yearA && monthB && yearB) {
              const dateA = new Date(`${monthA} 1, ${yearA}`);
              const dateB = new Date(`${monthB} 1, ${yearB}`);
              return dateA - dateB;
            }
            return 0;
          });
        }
      }
    }

    return labels.map((label) => {
      if (!groups[label]) {
        return {
          label,
          revenue: 0,
          leads: 0,
          clients: 0,
          coding: 0,
          post: 0,
          bookPage: 0,
        };
      }

      return {
        ...groups[label],
        coding:
          groups[label].count > 0
            ? +(groups[label].coding / groups[label].count).toFixed(1)
            : 0,
        post:
          groups[label].count > 0
            ? +(groups[label].post / groups[label].count).toFixed(1)
            : 0,
        bookPage:
          groups[label].count > 0
            ? +(groups[label].bookPage / groups[label].count).toFixed(1)
            : 0,
      };
    });
  }, [filteredEntries, timeRange]);

  // ==========================
  // Metrics Calculations
  // ==========================
  const metrics = useMemo(() => {
    if (!Array.isArray(filteredEntries) || filteredEntries.length === 0) {
      return {
        totalRevenue: 0,
        totalLeads: 0,
        totalClients: 0,
        highestRevenue: 0,
        totalPost: 0,
        totalCoding: 0,
        totalbookPage: 0,
        bestDay: null,
      };
    }

    const validEntries = filteredEntries.filter((entry) => entry && entry.date);

    if (validEntries.length === 0) {
      return {
        totalRevenue: 0,
        totalLeads: 0,
        totalClients: 0,
        highestRevenue: 0,
        totalPost: 0,
        totalCoding: 0,
        totalbookPage: 0,
        bestDay: null,
      };
    }

    const totals = validEntries.reduce(
      (acc, entry) => ({
        revenue: acc.revenue + safeNumber(entry.revenue),
        leads: acc.leads + safeNumber(entry.leads),
        clients: acc.clients + safeNumber(entry.clients),
        coding: acc.coding + safeNumber(entry.coding),
        post: acc.post + safeNumber(entry.post),
        bookPage: acc.bookPage + safeNumber(entry.bookPage),
        count: acc.count + 1,
      }),
      {
        revenue: 0,
        leads: 0,
        clients: 0,
        coding: 0,
        post: 0,
        bookPage: 0,
        count: 0,
      },
    );

    const highestRevenue = validEntries.reduce(
      (max, entry) => Math.max(max, safeNumber(entry.revenue)),
      0,
    );

    const bestDay = validEntries.reduce((best, current) => {
      if (!best) return current;
      return safeNumber(current.revenue) > safeNumber(best.revenue)
        ? current
        : best;
    }, null);

    return {
      totalRevenue: totals.revenue,
      totalLeads: totals.leads,
      totalClients: totals.clients,
      highestRevenue,
      totalPost: totals.post,
      totalCoding: totals.coding,
      totalbookPage: totals.bookPage,
      bestDay,
    };
  }, [filteredEntries]);

  // ==========================
  // Trends & Health
  // ==========================
  const trends = useMemo(() => {
    const revenueData = chartData.map((item) => item.revenue || 0);
    const codingData = chartData.map((item) => item.coding || 0);
    const postData = chartData.map((item) => item.post || 0);

    let revenueTrend = 0;
    let codingTrend = 0;
    let postTrend = 0;
    let businessHealth = 0;

    try {
      const result = calculateTrend(revenueData);
      revenueTrend = typeof result === "number" && !isNaN(result) ? result : 0;
    } catch (e) {
      revenueTrend = 0;
    }

    try {
      const result = calculateTrend(codingData);
      codingTrend = typeof result === "number" && !isNaN(result) ? result : 0;
    } catch (e) {
      codingTrend = 0;
    }

    try {
      const result = calculateTrend(postData);
      postTrend = typeof result === "number" && !isNaN(result) ? result : 0;
    } catch (e) {
      postTrend = 0;
    }

    try {
      const result = calculateBusinessHealth(chartData);
      businessHealth =
        typeof result === "number" && !isNaN(result) ? result : 0;
    } catch (e) {
      businessHealth = 0;
    }

    return {
      revenueTrend,
      codingTrend,
      postTrend,
      businessHealth,
    };
  }, [chartData]);

  const performanceScore = useMemo(() => {
    if (!Array.isArray(filteredEntries) || filteredEntries.length === 0)
      return 0;

    const businessHealth = trends.businessHealth || 0;
    const totalCoding = safeNumber(metrics.totalCoding);
    const totalbookPage = safeNumber(metrics.totalbookPage);
    const postTrend = trends.postTrend || 0;

    const score = Math.round(
      (businessHealth + totalCoding * 10 + totalbookPage * 10 - postTrend * 5) /
        3,
    );

    return Math.max(0, Math.min(100, score));
  }, [filteredEntries, trends, metrics]);

  // ==========================
  // Pagination
  // ==========================
  const paginatedEntries = useMemo(() => {
    if (!Array.isArray(filteredEntries)) return [];
    const start = (currentPage - 1) * ENTRIES_PER_PAGE;
    const end = start + ENTRIES_PER_PAGE;
    return filteredEntries.slice(start, end);
  }, [filteredEntries, currentPage]);

  const totalPages = Math.ceil(
    (Array.isArray(filteredEntries) ? filteredEntries.length : 0) /
      ENTRIES_PER_PAGE,
  );

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [timeRange]);

  // ==========================
  // Export Function
  // ==========================
  const exportData = useCallback(() => {
    if (!Array.isArray(filteredEntries) || filteredEntries.length === 0) {
      alert("No data to export.");
      return;
    }

    try {
      const headers = [
        "Date",
        "Revenue",
        "Leads",
        "Clients",
        "coding",
        "post",
        "bookPage",
        "Note",
      ];
      const csvRows = [
        headers.join(","),
        ...filteredEntries.map((entry) => {
          const date = entry.date ? formatDate(entry.date) : "";
          const note = (entry.note || "").replace(/"/g, '""');
          return [
            date,
            safeNumber(entry.revenue),
            safeNumber(entry.leads),
            safeNumber(entry.clients),
            safeNumber(entry.coding),
            safeNumber(entry.post),
            safeNumber(entry.bookPage),
            `"${note}"`,
          ].join(",");
        }),
      ];

      const csv = csvRows.join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dashboard-export-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error("Failed to export data:", err);
      setError("Failed to export data. Please try again.");
    }
  }, [filteredEntries]);

  // ==========================
  // Loading State
  // ==========================
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 animate-pulse">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 mb-10">
          <div>
            <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
            <div className="h-5 w-72 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 shadow-sm">
            {RANGES.map((range) => (
              <div
                key={range.value}
                className="px-4 py-2 rounded-lg w-12 h-10 bg-gray-200 dark:bg-gray-700 mx-0.5"
              ></div>
            ))}
          </div>
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"
            ></div>
          ))}
        </div>
        <div className="grid xl:grid-cols-2 gap-8 my-12">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  // ==========================
  // Main Render
  // ==========================
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            View your business performance across different time periods.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={exportData}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            disabled={
              !Array.isArray(filteredEntries) || filteredEntries.length === 0
            }
          >
            Export CSV
          </button>

          <button
            onClick={fetchEntries}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Refresh
          </button>

          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 shadow-sm flex-wrap">
            {RANGES.map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-all
                  ${
                    timeRange === range.value
                      ? "bg-white dark:bg-slate-700 shadow text-blue-600 dark:text-blue-400"
                      : "hover:bg-white/40 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400"
                  }
                `}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6 flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-200 text-xl font-bold"
          >
            ×
          </button>
        </div>
      )}

      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <p className="text-gray-500 dark:text-gray-400">
          Showing analytics for
          <span className="font-semibold ml-2">
            {RANGES.find((r) => r.value === timeRange)?.full || "All Time"}
          </span>
        </p>

        <div className="flex items-center gap-4">
          <span className="text-gray-500 dark:text-gray-400">
            {Array.isArray(filteredEntries) ? filteredEntries.length : 0}{" "}
            Entries
          </span>

          <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={() => setAutoRefresh(!autoRefresh)}
              className="rounded"
            />
            Auto-refresh
          </label>
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        <StatCard title="Revenue" value={`₹${metrics.totalRevenue}`} />
        <StatCard title="Leads" value={metrics.totalLeads} />
        <StatCard title="Clients" value={metrics.totalClients} />
        <StatCard title="Total Coding" value={`${metrics.totalCoding} hrs`} />
        <StatCard
          title="Highest Revenue"
          value={`₹${metrics.highestRevenue}`}
        />
        <StatCard
          title="Books Read"
          value={`${getBooksFromPages(metrics.totalbookPage).books} 📚`}
        />
        <StatCard title="Total Post" value={metrics.totalPost} />
        <StatCard title="Performance" value={`${performanceScore}%`} />
      </div>

      {(!Array.isArray(filteredEntries) || filteredEntries.length === 0) && (
        <div className="border rounded-xl p-10 text-center mb-10">
          <h2 className="text-2xl font-semibold">No data available</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3">
            There are no entries for the selected period.
          </p>
          <button
            onClick={() => setTimeRange("all")}
            className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            View All Time
          </button>
        </div>
      )}

      {metrics.bestDay &&
        Array.isArray(filteredEntries) &&
        filteredEntries.length > 0 && (
          <div className="mb-10 rounded-xl border p-6 bg-gradient-to-r from-green-50 to-green-100 dark:from-slate-900 dark:to-slate-800">
            <h2 className="text-xl font-bold">🏆 Best Performing Day</h2>
            <p className="mt-3">
              <strong>
                {metrics.bestDay.date
                  ? formatDate(metrics.bestDay.date)
                  : "N/A"}
              </strong>
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 mt-6 gap-4">
              <div>
                Revenue
                <h3 className="font-bold">
                  ₹{safeNumber(metrics.bestDay.revenue)}
                </h3>
              </div>
              <div>
                Clients
                <h3 className="font-bold">
                  {safeNumber(metrics.bestDay.clients)}
                </h3>
              </div>
              <div>
                Leads
                <h3 className="font-bold">
                  {safeNumber(metrics.bestDay.leads)}
                </h3>
              </div>
              <div>
                Coding
                <h3 className="font-bold">
                  {safeNumber(metrics.bestDay.coding)}
                </h3>
              </div>
            </div>
          </div>
        )}

      {Array.isArray(filteredEntries) && filteredEntries.length > 0 && (
        <BusinessHealth
          businessHealth={trends.businessHealth}
          revenueTrend={trends.revenueTrend}
          codingTrend={trends.codingTrend}
          postTrend={trends.postTrend}
        />
      )}

      {chartData && chartData.length > 0 && (
        <div className="grid xl:grid-cols-2 gap-8 my-12">
          <TrendChart
            title="Revenue Trend"
            data={chartData}
            dataKey="revenue"
            xAxisKey="label"
          />
          <TrendChart
            title="Leads Trend"
            data={chartData}
            dataKey="leads"
            xAxisKey="label"
          />
          <TrendChart
            title="Clients Trend"
            data={chartData}
            dataKey="clients"
            xAxisKey="label"
          />
          <TrendChart
            title="Coding Trend"
            data={chartData}
            dataKey="coding"
            xAxisKey="label"
          />
          <TrendChart
            title="Post Trend"
            data={chartData}
            dataKey="post"
            xAxisKey="label"
          />
        </div>
      )}

      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
        <h2 className="text-2xl font-semibold">Recent Entries</h2>
        <span className="text-gray-500 dark:text-gray-400">
          Showing{" "}
          {Array.isArray(filteredEntries)
            ? Math.min(filteredEntries.length, ENTRIES_PER_PAGE)
            : 0}{" "}
          of {Array.isArray(filteredEntries) ? filteredEntries.length : 0}
        </span>
      </div>

      {!Array.isArray(entries) || entries.length === 0 ? (
        <div className="text-center py-16 border rounded-xl">
          <h3 className="text-2xl font-semibold">No Entries Yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Create your first journal entry.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-5">
            {paginatedEntries.map((entry) => (
              <div
                key={entry._id || Math.random()}
                className="border rounded-xl p-5 shadow-sm"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">
                    {entry.date ? formatDate(entry.date) : "Invalid Date"}
                  </h3>
                  <button
                    onClick={() => deleteEntry(entry._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <p>
                    <strong>Revenue:</strong> ₹{safeNumber(entry.revenue)}
                  </p>
                  <p>
                    <strong>Leads:</strong> {safeNumber(entry.leads)}
                  </p>
                  <p>
                    <strong>Clients:</strong> {safeNumber(entry.clients)}
                  </p>
                  <p>
                    <strong>Coding:</strong> {safeNumber(entry.coding)}
                  </p>
                  <p>
                    <strong>Post:</strong> {safeNumber(entry.post)}
                  </p>
                  <p>
                    <strong>bookPage:</strong> {safeNumber(entry.bookPage)}
                  </p>
                </div>

                <div className="mt-4">
                  <strong>Note</strong>
                  <p className="mt-1 text-gray-600 dark:text-gray-400">
                    {entry.note || "No notes"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
