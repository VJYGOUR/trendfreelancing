import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      <main
        className="
          w-full
          max-w-6xl
          mx-auto
          px-4
          sm:px-6
          lg:px-8
          py-6
        "
      >
        <Outlet />
      </main>
    </div>
  );
}
