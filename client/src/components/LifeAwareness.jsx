import { useState, useEffect, useCallback } from "react";

// ==========================
// Life Expectancy Constants
// ==========================
const LIFE_EXPECTANCY = 50;
const DAYS_IN_YEAR = 365.2422;
const WEEKS_IN_YEAR = 52.1775;
const MONTHS_IN_YEAR = 12;

// ==========================
// Motivational Quotes (Peaceful)
// ==========================
const QUOTES = [
  {
    text: "Everything is predestined, so don't worry - just focus on today.",
    author: "Ancient Wisdom",
  },
  {
    text: "Your life is already written. Your job is not to worry, but to live it beautifully.",
    author: "Unknown",
  },
  {
    text: "Trust the timing of your life. Everything is unfolding exactly as it should.",
    author: "Rumi",
  },
  {
    text: "You have exactly enough time for what matters. Relax into your destiny.",
    author: "Eckhart Tolle",
  },
  {
    text: "The future is not something to fear - it's something to trust. It's already arranged.",
    author: "Neville Goddard",
  },
  {
    text: "Stop counting days and start making days count. The rest is already planned.",
    author: "Marcus Aurelius",
  },
  {
    text: "You didn't arrive here by accident. Every moment has been orchestrated.",
    author: "Unknown",
  },
  {
    text: "The only moment you truly have is now. Use it wisely, and let destiny handle the rest.",
    author: "Buddha",
  },
];

// ==========================
// Life Awareness Component
// ==========================
export default function LifeAwareness() {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [lifeData, setLifeData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // ==========================
  // Calculate Life Data (REAL-TIME)
  // ==========================
  const calculateLifeData = useCallback(() => {
    const now = new Date();

    // ⚠️ UPDATE THIS TO YOUR ACTUAL BIRTH DATE!
    const birthDate = new Date(2000, 5, 30);

    // ====== AGE CALCULATION ======
    const ageInMs = now - birthDate;
    const ageInDays = ageInMs / (1000 * 60 * 60 * 24);
    const ageInYearsDecimal = ageInMs / (1000 * 60 * 60 * 24 * DAYS_IN_YEAR);

    let ageYears = now.getFullYear() - birthDate.getFullYear();
    const monthDiff = now.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && now.getDate() < birthDate.getDate())
    ) {
      ageYears--;
    }

    // ====== TOTAL LIFE EXPECTANCY ======
    const totalDays = LIFE_EXPECTANCY * DAYS_IN_YEAR;
    const totalWeeks = LIFE_EXPECTANCY * WEEKS_IN_YEAR;
    const totalMonths = LIFE_EXPECTANCY * MONTHS_IN_YEAR;

    // ====== TIME REMAINING ======
    const daysRemaining = Math.max(0, totalDays - ageInDays);
    const weeksRemaining = Math.max(0, totalWeeks - ageInDays / 7);
    const monthsRemaining = Math.max(
      0,
      totalMonths - ageInDays / (DAYS_IN_YEAR / 12),
    );
    const yearsRemaining = Math.max(0, LIFE_EXPECTANCY - ageYears);

    // ====== PERCENTAGES ======
    const percentageUsed = Math.min(100, (ageInDays / totalDays) * 100);
    const percentageRemaining = Math.max(0, 100 - percentageUsed);

    // ====== LIFE CHAPTERS ======
    const chapters = [];
    const chapterLength = 10;
    for (let i = 0; i < Math.ceil(LIFE_EXPECTANCY / chapterLength); i++) {
      const start = i * chapterLength;
      const end = Math.min(start + chapterLength, LIFE_EXPECTANCY);
      const isPast = end <= ageYears;
      const isCurrent = start <= ageYears && ageYears < end;
      const isFuture = start > ageYears;

      let label = "";
      if (start === 0) label = "Childhood";
      else if (start === 10) label = "Teenage";
      else if (start === 20) label = "Young Adult";
      else if (start === 30) label = "PreEnd Years";
      else if (start === 40) label = "End-Life";
      else if (start === 50) label = "Wisdom Years";
      else if (start === 60) label = "Golden Years";
      else if (start === 70) label = "Legacy Years";
      else label = `${start}s`;

      chapters.push({
        start,
        end,
        label,
        isPast,
        isCurrent,
        isFuture,
      });
    }

    // ====== LIFE BY NUMBERS ======
    const totalMondays = Math.floor(ageInDays / 7);
    const totalSeasons = Math.floor(ageInDays / 90);
    const totalWeeksLived = Math.floor(ageInDays / 7);
    const totalMonthsLived = Math.floor(ageInDays / 30.44);
    const totalSummerWinters = ageYears;

    // ====== PRECISE AGE ======
    const years = Math.floor(ageInYearsDecimal);
    const months = Math.floor((ageInYearsDecimal - years) * 12);
    const days = Math.floor(
      ((ageInYearsDecimal - years) * 12 - months) * 30.44,
    );
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const preciseAge = `${years}y ${months}m ${days}d ${hours}h ${minutes}m ${seconds}s`;

    return {
      ageYears,
      ageInDays,
      ageInYearsDecimal,
      daysRemaining,
      weeksRemaining,
      monthsRemaining,
      yearsRemaining,
      percentageUsed,
      percentageRemaining,
      chapters,
      totalMondays,
      totalSeasons,
      totalWeeksLived,
      totalMonthsLived,
      totalSummerWinters,
      preciseAge,
    };
  }, []);

  // ==========================
  // Update Life Data Every Second
  // ==========================
  useEffect(() => {
    setLifeData(calculateLifeData());
    setCurrentTime(new Date());

    const interval = setInterval(() => {
      setLifeData(calculateLifeData());
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateLifeData]);

  // ==========================
  // Rotate Quotes Peacefully
  // ==========================
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % QUOTES.length);
    }, 15000);

    return () => clearInterval(quoteInterval);
  }, []);

  // ==========================
  // Get Chapter Emoji
  // ==========================
  const getChapterEmoji = (label) => {
    const map = {
      Childhood: "🧒",
      Teenage: "🧑",
      "Young Adult": "🧑‍💼",
      "PreEnd Years": "☹️",
      "End-Life": "🧘",
      "Wisdom Years": "🦉",
      "Golden Years": "🌟",
      "Legacy Years": "👑",
    };
    return map[label] || "📖";
  };

  // ==========================
  // Loading State
  // ==========================
  if (!lifeData) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-pulse text-gray-500 dark:text-gray-400">
          Loading...
        </div>
      </div>
    );
  }

  // ==========================
  // Render
  // ==========================
  return (
    <div className="space-y-8">
      {/* ====== REAL-TIME CLOCK ====== */}
      <div className="text-center text-sm text-gray-400 dark:text-gray-500">
        🕐 {currentTime.toLocaleString()}
      </div>

      {/* ====== QUOTE SECTION ====== */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-2 p-8 text-center shadow-sm">
        <div className="max-w-3xl mx-auto">
          <p className="text-2xl md:text-3xl font-light italic text-gray-700 dark:text-gray-300 mb-3">
            "{QUOTES[currentQuote].text}"
          </p>
          <p className="text-base text-gray-500 dark:text-gray-400">
            — {QUOTES[currentQuote].author}
          </p>
        </div>
        <div className="flex justify-center gap-2 mt-4">
          {QUOTES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentQuote(i)}
              className={`h-2 w-2 rounded-full transition-all ${
                i === currentQuote
                  ? "bg-indigo-500 w-4"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ====== PRECISE AGE ====== */}
      <div className="rounded-2xl border-2 p-4 text-center bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 shadow-sm">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Your Current Age
        </p>
        <p className="text-2xl font-mono font-bold text-indigo-600 dark:text-indigo-400">
          {lifeData.preciseAge}
        </p>
        <p className="text-xs text-gray-400 mt-1">⏱️ Time passes</p>
      </div>

      {/* ====== MAIN STATS ====== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-2xl border p-6 text-center shadow-sm">
          <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 font-mono">
            {Math.floor(lifeData.daysRemaining).toLocaleString()}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Days Left
          </div>
          <div className="text-xs text-gray-400 mt-2">
            {lifeData.percentageRemaining.toFixed(1)}% remaining
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 rounded-2xl border p-6 text-center shadow-sm">
          <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 font-mono">
            {Math.floor(lifeData.weeksRemaining).toLocaleString()}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Weeks Left
          </div>
          <div className="text-xs text-gray-400 mt-2">
            ~{Math.floor(lifeData.weeksRemaining / 52)} more years
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 rounded-2xl border p-6 text-center shadow-sm">
          <div className="text-4xl font-bold text-green-600 dark:text-green-400 font-mono">
            {Math.floor(lifeData.monthsRemaining).toLocaleString()}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Months Left
          </div>
          <div className="text-xs text-gray-400 mt-2">
            {Math.floor(lifeData.monthsRemaining / 12)} years,{" "}
            {Math.floor(lifeData.monthsRemaining % 12)} months
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30 rounded-2xl border p-6 text-center shadow-sm">
          <div className="text-4xl font-bold text-orange-600 dark:text-orange-400 font-mono">
            {Math.floor(lifeData.yearsRemaining)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Years Left
          </div>
          <div className="text-xs text-gray-400 mt-2">
            Age: {lifeData.ageYears} years
          </div>
        </div>
      </div>

      {/* ====== LIFE PROGRESS BAR ====== */}
      <div className="rounded-2xl border p-6 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <span className="text-base font-semibold text-gray-700 dark:text-gray-300">
            Life Progress
          </span>
          <span className="text-sm text-gray-500">
            {lifeData.percentageUsed.toFixed(1)}% used
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-1000 rounded-full flex items-center justify-end pr-3"
            style={{ width: `${lifeData.percentageUsed}%` }}
          >
            <span className="text-xs text-white font-medium">
              {lifeData.percentageUsed.toFixed(0)}%
            </span>
          </div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>Birth</span>
          <span>Now (Age {lifeData.ageYears})</span>
          <span>Expected ({LIFE_EXPECTANCY} yrs)</span>
        </div>
      </div>

      {/* ====== LIFE CHAPTERS ====== */}
      <div className="rounded-2xl border p-6 bg-white dark:bg-slate-900 shadow-sm">
        <h3 className="text-xl font-bold mb-4">📖 Your Life Chapters</h3>
        <div className="space-y-4">
          {lifeData.chapters.map((chapter, index) => (
            <div key={index} className="relative">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-24 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {chapter.start}-{chapter.end}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-2xl">
                      {getChapterEmoji(chapter.label)}
                    </span>
                    <span
                      className={`font-semibold ${
                        chapter.isCurrent
                          ? "text-indigo-600 dark:text-indigo-400"
                          : chapter.isPast
                            ? "text-gray-700 dark:text-gray-300"
                            : "text-gray-400 dark:text-gray-600"
                      }`}
                    >
                      {chapter.label}
                    </span>
                    {chapter.isCurrent && (
                      <span className="text-xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-medium animate-pulse">
                        ← Here Now
                      </span>
                    )}
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        chapter.isPast
                          ? "bg-green-500"
                          : chapter.isCurrent
                            ? "bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse"
                            : "bg-gray-300 dark:bg-gray-600"
                      }`}
                      style={{
                        width: chapter.isPast
                          ? "100%"
                          : chapter.isCurrent
                            ? `${
                                ((lifeData.ageYears - chapter.start) /
                                  (chapter.end - chapter.start)) *
                                100
                              }%`
                            : "0%",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs text-gray-400 text-center">
          {lifeData.chapters.filter((c) => c.isPast).length} chapters behind •{" "}
          {lifeData.chapters.filter((c) => c.isFuture).length} chapters ahead
        </div>
      </div>

      {/* ====== LIFE BY NUMBERS ====== */}
      <div className="rounded-2xl border p-6 bg-white dark:bg-slate-900 shadow-sm">
        <h3 className="text-xl font-bold mb-4">🔢 Life by Numbers</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">
              {lifeData.totalMondays.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Mondays
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 font-mono">
              {lifeData.totalSeasons.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Seasons
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 font-mono">
              {lifeData.totalWeeksLived.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Weeks Lived
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 font-mono">
              {lifeData.totalMonthsLived.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Months Lived
            </div>
          </div>
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/30 dark:to-pink-900/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-pink-600 dark:text-pink-400 font-mono">
              {lifeData.totalSummerWinters}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Summers & Winters
            </div>
          </div>
          <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/30 dark:to-teal-900/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-teal-600 dark:text-teal-400 font-mono">
              {Math.floor(lifeData.ageInDays).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Days Lived
            </div>
          </div>
        </div>
        <div className="mt-4 text-xs text-gray-400 text-center">
          {lifeData.totalSummerWinters} summers, {lifeData.totalSummerWinters}{" "}
          winters, {lifeData.totalSeasons} seasons
        </div>
      </div>

      {/* ====== LIFE REFLECTION ====== */}
      <div className="rounded-2xl border-2 p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="text-4xl">💭</div>
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Life Reflection
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              You've lived{" "}
              <strong>{Math.floor(lifeData.ageInDays).toLocaleString()}</strong>{" "}
              days. You have{" "}
              <strong>
                {Math.floor(lifeData.daysRemaining).toLocaleString()}
              </strong>{" "}
              days left.
            </p>
            <p className="text-gray-500 dark:text-gray-500 mt-3 text-sm italic">
              "Make each day count. The rest is already written."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
