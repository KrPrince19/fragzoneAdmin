'use client';

import { useState } from "react";
import { useRouter } from 'next/navigation';

export default function DynamicFormUploader() {
  const router = useRouter();
  const [collection, setCollection] = useState("");
  const [formData, setFormData] = useState({});
  const [status, setStatus] = useState("");

  const fieldTemplates = {
    tournament: ["tournamentId","name", "startdate", "enddate"],
    upcomingtournament: ["tournamentId","name", "startdate", "enddate"],
    tournamentdetail: ["tournamentId","name", "startdate", "enddate", "map", "prizePool"],
    upcomingscrim: ["name", "startdate", "time", "match"],
    mvpplayer: ["name", "teamname", "kill", "imgSrc"],
    topplayer: ["rank", "playerName", "kill", "teamName", "point", "imgSrc"],
    rank: ["rank", "playerName", "kill", "teamName", "point"],
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
      const response = await fetch("https://bgmibackend.onrender.com/tournament", {
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
    <div className=" -mt-[17px] w-[100%] ">
      <div className="border-2 border-amber-50 w-full h-[100%] lg:w-[525px] p-6 rounded-2xl lg:mx-88 my-4 bg-gradient-to-br from-purple-700 via-purple-500 to-blue-500 shadow-lg">
        <h2 className="text-[13px] lg:text-2xl font-bold text-white mb-4">📤 Upload Tournament detail into MongoDB</h2>

        <form onSubmit={handleSubmit} className="px-2 sm:px-4 bg-white rounded-xl  p-6 shadow-inner">
          <label className="text-gray-700 font-semibold">Select Collection:</label>
          <select
            className="border border-gray-300 m-2 rounded-2xl w-full sm:w-auto p-1"
            value={collection}
            onChange={(e) => {
              setCollection(e.target.value);
              setFormData({});
              setStatus("");
            }}
            required
          >
            <option className="text-gray-500" value="">
              -- Select --
            </option>
            {Object.keys(fieldTemplates).map((col) => (
              <option className="text-black font-bold" key={col} value={col}>
                {col}
              </option>
            ))}
          </select>

          <br /><br />

          {currentFields.map((field) => (
            <div key={field} className="mb-4">
              <label className="block text-gray-700 font-medium">{field}:</label>
              <input
                className="border border-gray-300 rounded-2xl block w-full sm:w-full px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="text"
                value={formData[field] || ""}
                onChange={(e) => handleInputChange(field, e.target.value)}
                required
              />
            </div>
          ))}

          <button
            type="submit"
            className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300"
          >
            <span className="relative px-3 py-2 transition-all ease-in duration-75 bg-white rounded-md group-hover:bg-transparent">
              Submit
            </span>
          </button>
        </form>

        {status && (
          <p
            className="mt-4 text-center font-medium"
            style={{ color: status.startsWith("✅") ? "green" : "red" }}
          >
            {status}
          </p>
        )}
      </div>
    </div>
  );
}
