import { Link } from "react-router-dom";
import { SignedIn, SignedOut, SignUpButton } from "@clerk/clerk-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      {/* Navbar */}

      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-tight">Trend Journal</h1>

        <SignedOut>
          <SignUpButton mode="modal">
            <button className="rounded-xl bg-black px-5 py-2.5 text-white hover:bg-gray-800 transition">
              Get Started
            </button>
          </SignUpButton>
        </SignedOut>

        <SignedIn>
          <Link
            to="/dashboard"
            className="rounded-xl bg-black px-5 py-2.5 text-white"
          >
            Dashboard
          </Link>
        </SignedIn>
      </nav>

      {/* Hero */}

      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex rounded-full border bg-white px-4 py-2 text-sm font-medium shadow-sm">
          📈 Stop reacting to one bad day.
        </div>

        <h1 className="mt-8 text-5xl md:text-7xl font-black leading-tight tracking-tight">
          Make decisions
          <br />
          from
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {" "}
            trends
          </span>
          ,
          <br />
          not emotions.
        </h1>

        <p className="mt-8 max-w-3xl mx-auto text-xl text-gray-600 leading-8">
          Track leads, clients, revenue, mood and confidence. See the bigger
          picture before making important business decisions.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
          <SignedOut>
            <SignUpButton mode="modal">
              <button className="rounded-2xl bg-black px-8 py-4 text-lg font-semibold text-white hover:scale-105 transition">
                Start Free
              </button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <Link
              to="/dashboard"
              className="rounded-2xl bg-black px-8 py-4 text-lg font-semibold text-white"
            >
              Open Dashboard
            </Link>
          </SignedIn>

          <a
            href="#features"
            className="rounded-2xl border px-8 py-4 text-lg font-semibold hover:bg-white"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* Preview */}

      <section className="max-w-6xl mx-auto px-6">
        <div className="rounded-3xl border min-h-screen bg-slate-100 p-8 shadow-2xl">
          <div className="grid gap-6 md:grid-cols-4">
            <div className="rounded-2xl border p-6">
              <p className="text-gray-500">Revenue</p>
              <h2 className="mt-3 text-4xl font-bold">₹52,300</h2>
            </div>

            <div className="rounded-2xl border p-6">
              <p className="text-gray-500">Leads</p>
              <h2 className="mt-3 text-4xl font-bold">46</h2>
            </div>

            <div className="rounded-2xl border p-6">
              <p className="text-gray-500">Clients</p>
              <h2 className="mt-3 text-4xl font-bold">9</h2>
            </div>

            <div className="rounded-2xl border p-6">
              <p className="text-gray-500">Business Health</p>
              <h2 className="mt-3 text-3xl font-bold text-green-600">
                Improving
              </h2>
            </div>
          </div>

          <div className="mt-8 h-72 rounded-2xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center text-2xl font-semibold text-gray-500">
            📊 Your charts will appear here
          </div>
        </div>
      </section>

      {/* Features */}

      <section id="features" className="max-w-6xl mx-auto px-6 py-28">
        <h2 className="text-4xl font-black text-center">
          Everything you need.
        </h2>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          <div className="rounded-3xl border bg-white p-8 shadow-sm">
            <div className="text-4xl">📈</div>

            <h3 className="mt-6 text-2xl font-bold">Track Trends</h3>

            <p className="mt-3 text-gray-600">
              Stop judging your business based on one client or one bad day.
            </p>
          </div>

          <div className="rounded-3xl border bg-white p-8 shadow-sm">
            <div className="text-4xl">🧠</div>

            <h3 className="mt-6 text-2xl font-bold">Understand Yourself</h3>

            <p className="mt-3 text-gray-600">
              Monitor mood, stress and confidence alongside business metrics.
            </p>
          </div>

          <div className="rounded-3xl border bg-white p-8 shadow-sm">
            <div className="text-4xl">📊</div>

            <h3 className="mt-6 text-2xl font-bold">Make Better Decisions</h3>

            <p className="mt-3 text-gray-600">
              See patterns before making important business decisions.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}

      <section className="pb-24 px-6">
        <div className="max-w-5xl mx-auto rounded-[32px] bg-black text-white p-16 text-center">
          <h2 className="text-5xl font-black">
            Your future is a trend,
            <br />
            not today's mood.
          </h2>

          <p className="mt-6 text-gray-300 text-lg">
            Start tracking today and make decisions with confidence.
          </p>

          <SignedOut>
            <div className="mt-10">
              <SignUpButton mode="modal">
                <button className="rounded-2xl bg-white px-8 py-4 text-lg font-bold text-black hover:scale-105 transition">
                  Create Free Account
                </button>
              </SignUpButton>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="mt-10">
              <Link
                to="/dashboard"
                className="rounded-2xl bg-white px-8 py-4 text-lg font-bold text-black"
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
