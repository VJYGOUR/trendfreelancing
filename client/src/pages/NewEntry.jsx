import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function NewEntry() {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    date: "",
    leads: 0,
    clients: 0,
    revenue: 0,
    coding: 5,
    post: 5,
    bookPage: 5,
    note: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const token = await getToken();

      await api.post("/entries", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = `
    w-full
    p-3
    rounded-xl
    border
    border-slate-300
    dark:border-slate-700
    bg-white
    dark:bg-slate-900
    text-slate-900
    dark:text-white
    focus:ring-2
    focus:ring-indigo-500
    outline-none
  `;

  const labelStyle = `
    block
    mb-2
    text-sm
    font-medium
    text-slate-700
    dark:text-slate-300
  `;

  return (
    <div className="max-w-xl mx-auto py-10">
      <div
        className="
        bg-white
        dark:bg-slate-900
        border
        border-slate-200
        dark:border-slate-800
        rounded-2xl
        p-6
        shadow-sm
      "
      >
        <h1 className="text-3xl font-bold dark:text-white">New Entry</h1>

        <p className="text-slate-500 dark:text-slate-400 mt-2 mb-8">
          Record your daily business progress.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelStyle}>Date</label>

            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={inputStyle}
              required
            />
          </div>

          <div>
            <label className={labelStyle}>Number of Leads</label>

            <input
              type="number"
              name="leads"
              value={formData.leads}
              onChange={handleChange}
              className={inputStyle}
              min="0"
            />
          </div>

          <div>
            <label className={labelStyle}>Number of Clients Converted</label>

            <input
              type="number"
              name="clients"
              value={formData.clients}
              onChange={handleChange}
              className={inputStyle}
              min="0"
            />
          </div>

          <div>
            <label className={labelStyle}>Revenue Generated (₹)</label>

            <input
              type="number"
              name="revenue"
              value={formData.revenue}
              onChange={handleChange}
              className={inputStyle}
              min="0"
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className={labelStyle}>coding (1-10)</label>

              <input
                type="number"
                name="coding"
                min="0"
                max="10"
                value={formData.coding}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>

            <div>
              <label className={labelStyle}>post (1-10)</label>

              <input
                type="number"
                name="post"
                min="0"
                max="10"
                value={formData.post}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>

            <div>
              <label className={labelStyle}>bookPage (1-10)</label>

              <input
                type="number"
                name="bookPage"
                min="0"
                max="1000"
                value={formData.bookPage}
                onChange={handleChange}
                className={inputStyle}
              />
            </div>
          </div>

          <div>
            <label className={labelStyle}>Daily Notes / Reflection</label>

            <textarea
              name="note"
              rows="5"
              value={formData.note}
              onChange={handleChange}
              placeholder="What happened today?"
              className={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              bg-indigo-600
              hover:bg-indigo-700
              text-white
              font-semibold
              py-3
              rounded-xl
              transition
              disabled:opacity-50
            "
          >
            {loading ? "Saving..." : "Save Entry"}
          </button>
        </form>
      </div>
    </div>
  );
}
