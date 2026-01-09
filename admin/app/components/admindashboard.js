'use client';

import { useState } from "react";
import { useRouter } from 'next/navigation';

export default function DynamicFormUploader() {
  const router = useRouter();
  const [collection, setCollection] = useState("");
  const [formData, setFormData] = useState({});
  const [status, setStatus] = useState("");

  const formatToAmPm = (value) => {
    if (!value) return "";
    const [hour, minute] = value.split(":").map(Number);
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${formattedHour}:${minute.toString().padStart(2, "0")} ${period}`;
  };

// ... existing code ...

  const fieldTemplates = {
    tournament: ["tournamentId", "name", "startdate", "enddate"],
    upcomingtournament: ["tournamentId", "name", "startdate", "enddate"],
    tournamentdetail: ["tournamentId", "name", "startdate", "enddate", "map", "prizePool"],
    upcomingscrim: ["name", "startdate", "time", "map"],
    winner: ["name", "teamname", "kill", "imgSrc"],
    leaderboard: ["rank", "playerName", "kill", "teamName", "point", "imgSrc"],
    
    /* UPDATED: Added tournamentId here */
    passedmatch: [
      "tournamentId",  // <--- Added this line
      "matchName", 
      "player1_name", "player1_kill", "player1_point",
      "player2_name", "player2_kill", "player2_point",
      "player3_name", "player3_kill", "player3_point",
      "player4_name", "player4_kill", "player4_point"
    ],
  };

// ... existing code ...

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
      const response = await fetch("https://bgmibackendzm.onrender.com/tournament", {
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
      setStatus("❌ Upload failed.");
    }
  };

  const currentFields = fieldTemplates[collection] || [];

  return (
    <div className="-mt-[17px] w-full">
      <div className="border-2 border-amber-50 w-full lg:w-[600px] p-6 rounded-2xl lg:mx-auto my-4 bg-gradient-to-br from-purple-700 via-purple-500 to-blue-500 shadow-lg">
        <h2 className="text-[13px] lg:text-2xl font-bold text-white mb-4">
          📤 Upload {collection || "Data"} into MongoDB
        </h2>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-inner max-h-[70vh] overflow-y-auto">
          <label className="text-gray-700 font-semibold">Select Collection:</label>
          <select
            className="border border-gray-300 m-2 rounded-2xl w-full p-2"
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

          <div className="grid grid-cols-1 gap-4 mt-4">
            {currentFields.map((field) => (
              <div key={field} className="flex flex-col">
                <label className="text-gray-700 font-medium text-sm capitalize">
                  {field.replace(/_/g, " ")}
                </label>

                {/* DATE LOGIC */}
                {(field === "startdate" || field === "enddate") ? (
                  <input
                    type="date"
                    className="border border-gray-300 rounded-lg px-3 py-2 mt-1"
                    value={formData[field] || ""}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    required
                  />
                ) : field === "time" ? (
                  <input
                    type="time"
                    className="border border-gray-300 rounded-lg px-3 py-2 mt-1"
                    onChange={(e) => handleInputChange(field, formatToAmPm(e.target.value))}
                    required
                  />
                ) : (
                  /* DEFAULT TEXT/NUMBER INPUT */
                  <input
                    type={(field.includes("kill") || field.includes("point")) ? "number" : "text"}
                    placeholder={`Enter ${field}`}
                    className="border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
                    value={formData[field] || ""}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    required
                  />
                )}
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="mt-6 w-full inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 hover:opacity-90"
          >
            Submit Match Data
          </button>
        </form>

        {status && (
          <p className={`mt-4 text-center font-medium ${status.startsWith("✅") ? "text-green-200" : "text-red-200"}`}>
            {status}
          </p>
        )}
      </div>
    </div>
  );
}