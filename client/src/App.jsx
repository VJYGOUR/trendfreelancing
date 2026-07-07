import { Routes, Route } from "react-router-dom";

import RootLayout from "./layouts/RootLayout";

import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import NewEntry from "./pages/NewEntry";
import Profile from "./pages/Profile";

function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<Landing />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/new-entry" element={<NewEntry />} />

        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}

export default App;
