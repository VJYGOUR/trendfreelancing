import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

import {
  SignedIn,
  SignedOut,
  UserButton,
  SignInButton,
} from "@clerk/clerk-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const navLink =
    "px-4 py-2 rounded-lg transition hover:bg-slate-300 dark:hover:bg-slate-800";

  return (
    <nav
      className="
        sticky top-0
        z-50
        backdrop-blur-xl
        bg-slate-200/70
        dark:bg-slate-900/70
        border-b
        border-slate-300
        dark:border-slate-800
        transition-colors
      "
    >
      <div
        className="
          max-w-7xl
          mx-auto
          h-16
          px-4
          sm:px-6
          flex
          items-center
          justify-between
        "
      >
        {/* Logo */}

        <Link
          to="/"
          className="
            text-xl
            sm:text-2xl
            font-black
            tracking-tight
            text-slate-800
            dark:text-white
          "
        >
          Trend Journal
        </Link>

        {/* Desktop Navigation */}

        <SignedIn>
          <div className="hidden md:flex items-center gap-2">
            <NavLink to="/dashboard" className={navLink}>
              Dashboard
            </NavLink>

            <NavLink to="/new-entry" className={navLink}>
              New Entry
            </NavLink>

            <NavLink to="/profile" className={navLink}>
              Profile
            </NavLink>
          </div>
        </SignedIn>

        {/* Right Section */}

        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <button
                className="
                  bg-indigo-600
                  hover:bg-indigo-700
                  text-white
                  px-4
                  sm:px-5
                  py-2
                  rounded-xl
                  transition
                "
              >
                Sign In
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton />
          </SignedIn>

          {/* Mobile Button */}

          <SignedIn>
            <button
              onClick={() => setOpen(!open)}
              className="
                md:hidden
                text-2xl
                text-slate-700
                dark:text-white
              "
            >
              ☰
            </button>
          </SignedIn>
        </div>
      </div>

      {/* Mobile Menu */}

      {open && (
        <SignedIn>
          <div
            className="
              md:hidden
              px-4
              pb-4
              flex
              flex-col
              gap-2
              bg-slate-200
              dark:bg-slate-900
            "
          >
            <NavLink
              onClick={() => setOpen(false)}
              to="/dashboard"
              className={navLink}
            >
              Dashboard
            </NavLink>

            <NavLink
              onClick={() => setOpen(false)}
              to="/new-entry"
              className={navLink}
            >
              New Entry
            </NavLink>

            <NavLink
              onClick={() => setOpen(false)}
              to="/profile"
              className={navLink}
            >
              Profile
            </NavLink>
          </div>
        </SignedIn>
      )}
    </nav>
  );
}
