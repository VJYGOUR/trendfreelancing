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
  { value: "today", label: "Today", full: "Today" },
  { value: "week", label: "7D", full: "Last 7 Days" },
  { value: "month", label: "30D", full: "Last 30 Days" },
  { value: "thisMonth", label: "Month", full: "This Month" },
  { value: "quarter", label: "3M", full: "Last Quarter" },
  { value: "sixMonths", label: "6M", full: "Last 6 Months" },
  { value: "year", label: "1Y", full: "Last Year" },
  { value: "thisYear", label: "Year", full: "This Year" },
  { value: "myYear", label: "My Year", full: "My Year (365 Days)" },
  { value: "all", label: "All", full: "All Time" },
];

// ==========================
// Goals Configuration
// ==========================
const GOALS = {
  daily: {
    pages: 10,
    coding: 2,
    exercise: 30,
    meditation: 10,
    nevillegoddard: 12,
    expression: 45,
  },
  weekly: {
    posts: 2,
    meetings: 3,
  },
  monthly: {
    revenue: 5000,
    clients: 2,
    leads: 5,
    content: 4,
  },
};

// ==========================
// Achievement Badges Configuration
// ==========================
const BADGES = [
  {
    id: "first_entry",
    label: "🌟 First Entry",
    icon: "🌟",
    condition: (entries) => entries.length >= 1,
  },
  {
    id: "seven_days",
    label: "🔥 7 Day Streak",
    icon: "🔥",
    condition: (entries) => getStreak(entries) >= 7,
  },
  {
    id: "fourteen_days",
    label: "⚡ 14 Day Streak",
    icon: "⚡",
    condition: (entries) => getStreak(entries) >= 14,
  },
  {
    id: "thirty_days",
    label: "🏆 30 Day Streak",
    icon: "🏆",
    condition: (entries) => getStreak(entries) >= 30,
  },
  {
    id: "hundred_pages",
    label: "📚 100 Pages Read",
    icon: "📚",
    condition: (entries) => getTotalPages(entries) >= 100,
  },
  {
    id: "five_hundred_pages",
    label: "📖 500 Pages Read",
    icon: "📖",
    condition: (entries) => getTotalPages(entries) >= 500,
  },
  {
    id: "thousand_pages",
    label: "📚 1000 Pages Read",
    icon: "📚",
    condition: (entries) => getTotalPages(entries) >= 1000,
  },
  {
    id: "first_client",
    label: "🤝 First Client",
    icon: "🤝",
    condition: (entries) => getTotalClients(entries) >= 1,
  },
  {
    id: "ten_clients",
    label: "🎯 10 Clients",
    icon: "🎯",
    condition: (entries) => getTotalClients(entries) >= 10,
  },
  {
    id: "first_revenue",
    label: "💰 First Revenue",
    icon: "💰",
    condition: (entries) => getTotalRevenue(entries) >= 1000,
  },
  {
    id: "ten_k_revenue",
    label: "💎 ₹10K Revenue",
    icon: "💎",
    condition: (entries) => getTotalRevenue(entries) >= 10000,
  },
  {
    id: "fifty_k_revenue",
    label: "👑 ₹50K Revenue",
    icon: "👑",
    condition: (entries) => getTotalRevenue(entries) >= 50000,
  },
  {
    id: "hundred_k_revenue",
    label: "🌟 ₹1L Revenue",
    icon: "🌟",
    condition: (entries) => getTotalRevenue(entries) >= 100000,
  },
  {
    id: "fifty_coding",
    label: "💻 50 Hours Coding",
    icon: "💻",
    condition: (entries) => getTotalCoding(entries) >= 50,
  },
  {
    id: "hundred_coding",
    label: "⚡ 100 Hours Coding",
    icon: "⚡",
    condition: (entries) => getTotalCoding(entries) >= 100,
  },
  {
    id: "ten_posts",
    label: "📱 10 Posts",
    icon: "📱",
    condition: (entries) => getTotalPosts(entries) >= 10,
  },
  {
    id: "fifty_posts",
    label: "📢 50 Posts",
    icon: "📢",
    condition: (entries) => getTotalPosts(entries) >= 50,
  },
];

// Helper functions for badges
function getStreak(entries) {
  if (!entries || entries.length === 0) return 0;

  const dates = entries
    .filter((e) => e && e.date)
    .map((e) => new Date(e.date).toDateString())
    .filter((value, index, self) => self.indexOf(value) === index)
    .sort((a, b) => new Date(b) - new Date(a));

  if (dates.length === 0) return 0;

  const today = new Date().toDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  const hasToday = dates.includes(today);
  const hasYesterday = dates.includes(yesterdayStr);

  if (!hasToday && !hasYesterday) {
    return 0;
  }

  let streak = 0;
  let currentDate = new Date();

  if (!hasToday) {
    currentDate.setDate(currentDate.getDate() - 1);
  }

  while (true) {
    const dateStr = currentDate.toDateString();
    if (dates.includes(dateStr)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

function getTotalPages(entries) {
  return entries.reduce((sum, e) => sum + safeNumber(e.bookPage), 0);
}

function getTotalClients(entries) {
  return entries.reduce((sum, e) => sum + safeNumber(e.clients), 0);
}

function getTotalRevenue(entries) {
  return entries.reduce((sum, e) => sum + safeNumber(e.revenue), 0);
}

function getTotalCoding(entries) {
  return entries.reduce((sum, e) => sum + safeNumber(e.coding), 0);
}

function getTotalPosts(entries) {
  return entries.reduce((sum, e) => sum + safeNumber(e.post), 0);
}
function getTotalExercise(entries) {
  return entries.reduce((sum, e) => sum + safeNumber(e.exercise), 0);
}

function getTotalMeditation(entries) {
  return entries.reduce((sum, e) => sum + safeNumber(e.meditation), 0);
}
function getTotalNevillegoddard(entries) {
  return entries.reduce((sum, e) => sum + safeNumber(e.nevillegoddard), 0);
}
function getTotalExpression(entries) {
  return entries.reduce((sum, e) => sum + safeNumber(e.expression), 0);
}
// ==========================
// Utility Functions
// ==========================
function isWithinRange(date, range) {
  const today = new Date();
  const targetDate = new Date(date);
  const diff = (today.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24);

  switch (range) {
    case "today":
      return targetDate.toDateString() === today.toDateString();
    case "week":
      return diff <= 7;
    case "month":
      return diff <= 30;
    case "thisMonth": {
      const targetMonth = targetDate.getMonth();
      const targetYear = targetDate.getFullYear();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      return targetMonth === currentMonth && targetYear === currentYear;
    }
    case "quarter":
      return diff <= 90;
    case "sixMonths":
      return diff <= 180;
    case "year":
      return diff <= 365;
    case "thisYear": {
      return targetDate.getFullYear() === today.getFullYear();
    }
    case "myYear": {
      // Show entries from first entry date to 365 days later
      return true; // Filtered by date range in filteredEntries
    }
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
    case "today":
      return "Today";
    case "week":
      return WEEK_DAYS[d.getDay()];
    case "month":
    case "thisMonth":
    case "myYear": {
      const day = d.getDate();
      const month = MONTHS[d.getMonth()];
      return `${day} ${month}`;
    }
    case "quarter":
    case "sixMonths":
    case "year":
    case "thisYear":
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
  const [editingEntry, setEditingEntry] = useState(null);
  const [editFormData, setEditFormData] = useState(null);

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

        await api.delete(`/entries/entries-delete/${id}`, {
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
  // Edit Entry
  // ==========================
  const startEdit = useCallback((entry) => {
    setEditingEntry(entry._id);
    setEditFormData({
      date: entry.date ? entry.date.split("T")[0] : "",
      leads: entry.leads || 0,
      clients: entry.clients || 0,
      revenue: entry.revenue || 0,
      coding: entry.coding || 0,
      post: entry.post || 0,
      bookPage: entry.bookPage || 0,
      exercise: entry.exercise || 0, // ✅ ADD THIS
      meditation: entry.meditation || 0,
      nevillegoddard: entry.nevillegoddard || 0, // ✅ ADD THIS
      expression: entry.expression || 0,
      note: entry.note || "",
    });
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingEntry(null);
    setEditFormData(null);
  }, []);

  const saveEdit = useCallback(
    async (id) => {
      if (!id || !editFormData) return;

      try {
        const token = await getToken();

        if (!token) {
          throw new Error("Authentication required");
        }

        await api.put(`/entries/entries-edit/${id}`, editFormData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        await fetchEntries();
        setEditingEntry(null);
        setEditFormData(null);
      } catch (err) {
        console.error("Failed to update entry:", err);
        setError("Failed to update entry. Please try again.");
      }
    },
    [editFormData, getToken, fetchEntries],
  );

  const handleEditChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value,
    });
  };

  // ==========================
  // Data Processing - Memoized
  // ==========================
  const filteredEntries = useMemo(() => {
    if (!Array.isArray(entries) || entries.length === 0) return [];
    if (timeRange === "all") return entries;
    if (timeRange === "myYear") {
      // Get first entry date
      const sortedEntries = [...entries]
        .filter((entry) => entry && entry.date)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      if (sortedEntries.length === 0) return [];

      const firstDate = new Date(sortedEntries[0].date);
      const endDate = new Date(firstDate);
      endDate.setFullYear(endDate.getFullYear() + 1); // 365 days later

      return entries.filter((entry) => {
        if (!entry || !entry.date) return false;
        const entryDate = new Date(entry.date);
        return entryDate >= firstDate && entryDate <= endDate;
      });
    }
    return entries.filter(
      (entry) => entry && entry.date && isWithinRange(entry.date, timeRange),
    );
  }, [entries, timeRange]);

  const chartData = useMemo(() => {
    if (!Array.isArray(filteredEntries) || filteredEntries.length === 0) {
      let defaultLabels = [];
      switch (timeRange) {
        case "today":
          defaultLabels = ["Today"];
          break;
        case "week":
          defaultLabels = WEEK_DAYS;
          break;
        case "month":
        case "thisMonth": {
          const today = new Date();
          const labels = [];
          const daysInMonth = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            0,
          ).getDate();
          for (let i = 1; i <= daysInMonth; i++) {
            labels.push(`${i} ${MONTHS[today.getMonth()]}`);
          }
          defaultLabels = labels;
          break;
        }
        case "thisYear": {
          const today = new Date();
          const labels = [];
          for (let i = 0; i <= today.getMonth(); i++) {
            labels.push(MONTHS[i]);
          }
          defaultLabels = labels;
          break;
        }
        case "myYear": {
          // For empty data, show months from current month forward
          const today = new Date();
          const labels = [];
          for (let i = 0; i < 12; i++) {
            labels.push(MONTHS[i]);
          }
          defaultLabels = labels;
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
        exercise: 0, // ✅ ADD
        meditation: 0,
        nevillegoddard: 0,
        expression: 0,
      }));
    }

    const sortedEntries = [...filteredEntries]
      .filter((entry) => entry && entry.date)
      .sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
      });

    let groups = {};

    // For "myYear", we need special handling to show months from first entry
    if (timeRange === "myYear") {
      const firstDate = new Date(sortedEntries[0].date);
      const endDate = new Date(firstDate);
      endDate.setFullYear(endDate.getFullYear() + 1);

      // Initialize all months with 0 values
      let currentDate = new Date(firstDate);
      while (currentDate <= endDate) {
        const monthKey = `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        groups[monthKey] = {
          label: monthKey,
          revenue: 0,
          leads: 0,
          clients: 0,
          coding: 0,
          post: 0,
          bookPage: 0,
          exercise: 0, // ✅ ADD THIS
          meditation: 0,
          nevillegoddard: 0,
          expression: 0,
          count: 0,
        };
        currentDate.setMonth(currentDate.getMonth() + 1);
      }

      // Fill in actual data
      sortedEntries.forEach((entry) => {
        const d = new Date(entry.date);
        const monthKey = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

        if (groups[monthKey]) {
          groups[monthKey].revenue += safeNumber(entry.revenue);
          groups[monthKey].leads += safeNumber(entry.leads);
          groups[monthKey].clients += safeNumber(entry.clients);
          groups[monthKey].coding += safeNumber(entry.coding);
          groups[monthKey].post += safeNumber(entry.post);
          groups[monthKey].bookPage += safeNumber(entry.bookPage);
          groups[monthKey].exercise += safeNumber(entry.exercise); // ✅ ADD
          groups[monthKey].meditation += safeNumber(entry.meditation);
          groups[monthKey].nevillegoddard += safeNumber(entry.nevillegoddard);
          groups[monthKey].expression += safeNumber(entry.expression);
          groups[monthKey].count++;
        }
      });
    } else {
      // Original grouping logic for other views
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
            exercise: 0, // ✅ ADD
            meditation: 0,
            nevillegoddard: 0,
            expression: 0,
            count: 0,
          };
        }

        groups[label].revenue += safeNumber(entry.revenue);
        groups[label].leads += safeNumber(entry.leads);
        groups[label].clients += safeNumber(entry.clients);
        groups[label].coding += safeNumber(entry.coding);
        groups[label].post += safeNumber(entry.post);
        groups[label].bookPage += safeNumber(entry.bookPage);
        groups[label].exercise += safeNumber(entry.exercise); // ✅ ADD
        groups[label].meditation += safeNumber(entry.meditation);
        groups[label].nevillegoddard += safeNumber(entry.nevillegoddard);
        groups[label].expression += safeNumber(entry.expression);
        groups[label].count++;
      });
    }

    let labels = [];

    switch (timeRange) {
      case "today": {
        labels = ["Today"];
        break;
      }
      case "week": {
        labels = WEEK_DAYS;
        break;
      }
      case "month":
      case "thisMonth": {
        const today = new Date();
        const labelsList = [];
        const daysInMonth = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0,
        ).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
          labelsList.push(`${i} ${MONTHS[today.getMonth()]}`);
        }
        labels = labelsList;
        break;
      }
      case "quarter":
      case "sixMonths":
      case "year":
      case "thisYear": {
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
      case "myYear": {
        // Get all month keys from groups and sort them
        const monthKeys = Object.keys(groups).sort((a, b) => {
          const [monthA, yearA] = a.split(" ");
          const [monthB, yearB] = b.split(" ");
          const dateA = new Date(`${monthA} 1, ${yearA}`);
          const dateB = new Date(`${monthB} 1, ${yearB}`);
          return dateA - dateB;
        });
        labels = monthKeys;
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
          exercise: 0, // ✅ ADD
          meditation: 0,
          nevillegoddard: 0,
          expression: 0,
        };
      }

      return {
        ...groups[label],
        coding: +groups[label].coding.toFixed(1), // ✅ SUM - not average
        post: +groups[label].post.toFixed(1), // ✅ SUM - not average
        bookPage: +groups[label].bookPage.toFixed(1), // ✅ SUM - not average
        exercise: +groups[label].exercise.toFixed(1), // ✅ SUM - not average
        meditation: +groups[label].meditation.toFixed(1),
        nevillegoddard: +groups[label].nevillegoddard.toFixed(1),
        expression: +groups[label].expression.toFixed(1),
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
        daysWithData: 0,
        totalDays: 0,
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
        daysWithData: 0,
        totalDays: 0,
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
        exercise: acc.exercise + safeNumber(entry.exercise), // ✅ ADD
        meditation: acc.meditation + safeNumber(entry.meditation),
        nevillegoddard: acc.nevillegoddard + safeNumber(entry.nevillegoddard),
        expression: acc.expression + safeNumber(entry.expression),
        count: acc.count + 1,
      }),
      {
        revenue: 0,
        leads: 0,
        clients: 0,
        coding: 0,
        post: 0,
        bookPage: 0,
        exercise: 0, // ✅ ADD
        meditation: 0,
        nevillegoddard: 0,
        expression: 0,
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

    const uniqueDays = new Set(
      validEntries.map((e) => new Date(e.date).toDateString()),
    );
    const daysWithData = uniqueDays.size;

    let totalDays = 0;
    if (timeRange === "today") {
      totalDays = 1;
    } else if (timeRange === "week") {
      totalDays = 7;
    } else if (timeRange === "month") {
      totalDays = 30;
    } else if (timeRange === "thisMonth") {
      const today = new Date();
      totalDays = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0,
      ).getDate();
    } else if (timeRange === "quarter") {
      totalDays = 90;
    } else if (timeRange === "sixMonths") {
      totalDays = 180;
    } else if (timeRange === "year") {
      totalDays = 365;
    } else if (timeRange === "thisYear") {
      const today = new Date();
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const diffTime = today - startOfYear;
      totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    } else if (timeRange === "myYear") {
      const sortedEntries = [...filteredEntries]
        .filter((entry) => entry && entry.date)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      if (sortedEntries.length > 0) {
        const firstDate = new Date(sortedEntries[0].date);
        const endDate = new Date(firstDate);
        endDate.setFullYear(endDate.getFullYear() + 1);
        const diffTime = endDate - firstDate;
        totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      } else {
        totalDays = 365;
      }
    } else {
      totalDays = daysWithData;
    }

    return {
      totalRevenue: totals.revenue,
      totalLeads: totals.leads,
      totalClients: totals.clients,
      highestRevenue,
      totalPost: totals.post,
      totalCoding: totals.coding,
      totalbookPage: totals.bookPage,
      totalExercise: totals.exercise, // ✅ ADD
      totalMeditation: totals.meditation,
      totalNevillegoddard: totals.nevillegoddard,
      totalExpression: totals.expression,
      bestDay,
      daysWithData,
      totalDays,
    };
  }, [filteredEntries, timeRange]);

  // ==========================
  // Goal Tracking - Time Range Aware
  // ==========================
  const goalProgress = useMemo(() => {
    if (!Array.isArray(filteredEntries) || filteredEntries.length === 0) {
      return {
        pagesGoal: { achieved: 0, target: 0, progress: 0, label: "" },
        codingGoal: { achieved: 0, target: 0, progress: 0, label: "" },
        exerciseGoal: { achieved: 0, target: 0, progress: 0, label: "" },
        meditationGoal: { achieved: 0, target: 0, progress: 0, label: "" },
        nevillegoddardGoal: { achieved: 0, target: 0, progress: 0, label: "" },
        expressionGoal: { achieved: 0, target: 0, progress: 0, label: "" },
        postsGoal: { achieved: 0, target: 0, progress: 0, label: "" },
        meetingsGoal: { achieved: 0, target: 0, progress: 0, label: "" },
        leadsGoal: { achieved: 0, target: 0, progress: 0, label: "" },
        revenueGoal: { achieved: 0, target: 0, progress: 0, label: "" },
        clientsGoal: { achieved: 0, target: 0, progress: 0, label: "" },
        contentGoal: { achieved: 0, target: 0, progress: 0, label: "" },
        consistency: { daysLogged: 0, targetDays: 0, progress: 0, label: "" },
      };
    }

    const validEntries = filteredEntries.filter((entry) => entry && entry.date);
    const daysWithData = new Set(
      validEntries.map((e) => new Date(e.date).toDateString()),
    ).size;

    let daysInRange = 0;
    let weeksInRange = 0;
    let monthsInRange = 0;

    if (timeRange === "today") {
      daysInRange = 1;
      weeksInRange = 0.14;
      monthsInRange = 0.03;
    } else if (timeRange === "week") {
      daysInRange = 7;
      weeksInRange = 1;
      monthsInRange = 0.23;
    } else if (timeRange === "month") {
      daysInRange = 30;
      weeksInRange = 4.28;
      monthsInRange = 1;
    } else if (timeRange === "thisMonth") {
      const today = new Date();
      daysInRange = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0,
      ).getDate();
      weeksInRange = daysInRange / 7;
      monthsInRange = 1;
    } else if (timeRange === "quarter") {
      daysInRange = 90;
      weeksInRange = 12.86;
      monthsInRange = 3;
    } else if (timeRange === "sixMonths") {
      daysInRange = 180;
      weeksInRange = 25.71;
      monthsInRange = 6;
    } else if (timeRange === "year") {
      daysInRange = 365;
      weeksInRange = 52.14;
      monthsInRange = 12;
    } else if (timeRange === "thisYear") {
      const today = new Date();
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const diffTime = today - startOfYear;
      daysInRange = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      weeksInRange = daysInRange / 7;
      monthsInRange = today.getMonth() + 1;
    } else if (timeRange === "myYear") {
      const sortedEntries = [...validEntries]
        .filter((entry) => entry && entry.date)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      if (sortedEntries.length > 0) {
        const firstDate = new Date(sortedEntries[0].date);
        const endDate = new Date(firstDate);
        endDate.setFullYear(endDate.getFullYear() + 1);
        const diffTime = endDate - firstDate;
        daysInRange = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        weeksInRange = daysInRange / 7;
        monthsInRange = daysInRange / 30;
      } else {
        daysInRange = 365;
        weeksInRange = 52.14;
        monthsInRange = 12;
      }
    } else if (timeRange === "all") {
      if (validEntries.length > 0) {
        const firstDate = new Date(validEntries[0].date);
        const lastDate = new Date(validEntries[validEntries.length - 1].date);
        const diffTime = Math.abs(lastDate - firstDate);
        daysInRange = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        weeksInRange = daysInRange / 7;
        monthsInRange = daysInRange / 30;
      } else {
        daysInRange = 30;
        weeksInRange = 4.28;
        monthsInRange = 1;
      }
    } else {
      daysInRange = 30;
      weeksInRange = 4.28;
      monthsInRange = 1;
    }

    const totals = validEntries.reduce(
      (acc, entry) => ({
        revenue: acc.revenue + safeNumber(entry.revenue),
        leads: acc.leads + safeNumber(entry.leads),
        clients: acc.clients + safeNumber(entry.clients),
        coding: acc.coding + safeNumber(entry.coding),
        post: acc.post + safeNumber(entry.post),
        bookPage: acc.bookPage + safeNumber(entry.bookPage),
        exercise: acc.exercise + safeNumber(entry.exercise), // ✅ FIXED - adds to accumulator
        meditation: acc.meditation + safeNumber(entry.meditation),
        nevillegoddard: acc.nevillegoddard + safeNumber(entry.nevillegoddard),
        expression: acc.expression + safeNumber(entry.expression),
        meetings: safeNumber(entry.meetings) || 0,
        content: safeNumber(entry.content) || 0,
      }),
      {
        revenue: 0,
        leads: 0,
        clients: 0,
        coding: 0,
        post: 0,
        bookPage: 0,
        exercise: 0,
        meditation: 0,
        nevillegoddard: 0,
        expression: 0,
        meetings: 0,
        content: 0,
      },
    );

    const pageTarget = Math.round(GOALS.daily.pages * daysInRange);
    const codingTarget = Math.round(GOALS.daily.coding * daysInRange * 10) / 10;
    const exerciseTarget = Math.round(GOALS.daily.exercise * daysInRange);
    const meditationTarget = Math.round(GOALS.daily.meditation * daysInRange);
    const nevillegoddardTarget = Math.round(
      GOALS.daily.nevillegoddard * daysInRange,
    );
    const expressionTarget = Math.round(GOALS.daily.expression * daysInRange);
    const postsTarget = Math.round(GOALS.weekly.posts * weeksInRange);
    const meetingsTarget = Math.round(GOALS.weekly.meetings * weeksInRange);
    const leadsTarget = Math.round(GOALS.monthly.leads * monthsInRange);
    const revenueTarget = Math.round(GOALS.monthly.revenue * monthsInRange);
    const clientsTarget = Math.round(GOALS.monthly.clients * monthsInRange);
    const contentTarget = Math.round(GOALS.monthly.content * monthsInRange);

    const calculateProgress = (achieved, target) => {
      if (target === 0) return 0;
      return Math.min(100, Math.round((achieved / target) * 100));
    };

    const getTimeLabel = (baseLabel) => {
      if (timeRange === "today") return `${baseLabel} (Today)`;
      if (timeRange === "week") return `${baseLabel} (Week)`;
      if (timeRange === "month") return `${baseLabel} (30 Days)`;
      if (timeRange === "thisMonth") return `${baseLabel} (This Month)`;
      if (timeRange === "quarter") return `${baseLabel} (Quarter)`;
      if (timeRange === "sixMonths") return `${baseLabel} (6 Months)`;
      if (timeRange === "year") return `${baseLabel} (Year)`;
      if (timeRange === "thisYear") return `${baseLabel} (This Year)`;
      if (timeRange === "myYear") return `${baseLabel} (My Year)`;
      if (timeRange === "all") return `${baseLabel} (All Time)`;
      return baseLabel;
    };

    return {
      pagesGoal: {
        achieved: totals.bookPage,
        target: pageTarget,
        progress: calculateProgress(totals.bookPage, pageTarget),
        label: getTimeLabel("📖 Reading"),
      },
      codingGoal: {
        achieved: Math.round(totals.coding * 10) / 10,
        target: codingTarget,
        progress: calculateProgress(totals.coding, codingTarget),
        label: getTimeLabel("💻 Coding"),
      },
      exerciseGoal: {
        achieved: totals.exercise,
        target: exerciseTarget,
        progress: calculateProgress(totals.exercise, exerciseTarget),
        label: getTimeLabel("🏋️ Exercise"),
      },
      meditationGoal: {
        achieved: totals.meditation, // ✅ FIXED - was totals.meditation
        target: meditationTarget,
        progress: calculateProgress(totals.meditation, meditationTarget),
        label: getTimeLabel("🧘 Meditation"),
      },
      nevillegoddardGoal: {
        achieved: totals.nevillegoddard, // ✅ FIXED - was totals.meditation
        target: nevillegoddardTarget,
        progress: calculateProgress(
          totals.nevillegoddard,
          nevillegoddardTarget,
        ),
        label: getTimeLabel("🧘 nevillegoddard"),
      },
      expressionGoal: {
        achieved: totals.expression, // ✅ FIXED - was totals.meditation
        target: expressionTarget,
        progress: calculateProgress(totals.expression, expressionTarget),
        label: getTimeLabel("🧘 expression"),
      },
      postsGoal: {
        achieved: totals.post,
        target: postsTarget,
        progress: calculateProgress(totals.post, postsTarget),
        label: getTimeLabel("📱 Posts"),
      },
      meetingsGoal: {
        achieved: totals.meetings,
        target: meetingsTarget,
        progress: calculateProgress(totals.meetings, meetingsTarget),
        label: getTimeLabel("🤝 Meetings"),
      },
      leadsGoal: {
        achieved: totals.leads,
        target: leadsTarget,
        progress: calculateProgress(totals.leads, leadsTarget),
        label: getTimeLabel("📊 Leads"),
      },
      revenueGoal: {
        achieved: totals.revenue,
        target: revenueTarget,
        progress: calculateProgress(totals.revenue, revenueTarget),
        label: getTimeLabel("💰 Revenue"),
      },
      clientsGoal: {
        achieved: totals.clients,
        target: clientsTarget,
        progress: calculateProgress(totals.clients, clientsTarget),
        label: getTimeLabel("👥 Clients"),
      },
      contentGoal: {
        achieved: totals.content,
        target: contentTarget,
        progress: calculateProgress(totals.content, contentTarget),
        label: getTimeLabel("✍️ Content"),
      },
      consistency: {
        daysLogged: daysWithData,
        targetDays: Math.round(daysInRange),
        progress: calculateProgress(daysWithData, Math.max(1, daysInRange)),
        label: getTimeLabel("📅 Consistency"),
      },
    };
  }, [filteredEntries, timeRange]);

  // ==========================
  // Streak Calculation
  // ==========================
  const streak = useMemo(() => {
    if (!entries || entries.length === 0) return 0;
    return getStreak(entries);
  }, [entries]);

  // ==========================
  // Achievement Badges
  // ==========================
  const earnedBadges = useMemo(() => {
    if (!entries || entries.length === 0) return [];
    return BADGES.filter((badge) => badge.condition(entries));
  }, [entries]);

  // ==========================
  // Progress Summary
  // ==========================
  const progressSummary = useMemo(() => {
    if (!entries || entries.length === 0) {
      return { totalGoals: 0, achieved: 0, progress: 0 };
    }

    const goals = [
      {
        achieved: goalProgress.pagesGoal.achieved,
        target: goalProgress.pagesGoal.target,
      },
      {
        achieved: goalProgress.codingGoal.achieved,
        target: goalProgress.codingGoal.target,
      },
      {
        achieved: goalProgress.postsGoal.achieved,
        target: goalProgress.postsGoal.target,
      },
      {
        achieved: goalProgress.leadsGoal.achieved,
        target: goalProgress.leadsGoal.target,
      },
      {
        achieved: goalProgress.revenueGoal.achieved,
        target: goalProgress.revenueGoal.target,
      },
      {
        achieved: goalProgress.clientsGoal.achieved,
        target: goalProgress.clientsGoal.target,
      },
    ];

    const total = goals.length;
    const achieved = goals.filter(
      (g) => g.target > 0 && g.achieved >= g.target,
    ).length;
    const progress = total > 0 ? Math.round((achieved / total) * 100) : 0;

    return { totalGoals: total, achieved, progress };
  }, [goalProgress]);

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
        "exercise", // ✅ ADD
        "meditation", // ✅ ADD
        "nevillegoddard",
        "expression",
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
            safeNumber(entry.exercise), // ✅ ADD
            safeNumber(entry.meditation), // ✅ ADD
            safeNumber(entry.nevillegoddard),
            safeNumber(entry.expression),
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
      <div className="max-w-7xl mx-auto p-6 animate-pulse">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 mb-10">
          <div>
            <div className="h-12 w-56 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
            <div className="h-6 w-80 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 shadow-sm">
            {RANGES.map((range) => (
              <div
                key={range.value}
                className="px-5 py-3 rounded-lg w-14 h-12 bg-gray-200 dark:bg-gray-700 mx-0.5"
              ></div>
            ))}
          </div>
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-28 bg-gray-200 dark:bg-gray-700 rounded-xl"
            ></div>
          ))}
        </div>
        <div className="grid xl:grid-cols-2 gap-8 my-12">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-72 bg-gray-200 dark:bg-gray-700 rounded-xl"
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
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 mb-10">
        <div>
          <h1 className="text-5xl font-bold">📊 Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-3 text-lg">
            View your business performance across different time periods.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={exportData}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors text-base font-medium shadow-sm"
            disabled={
              !Array.isArray(filteredEntries) || filteredEntries.length === 0
            }
          >
            📥 Export CSV
          </button>

          <button
            onClick={fetchEntries}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors text-base font-medium shadow-sm"
          >
            🔄 Refresh
          </button>

          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1.5 shadow-sm flex-wrap">
            {RANGES.map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`
                  px-5 py-2.5 rounded-lg font-medium transition-all text-base
                  ${
                    timeRange === range.value
                      ? "bg-white dark:bg-slate-700 shadow-md text-blue-600 dark:text-blue-400"
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

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-xl mb-6 flex justify-between items-center">
          <span className="text-base">{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-200 text-2xl font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Info Bar */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <p className="text-gray-500 dark:text-gray-400 text-base">
          Showing analytics for
          <span className="font-semibold ml-2 text-gray-700 dark:text-gray-300">
            {RANGES.find((r) => r.value === timeRange)?.full || "All Time"}
          </span>
        </p>

        <div className="flex items-center gap-6">
          <span className="text-gray-500 dark:text-gray-400 text-base">
            {Array.isArray(filteredEntries) ? filteredEntries.length : 0}{" "}
            Entries
          </span>

          <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={() => setAutoRefresh(!autoRefresh)}
              className="rounded w-4 h-4"
            />
            Auto-refresh
          </label>
        </div>
      </div>

      {/* ====== PROGRESS SUMMARY ====== */}
      {entries.length > 0 && (
        <div className="mb-6 rounded-2xl border p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">📊 Progress Summary</h3>
              <p className="text-base text-gray-500">
                {progressSummary.achieved} of {progressSummary.totalGoals} goals
                achieved
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                  {progressSummary.progress}%
                </div>
                <div className="text-sm text-gray-500">Overall Progress</div>
              </div>
              <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                <div
                  className="h-4 rounded-full bg-indigo-600 dark:bg-indigo-400 transition-all duration-500"
                  style={{ width: `${progressSummary.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====== STREAK COUNTER ====== */}
      {entries.length > 0 && (
        <div className="mb-6 rounded-2xl border-2 p-6 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">🔥 Streak</h3>
              <p className="text-base text-gray-500">
                {streak === 0
                  ? "😴 No active streak. Start logging daily to build one!"
                  : streak === 1
                    ? "🌟 You're starting a new streak! Keep going!"
                    : streak < 7
                      ? `🔥 ${streak} day streak! Keep the momentum going!`
                      : `🔥 ${streak} day streak! You're on fire!`}
              </p>
            </div>
            <div className="text-5xl font-bold text-orange-500">
              {streak} {streak === 1 ? "day" : "days"}
            </div>
          </div>
          {streak === 0 && (
            <div className="mt-3 text-sm text-gray-400">
              💡 Tip: Log an entry today to start your streak!
            </div>
          )}
        </div>
      )}

      {/* ====== ACHIEVEMENT BADGES ====== */}
      {earnedBadges.length > 0 && (
        <div className="mb-6 rounded-2xl border p-6 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 shadow-sm">
          <h3 className="text-xl font-bold mb-4">🏅 Achievements</h3>
          <div className="flex flex-wrap gap-3">
            {earnedBadges.map((badge) => (
              <div
                key={badge.id}
                className="group relative flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-yellow-200 dark:border-yellow-800 hover:shadow-md transition-shadow"
                title={badge.label}
              >
                <span className="text-2xl">{badge.icon}</span>
                <span className="text-base font-medium">{badge.label}</span>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-sm rounded-lg py-1.5 px-3 whitespace-nowrap z-10 shadow-lg">
                  {badge.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ====== GOALS SECTION ====== */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-6">
          🎯 Goals
          <span className="text-base font-normal text-gray-500 ml-3">
            ({RANGES.find((r) => r.value === timeRange)?.full || "All Time"})
          </span>
        </h2>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Pages Goal */}
          <div className="group relative border-2 rounded-2xl p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center mb-3">
              <span className="text-lg font-semibold">
                {goalProgress.pagesGoal.label}
              </span>
              <span className="text-base text-gray-500">
                {goalProgress.pagesGoal.achieved} /{" "}
                {goalProgress.pagesGoal.target} pages
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all duration-700 ${
                  goalProgress.pagesGoal.progress >= 100
                    ? "bg-green-500"
                    : "bg-blue-500"
                }`}
                style={{ width: `${goalProgress.pagesGoal.progress}%` }}
              ></div>
            </div>
            <p className="text-base mt-2 text-gray-500">
              {goalProgress.pagesGoal.progress >= 100
                ? "✅ Goal Achieved! Amazing!"
                : goalProgress.pagesGoal.achieved === 0
                  ? "📖 Start reading today!"
                  : `${goalProgress.pagesGoal.progress}% of goal`}
            </p>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-sm rounded-lg py-1.5 px-3 whitespace-nowrap z-10 shadow-lg">
              Read {GOALS.daily.pages} pages daily
            </div>
          </div>

          {/* Coding Goal */}
          <div className="group relative border-2 rounded-2xl p-5 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-900 dark:to-purple-950 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center mb-3">
              <span className="text-lg font-semibold">
                {goalProgress.codingGoal.label}
              </span>
              <span className="text-base text-gray-500">
                {goalProgress.codingGoal.achieved} /{" "}
                {goalProgress.codingGoal.target} hrs
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all duration-700 ${
                  goalProgress.codingGoal.progress >= 100
                    ? "bg-green-500"
                    : "bg-purple-500"
                }`}
                style={{ width: `${goalProgress.codingGoal.progress}%` }}
              ></div>
            </div>
            <p className="text-base mt-2 text-gray-500">
              {goalProgress.codingGoal.progress >= 100
                ? "✅ Goal Achieved! Great work!"
                : goalProgress.codingGoal.achieved === 0
                  ? "💻 Start coding now!"
                  : `${goalProgress.codingGoal.progress}% of goal`}
            </p>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-sm rounded-lg py-1.5 px-3 whitespace-nowrap z-10 shadow-lg">
              Code {GOALS.daily.coding} hours daily
            </div>
          </div>

          {/* Exercise Goal */}
          <div className="group relative border-2 rounded-2xl p-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-900 dark:to-emerald-950 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center mb-3">
              <span className="text-lg font-semibold">
                {goalProgress.exerciseGoal.label}
              </span>
              <span className="text-base text-gray-500">
                {goalProgress.exerciseGoal.achieved} /{" "}
                {goalProgress.exerciseGoal.target} min
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all duration-700 ${
                  goalProgress.exerciseGoal.progress >= 100
                    ? "bg-green-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${goalProgress.exerciseGoal.progress}%` }}
              ></div>
            </div>
            <p className="text-base mt-2 text-gray-500">
              {goalProgress.exerciseGoal.progress >= 100
                ? "✅ Goal Achieved! Keep it up!"
                : goalProgress.exerciseGoal.achieved === 0
                  ? "🏋️ Time to move!"
                  : `${goalProgress.exerciseGoal.progress}% of goal`}
            </p>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-sm rounded-lg py-1.5 px-3 whitespace-nowrap z-10 shadow-lg">
              Exercise {GOALS.daily.exercise} minutes daily
            </div>
          </div>

          {/* Meditation Goal */}
          <div className="group relative border-2 rounded-2xl p-5 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-slate-900 dark:to-cyan-950 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center mb-3">
              <span className="text-lg font-semibold">
                {goalProgress.meditationGoal.label}
              </span>
              <span className="text-base text-gray-500">
                {goalProgress.meditationGoal.achieved} /{" "}
                {goalProgress.meditationGoal.target} min
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all duration-700 ${
                  goalProgress.meditationGoal.progress >= 100
                    ? "bg-green-500"
                    : "bg-teal-500"
                }`}
                style={{ width: `${goalProgress.meditationGoal.progress}%` }}
              ></div>
            </div>
            <p className="text-base mt-2 text-gray-500">
              {goalProgress.meditationGoal.progress >= 100
                ? "✅ Goal Achieved! Peaceful!"
                : goalProgress.meditationGoal.achieved === 0
                  ? "🧘 Take a moment to breathe"
                  : `${goalProgress.meditationGoal.progress}% of goal`}
            </p>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-sm rounded-lg py-1.5 px-3 whitespace-nowrap z-10 shadow-lg">
              meditation {GOALS.daily.meditation} minutes daily
            </div>
          </div>
          {/* NEVILLE */}
          <div className="group relative border-2 rounded-2xl p-5 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-slate-900 dark:to-cyan-950 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center mb-3">
              <span className="text-lg font-semibold">
                {goalProgress.nevillegoddardGoal.label}
              </span>
              <span className="text-base text-gray-500">
                {goalProgress.nevillegoddardGoal.achieved} /{" "}
                {goalProgress.nevillegoddardGoal.target} min
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all duration-700 ${
                  goalProgress.nevillegoddardGoal.progress >= 100
                    ? "bg-green-500"
                    : "bg-teal-500"
                }`}
                style={{
                  width: `${goalProgress.nevillegoddardGoal.progress}%`,
                }}
              ></div>
            </div>
            <p className="text-base mt-2 text-gray-500">
              {goalProgress.nevillegoddardGoal.progress >= 100
                ? "✅ Goal Achieved! Peaceful!"
                : goalProgress.nevillegoddardGoal.achieved === 0
                  ? "🧘 Take a moment to breathe"
                  : `${goalProgress.nevillegoddardGoal.progress}% of goal`}
            </p>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-sm rounded-lg py-1.5 px-3 whitespace-nowrap z-10 shadow-lg">
              nevillegoddard {GOALS.daily.nevillegoddard} minutes daily
            </div>
          </div>
          {/* EXPRESSION */}
          <div className="group relative border-2 rounded-2xl p-5 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-slate-900 dark:to-cyan-950 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center mb-3">
              <span className="text-lg font-semibold">
                {goalProgress.expressionGoal.label}
              </span>
              <span className="text-base text-gray-500">
                {goalProgress.expressionGoal.achieved} /{" "}
                {goalProgress.expressionGoal.target} min
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all duration-700 ${
                  goalProgress.expressionGoal.progress >= 100
                    ? "bg-green-500"
                    : "bg-teal-500"
                }`}
                style={{
                  width: `${goalProgress.expressionGoal.progress}%`,
                }}
              ></div>
            </div>
            <p className="text-base mt-2 text-gray-500">
              {goalProgress.expressionGoal.progress >= 100
                ? "✅ Goal Achieved! Peaceful!"
                : goalProgress.expressionGoal.achieved === 0
                  ? "🧘 Take a moment to breathe"
                  : `${goalProgress.expressionGoal.progress}% of goal`}
            </p>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-sm rounded-lg py-1.5 px-3 whitespace-nowrap z-10 shadow-lg">
              expression {GOALS.daily.expression} minutes daily
            </div>
          </div>
          {/* Posts Goal */}
          <div className="group relative border-2 rounded-2xl p-5 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-slate-900 dark:to-emerald-950 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center mb-3">
              <span className="text-lg font-semibold">
                {goalProgress.postsGoal.label}
              </span>
              <span className="text-base text-gray-500">
                {goalProgress.postsGoal.achieved} /{" "}
                {goalProgress.postsGoal.target} posts
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all duration-700 ${
                  goalProgress.postsGoal.progress >= 100
                    ? "bg-green-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${goalProgress.postsGoal.progress}%` }}
              ></div>
            </div>
            <p className="text-base mt-2 text-gray-500">
              {goalProgress.postsGoal.progress >= 100
                ? "✅ Goal Achieved! Social butterfly!"
                : goalProgress.postsGoal.achieved === 0
                  ? "📱 Share something today"
                  : `${goalProgress.postsGoal.progress}% of goal`}
            </p>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-sm rounded-lg py-1.5 px-3 whitespace-nowrap z-10 shadow-lg">
              Post {GOALS.weekly.posts} times weekly
            </div>
          </div>

          {/* Meetings Goal */}
          <div className="group relative border-2 rounded-2xl p-5 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-slate-900 dark:to-amber-950 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center mb-3">
              <span className="text-lg font-semibold">
                {goalProgress.meetingsGoal.label}
              </span>
              <span className="text-base text-gray-500">
                {goalProgress.meetingsGoal.achieved} /{" "}
                {goalProgress.meetingsGoal.target} meetings
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all duration-700 ${
                  goalProgress.meetingsGoal.progress >= 100
                    ? "bg-green-500"
                    : "bg-amber-500"
                }`}
                style={{ width: `${goalProgress.meetingsGoal.progress}%` }}
              ></div>
            </div>
            <p className="text-base mt-2 text-gray-500">
              {goalProgress.meetingsGoal.progress >= 100
                ? "✅ Goal Achieved! Great networking!"
                : goalProgress.meetingsGoal.achieved === 0
                  ? "🤝 Schedule a meeting"
                  : `${goalProgress.meetingsGoal.progress}% of goal`}
            </p>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-sm rounded-lg py-1.5 px-3 whitespace-nowrap z-10 shadow-lg">
              {GOALS.weekly.meetings} client meetings weekly
            </div>
          </div>

          {/* Leads Goal */}
          <div className="group relative border-2 rounded-2xl p-5 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-slate-900 dark:to-amber-950 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center mb-3">
              <span className="text-lg font-semibold">
                {goalProgress.leadsGoal.label}
              </span>
              <span className="text-base text-gray-500">
                {goalProgress.leadsGoal.achieved} /{" "}
                {goalProgress.leadsGoal.target} leads
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all duration-700 ${
                  goalProgress.leadsGoal.progress >= 100
                    ? "bg-green-500"
                    : "bg-yellow-500"
                }`}
                style={{ width: `${goalProgress.leadsGoal.progress}%` }}
              ></div>
            </div>
            <p className="text-base mt-2 text-gray-500">
              {goalProgress.leadsGoal.progress >= 100
                ? "✅ Goal Achieved! Leads flowing!"
                : goalProgress.leadsGoal.achieved === 0
                  ? "📊 Generate some leads"
                  : `${goalProgress.leadsGoal.progress}% of goal`}
            </p>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-sm rounded-lg py-1.5 px-3 whitespace-nowrap z-10 shadow-lg">
              {GOALS.monthly.leads} leads monthly
            </div>
          </div>

          {/* Revenue Goal */}
          <div className="group relative border-2 rounded-2xl p-5 bg-gradient-to-r from-red-50 to-rose-50 dark:from-slate-900 dark:to-rose-950 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center mb-3">
              <span className="text-lg font-semibold">
                {goalProgress.revenueGoal.label}
              </span>
              <span className="text-base text-gray-500">
                ₹{goalProgress.revenueGoal.achieved} / ₹
                {goalProgress.revenueGoal.target}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all duration-700 ${
                  goalProgress.revenueGoal.progress >= 100
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${goalProgress.revenueGoal.progress}%` }}
              ></div>
            </div>
            <p className="text-base mt-2 text-gray-500">
              {goalProgress.revenueGoal.progress >= 100
                ? "✅ Goal Achieved! Money maker!"
                : goalProgress.revenueGoal.achieved === 0
                  ? "💰 Start earning today"
                  : `${goalProgress.revenueGoal.progress}% of goal`}
            </p>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-sm rounded-lg py-1.5 px-3 whitespace-nowrap z-10 shadow-lg">
              ₹{GOALS.monthly.revenue} monthly revenue
            </div>
          </div>

          {/* Clients Goal */}
          <div className="group relative border-2 rounded-2xl p-5 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-slate-900 dark:to-cyan-950 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center mb-3">
              <span className="text-lg font-semibold">
                {goalProgress.clientsGoal.label}
              </span>
              <span className="text-base text-gray-500">
                {goalProgress.clientsGoal.achieved} /{" "}
                {goalProgress.clientsGoal.target} clients
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all duration-700 ${
                  goalProgress.clientsGoal.progress >= 100
                    ? "bg-green-500"
                    : "bg-teal-500"
                }`}
                style={{ width: `${goalProgress.clientsGoal.progress}%` }}
              ></div>
            </div>
            <p className="text-base mt-2 text-gray-500">
              {goalProgress.clientsGoal.progress >= 100
                ? "✅ Goal Achieved! Client magnet!"
                : goalProgress.clientsGoal.achieved === 0
                  ? "👥 Get your first client"
                  : `${goalProgress.clientsGoal.progress}% of goal`}
            </p>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-sm rounded-lg py-1.5 px-3 whitespace-nowrap z-10 shadow-lg">
              {GOALS.monthly.clients} new clients monthly
            </div>
          </div>

          {/* Content Goal */}
          <div className="group relative border-2 rounded-2xl p-5 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-slate-900 dark:to-violet-950 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-center mb-3">
              <span className="text-lg font-semibold">
                {goalProgress.contentGoal.label}
              </span>
              <span className="text-base text-gray-500">
                {goalProgress.contentGoal.achieved} /{" "}
                {goalProgress.contentGoal.target} pieces
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all duration-700 ${
                  goalProgress.contentGoal.progress >= 100
                    ? "bg-green-500"
                    : "bg-violet-500"
                }`}
                style={{ width: `${goalProgress.contentGoal.progress}%` }}
              ></div>
            </div>
            <p className="text-base mt-2 text-gray-500">
              {goalProgress.contentGoal.progress >= 100
                ? "✅ Goal Achieved! Content creator!"
                : goalProgress.contentGoal.achieved === 0
                  ? "✍️ Write your first piece"
                  : `${goalProgress.contentGoal.progress}% of goal`}
            </p>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-sm rounded-lg py-1.5 px-3 whitespace-nowrap z-10 shadow-lg">
              {GOALS.monthly.content} content pieces monthly
            </div>
          </div>
        </div>

        {/* Consistency Goal */}
        <div className="mt-6 border-2 rounded-2xl p-6 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-slate-800 dark:to-slate-900 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-semibold">
              {goalProgress.consistency.label}
            </span>
            <span className="text-base text-gray-500">
              {goalProgress.consistency.daysLogged} /{" "}
              {goalProgress.consistency.targetDays} days
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all duration-700 ${
                goalProgress.consistency.progress >= 80
                  ? "bg-green-500"
                  : goalProgress.consistency.progress >= 50
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
              style={{ width: `${goalProgress.consistency.progress}%` }}
            ></div>
          </div>
          <p className="text-base mt-2 text-gray-500">
            {goalProgress.consistency.daysLogged === 0
              ? "📅 Start tracking today!"
              : goalProgress.consistency.progress >= 80
                ? "🔥 Great consistency! You're on fire!"
                : goalProgress.consistency.progress >= 50
                  ? "💪 Keep going! You're doing great!"
                  : "📈 Try to be more consistent"}
          </p>
        </div>
      </div>

      {/* Stat Cards */}
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
          title="Total Exercise"
          value={`${metrics.totalExercise} min`}
        />{" "}
        {/* ✅ ADD */}
        <StatCard
          title="Total Meditation"
          value={`${metrics.totalMeditation} min`}
        />{" "}
        <StatCard
          title="Total Manifestation"
          value={`${metrics.totalNevillegoddard} min`}
        />
        <StatCard
          title="Total Expression"
          value={`${metrics.totalExpression} min`}
        />
        {/* ✅ ADD */}
        {timeRange === "today" || timeRange === "week" ? (
          <StatCard title="Pages Read" value={`${metrics.totalbookPage} 📄`} />
        ) : (
          <StatCard
            title="Books Read"
            value={`${getBooksFromPages(metrics.totalbookPage).books} 📚`}
          />
        )}
        <StatCard title="Total Post" value={metrics.totalPost} />
        <StatCard title="Performance" value={`${performanceScore}%`} />
      </div>

      {/* No Data State */}
      {(!Array.isArray(filteredEntries) || filteredEntries.length === 0) && (
        <div className="border-2 rounded-2xl p-12 text-center mb-10">
          <h2 className="text-3xl font-semibold">📭 No data available</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 text-lg">
            There are no entries for the selected period.
          </p>
          <button
            onClick={() => setTimeRange("all")}
            className="mt-6 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors text-base font-medium shadow-sm"
          >
            View All Time
          </button>
        </div>
      )}

      {/* Best Day */}
      {metrics.bestDay &&
        Array.isArray(filteredEntries) &&
        filteredEntries.length > 0 && (
          <div className="mb-10 rounded-2xl border-2 p-6 bg-gradient-to-r from-green-50 to-green-100 dark:from-slate-900 dark:to-slate-800 shadow-sm">
            <h2 className="text-2xl font-bold">🏆 Best Performing Day</h2>
            <p className="mt-3 text-lg">
              <strong>
                {metrics.bestDay.date
                  ? formatDate(metrics.bestDay.date)
                  : "N/A"}
              </strong>
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 mt-6 gap-6">
              <div>
                Revenue
                <h3 className="text-2xl font-bold">
                  ₹{safeNumber(metrics.bestDay.revenue)}
                </h3>
              </div>
              <div>
                Clients
                <h3 className="text-2xl font-bold">
                  {safeNumber(metrics.bestDay.clients)}
                </h3>
              </div>
              <div>
                {timeRange === "today" || timeRange === "week"
                  ? "Pages"
                  : "Coding"}
                <h3 className="text-2xl font-bold">
                  {timeRange === "today" || timeRange === "week"
                    ? safeNumber(metrics.bestDay.bookPage)
                    : safeNumber(metrics.bestDay.coding)}
                </h3>
              </div>
              <div>
                Post
                <h3 className="text-2xl font-bold">
                  {safeNumber(metrics.bestDay.post)}
                </h3>
              </div>
            </div>
          </div>
        )}

      {/* Business Health */}
      {Array.isArray(filteredEntries) && filteredEntries.length > 0 && (
        <BusinessHealth
          businessHealth={trends.businessHealth}
          revenueTrend={trends.revenueTrend}
          codingTrend={trends.codingTrend}
          postTrend={trends.postTrend}
        />
      )}

      {/* Charts */}
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
          <TrendChart
            title="Exercise Trend" // ✅ ADD
            data={chartData}
            dataKey="exercise"
            xAxisKey="label"
          />
          <TrendChart
            title="Meditation Trend" // ✅ ADD
            data={chartData}
            dataKey="meditation"
            xAxisKey="label"
          />
          <TrendChart
            title="Manifestation Trend" // ✅ ADD
            data={chartData}
            dataKey="nevillegoddard"
            xAxisKey="label"
          />
          <TrendChart
            title="Expression Trend" // ✅ ADD
            data={chartData}
            dataKey="expression"
            xAxisKey="label"
          />
          <TrendChart
            title={
              timeRange === "today" || timeRange === "week"
                ? "Pages Read Trend"
                : "Books Read Trend"
            }
            data={chartData}
            dataKey="bookPage"
            xAxisKey="label"
          />
        </div>
      )}

      {/* Recent Entries */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold">📝 Recent Entries</h2>
        <span className="text-gray-500 dark:text-gray-400 text-base">
          Showing{" "}
          {Array.isArray(filteredEntries)
            ? Math.min(filteredEntries.length, ENTRIES_PER_PAGE)
            : 0}{" "}
          of {Array.isArray(filteredEntries) ? filteredEntries.length : 0}
        </span>
      </div>

      {!Array.isArray(entries) || entries.length === 0 ? (
        <div className="text-center py-16 border-2 rounded-2xl">
          <h3 className="text-3xl font-semibold">📝 No Entries Yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-3 text-lg">
            Create your first journal entry.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {paginatedEntries.map((entry) => (
              <div
                key={entry._id || Math.random()}
                className="border-2 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {editingEntry === entry._id ? (
                  // Edit Mode
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold">✏️ Edit Entry</h3>
                      <div className="flex gap-3">
                        <button
                          onClick={cancelEdit}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2.5 rounded-xl transition-colors text-base"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveEdit(entry._id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl transition-colors text-base"
                        >
                          💾 Save
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium block mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={editFormData?.date || ""}
                          onChange={handleEditChange}
                          className="w-full p-3 border-2 rounded-xl text-base"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-1">
                          Revenue
                        </label>
                        <input
                          type="number"
                          name="revenue"
                          value={editFormData?.revenue || 0}
                          onChange={handleEditChange}
                          className="w-full p-3 border-2 rounded-xl text-base"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-1">
                          Leads
                        </label>
                        <input
                          type="number"
                          name="leads"
                          value={editFormData?.leads || 0}
                          onChange={handleEditChange}
                          className="w-full p-3 border-2 rounded-xl text-base"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-1">
                          Clients
                        </label>
                        <input
                          type="number"
                          name="clients"
                          value={editFormData?.clients || 0}
                          onChange={handleEditChange}
                          className="w-full p-3 border-2 rounded-xl text-base"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-1">
                          Coding (hrs)
                        </label>
                        <input
                          type="number"
                          name="coding"
                          value={editFormData?.coding || 0}
                          onChange={handleEditChange}
                          className="w-full p-3 border-2 rounded-xl text-base"
                          step="0.5"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-1">
                          Post
                        </label>
                        <input
                          type="number"
                          name="post"
                          value={editFormData?.post || 0}
                          onChange={handleEditChange}
                          className="w-full p-3 border-2 rounded-xl text-base"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-1">
                          Pages Read
                        </label>
                        <input
                          type="number"
                          name="bookPage"
                          value={editFormData?.bookPage || 0}
                          onChange={handleEditChange}
                          className="w-full p-3 border-2 rounded-xl text-base"
                        />
                      </div>
                      {/* Add after the Pages Read field */}
                      <div>
                        <label className="text-sm font-medium block mb-1">
                          Exercise (min)
                        </label>
                        <input
                          type="number"
                          name="exercise"
                          value={editFormData?.exercise || 0}
                          onChange={handleEditChange}
                          className="w-full p-3 border-2 rounded-xl text-base"
                          min="0"
                          max="300"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-1">
                          Meditation (min)
                        </label>
                        <input
                          type="number"
                          name="meditation"
                          value={editFormData?.meditation || 0}
                          onChange={handleEditChange}
                          className="w-full p-3 border-2 rounded-xl text-base"
                          min="0"
                          max="120"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-1">
                          Manifestation (min)
                        </label>
                        <input
                          type="number"
                          name="nevillegoddard"
                          value={editFormData?.nevillegoddard || 0}
                          onChange={handleEditChange}
                          className="w-full p-3 border-2 rounded-xl text-base"
                          min="0"
                          max="120"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-1">
                          Expression (min)
                        </label>
                        <input
                          type="number"
                          name="expression"
                          value={editFormData?.expression || 0}
                          onChange={handleEditChange}
                          className="w-full p-3 border-2 rounded-xl text-base"
                          min="0"
                          max="120"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm font-medium block mb-1">
                          Note
                        </label>
                        <textarea
                          name="note"
                          value={editFormData?.note || ""}
                          onChange={handleEditChange}
                          className="w-full p-3 border-2 rounded-xl text-base"
                          rows="2"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold">
                        📅{" "}
                        {entry.date ? formatDate(entry.date) : "Invalid Date"}
                      </h3>
                      <div className="flex gap-3">
                        <button
                          onClick={() => startEdit(entry)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl transition-colors text-base"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => deleteEntry(entry._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl transition-colors text-base"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-base">
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
                        <strong>Coding:</strong> {safeNumber(entry.coding)} hrs
                      </p>
                      <p>
                        <strong>Post:</strong> {safeNumber(entry.post)}
                      </p>
                      <p>
                        <strong>Pages:</strong> {safeNumber(entry.bookPage)}
                      </p>
                      <p>
                        <strong>Exercise:</strong> {safeNumber(entry.exercise)}{" "}
                        min
                      </p>
                      <p>
                        <strong>Meditation:</strong>{" "}
                        {safeNumber(entry.meditation)} min
                      </p>
                      <p>
                        <strong>Manifestation:</strong>{" "}
                        {safeNumber(entry.nevillegoddard)} min
                      </p>
                      <p>
                        <strong>Expression:</strong>{" "}
                        {safeNumber(entry.expression)} min
                      </p>
                    </div>

                    <div className="mt-4">
                      <strong className="text-base">📝 Note</strong>
                      <p className="mt-2 text-gray-600 dark:text-gray-400 text-base">
                        {entry.note || "No notes"}
                      </p>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-8">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-6 py-3 border-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-base font-medium"
              >
                ⬅️ Previous
              </button>
              <span className="px-5 py-3 text-base font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-6 py-3 border-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-base font-medium"
              >
                Next ➡️
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
