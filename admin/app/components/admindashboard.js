'use client';

import { useState } from "react";
import { useRouter } from 'next/navigation';

export default function DynamicFormUploader() {
  const router = useRouter();
  const [collection, setCollection] = useState("");
  const [formData, setFormData] = useState({});
  const [status, setStatus] = useState("");

  /* -------- FORMAT TIME TO AM/PM -------- */
  const formatToAmPm = (value) => {
    if (!value) return "";
    const [hour, minute] = value.split(":").map(Number);
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${formattedHour}:${minute.toString().padStart(2, "0")} ${period}`;
  };

  const fieldTemplates = {
    tournament: ["tournamentId", "name", "startdate", "enddate"],
    upcomingtournament: ["tournamentId", "name", "startdate", "enddate"],
    tournamentdetail: ["tournamentId", "name", "startdate", "enddate", "map", "prizePool"],
    upcomingscrim: ["name", "startdate", "time", "map"],
    winner: ["name", "teamname", "kill", "imgSrc"],
    leaderboard: ["rank", "playerName", "kill", "teamName", "point", "imgSrc"],
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!collection) {
      setStatus("❌ Please select a collection.");
      return;
    }

    try {
      const response = await fetch("https://bgmibackend.vercel.app/tournament", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collection, data: [formData] }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus(data.error || "❌ Upload failed.");
        return;
      }

      setStatus("✅ Submission successful! 🎉");
      setFormData({});
      setCollection("");
      setTimeout(() => setStatus(""), 5000);
    } catch (err) {
      console.error("❌ Upload failed:", err);
      setStatus("❌ Upload failed.");
    }
  };

  const currentFields = fieldTemplates[collection] || [];

  return (
    <div className="-mt-[17px] w-full">
      <div className="border-2 border-amber-50 w-full lg:w-[525px] p-6 rounded-2xl lg:mx-88 my-4 bg-gradient-to-br from-purple-700 via-purple-500 to-blue-500 shadow-lg">

        <h2 className="text-[13px] lg:text-2xl font-bold text-white mb-4">
          📤 Upload Tournament detail into MongoDB
        </h2>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-inner">
          <label className="text-gray-700 font-semibold">Select Collection:</label>

          <select
            className="border border-gray-300 m-2 rounded-2xl w-full p-1"
            value={collection}
            onChange={(e) => {
              setCollection(e.target.value);
              setFormData({});
              setStatus("");
            }}
            required
          >
            <option value="">-- Select --</option>
            {Object.keys(fieldTemplates).map((col) => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>

          <br /><br />

          {currentFields.map((field) => (
            <div key={field} className="mb-4">
              <label className="block text-gray-700 font-medium capitalize">
                {field}
              </label>

              {/* 📅 DATE PICKER */}
              {(field === "startdate" || field === "enddate") && (
                <input
                  type="date"
                  className="border border-gray-300 rounded-2xl block w-full px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
                  value={formData[field] || ""}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  required
                />
              )}

              {/* ⏰ TIME PICKER */}
              {field === "time" && (
                <input
                  type="time"
                  className="border border-gray-300 rounded-2xl block w-full px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
                  onChange={(e) =>
                    handleInputChange(field, formatToAmPm(e.target.value))
                  }
                  required
                />
              )}

              {/* ✍️ TEXT INPUT */}
              {field !== "startdate" && field !== "enddate" && field !== "time" && (
                <input
                  type="text"
                  className="border border-gray-300 rounded-2xl block w-full px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
                  value={formData[field] || ""}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  required
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 hover:opacity-90"
          >
            Submit
          </button>
        </form>

        {status && (
          <p className={`mt-4 text-center font-medium ${status.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
            {status}
          </p>
        )}
      </div>
    </div>
  );
}
