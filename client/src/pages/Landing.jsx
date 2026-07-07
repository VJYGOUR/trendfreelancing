import { Link } from "react-router-dom";
import { SignedIn, SignedOut, SignUpButton } from "@clerk/clerk-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black text-slate-100">
      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
          Trend Journal
        </h1>

        <SignedOut>
          <SignUpButton mode="modal">
            <button className="rounded-xl bg-white text-black px-4 sm:px-5 py-2.5 text-sm sm:text-base font-medium hover:bg-slate-200 transition">
              Get Started
            </button>
          </SignUpButton>
        </SignedOut>

        <SignedIn>
          <Link
            to="/dashboard"
            className="rounded-xl bg-white text-black px-4 sm:px-5 py-2.5 text-sm sm:text-base font-medium hover:bg-slate-200 transition"
          >
            Dashboard
          </Link>
        </SignedIn>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 md:py-24 text-center">
        <div className="inline-flex rounded-full border border-slate-700 bg-slate-800/80 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-300 shadow-sm">
          📈 Stop reacting to one bad day.
        </div>

        <h1 className="mt-8 text-4xl sm:text-5xl lg:text-7xl font-black leading-tight tracking-tight text-white">
          Make decisions
          <br />
          from
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {" "}
            trends
          </span>
          ,
          <br />
          not emotions.
        </h1>

        <p className="mt-6 sm:mt-8 max-w-3xl mx-auto text-base sm:text-lg lg:text-xl text-slate-400 leading-7 sm:leading-8">
          Track leads, clients, revenue, mood and confidence. See the bigger
          picture before making important business decisions.
        </p>

        <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row justify-center gap-4">
          <SignedOut>
            <SignUpButton mode="modal">
              <button className="w-full sm:w-auto rounded-2xl bg-white px-8 py-4 text-lg font-semibold text-black hover:scale-105 transition">
                Start Free
              </button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <Link
              to="/dashboard"
              className="w-full sm:w-auto rounded-2xl bg-white px-8 py-4 text-lg font-semibold text-black hover:scale-105 transition"
            >
              Open Dashboard
            </Link>
          </SignedIn>

          <a
            href="#features"
            className="w-full sm:w-auto rounded-2xl border border-slate-700 bg-slate-800/40 px-8 py-4 text-lg font-semibold text-slate-200 hover:bg-slate-700 transition"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* Preview */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4 sm:p-6 lg:p-8 shadow-2xl backdrop-blur">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4 sm:p-6">
              <p className="text-slate-400 text-sm">Revenue</p>
              <h2 className="mt-2 sm:mt-3 text-2xl sm:text-4xl font-bold text-white">
                ₹52,300
              </h2>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4 sm:p-6">
              <p className="text-slate-400 text-sm">Leads</p>
              <h2 className="mt-2 sm:mt-3 text-2xl sm:text-4xl font-bold text-white">
                46
              </h2>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4 sm:p-6">
              <p className="text-slate-400 text-sm">Clients</p>
              <h2 className="mt-2 sm:mt-3 text-2xl sm:text-4xl font-bold text-white">
                9
              </h2>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4 sm:p-6">
              <p className="text-slate-400 text-sm">Business Health</p>
              <h2 className="mt-2 sm:mt-3 text-xl sm:text-3xl font-bold text-green-400">
                Improving
              </h2>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 h-56 sm:h-72 md:h-80 rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 flex items-center justify-center text-lg sm:text-2xl font-semibold text-slate-500">
            📊 Your charts will appear here
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28"
      >
        <h2 className="text-3xl sm:text-4xl font-black text-center text-white">
          Everything you need.
        </h2>

        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
          <div className="rounded-3xl border border-slate-700 bg-slate-800/60 p-6 sm:p-8 shadow-lg backdrop-blur">
            <div className="text-4xl">📈</div>

            <h3 className="mt-6 text-xl sm:text-2xl font-bold text-white">
              Track Trends
            </h3>

            <p className="mt-3 text-slate-400">
              Stop judging your business based on one client or one bad day.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-700 bg-slate-800/60 p-6 sm:p-8 shadow-lg backdrop-blur">
            <div className="text-4xl">🧠</div>

            <h3 className="mt-6 text-xl sm:text-2xl font-bold text-white">
              Understand Yourself
            </h3>

            <p className="mt-3 text-slate-400">
              Monitor mood, stress and confidence alongside business metrics.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-700 bg-slate-800/60 p-6 sm:p-8 shadow-lg backdrop-blur">
            <div className="text-4xl">📊</div>

            <h3 className="mt-6 text-xl sm:text-2xl font-bold text-white">
              Make Better Decisions
            </h3>

            <p className="mt-3 text-slate-400">
              See patterns before making important business decisions.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20 sm:pb-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto rounded-[32px] border border-slate-700 bg-slate-900 px-6 py-10 sm:p-16 text-center shadow-2xl">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
            Your future is a trend,
            <br />
            not today's mood.
          </h2>

          <p className="mt-6 text-slate-400 text-base sm:text-lg">
            Start tracking today and make decisions with confidence.
          </p>

          <SignedOut>
            <div className="mt-10">
              <SignUpButton mode="modal">
                <button className="w-full sm:w-auto rounded-2xl bg-white px-8 py-4 text-lg font-bold text-black hover:scale-105 transition">
                  Create Free Account
                </button>
              </SignUpButton>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="mt-10">
              <Link
                to="/dashboard"
                className="inline-block w-full sm:w-auto rounded-2xl bg-white px-8 py-4 text-lg font-bold text-black hover:scale-105 transition"
              >
                Go to Dashboard
              </Link>
            </div>
          </SignedIn>
        </div>
      </section>
    </div>
  );
}
