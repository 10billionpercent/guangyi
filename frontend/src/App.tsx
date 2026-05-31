import { useState, useEffect } from "react";
import { Sun, Moon, Download } from "lucide-react";
import DatePicker from "./DatePicker";
import "./index.css";

interface GleamData {
  date: string;
  text: string;
  lightUrl: string;
  darkUrl: string;
  altText: string;
}

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0].replace(/-/g, ""),
  );
  const [data, setData] = useState<GleamData | null>(null);
  const [message, setMessage] = useState("Loading...");

  const fetchGleam = async (dateStr: string) => {
    // 1. Convert YYYYMMDD to a Date object for comparison
    const y = parseInt(dateStr.substring(0, 4));
    const m = parseInt(dateStr.substring(4, 6)) - 1;
    const d = parseInt(dateStr.substring(6, 8));

    // Create Date using Date.UTC
    const selectedDate = new Date(Date.UTC(y, m, d));

    // Get today in UTC
    const now = new Date();
    const today = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );

    // 2. Define your logic (May 30, 2026)
    const startDate = new Date(Date.UTC(2026, 4, 30));

    if (selectedDate > today) {
      setMessage("That gleam hasn’t appeared yet ✨");
      setData(null);
      return;
    }

    if (selectedDate < startDate) {
      setMessage("Eheh, the archive starts from 30/05 😈✨");
      setData(null);
      return;
    }

    // 3. If dates are valid, proceed to fetch
    setMessage("Searching...");
    setData(null);
    try {
      const res = await fetch(
        `https://backend.10billionpercent.workers.dev/api/gleam/latest?date=${dateStr}`,
      );

      if (!res.ok) throw new Error("Not found");

      const result = await res.json();
      setData(result);
      setMessage("");
    } catch {
      setMessage("No gleam surfaced for this day ✨");
    }
  };

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url, { referrerPolicy: "no-referrer" });
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `gleam-${date}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed ", error);
      window.open(url, "_blank");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGleam(date);
  }, [date]);

  return (
    <div className={`app-container ${isDark ? "dark" : "light"}`}>
      <header>
        <h1>A little gleam for today’s art 🎨 ✨</h1>
        <button onClick={() => setIsDark(!isDark)} className="theme-switcher">
          {isDark ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </header>

      <div className="picker-section">
        <p>Pick a date</p>
        <DatePicker value={date} onChange={setDate} />
      </div>

      <main className="display-section">
        {message && <p className="msg">{message}</p>}
        {data && (
          <>
            <h2>{data.text}</h2>{" "}
            <button
              onClick={() =>
                handleDownload(isDark ? data.darkUrl : data.lightUrl)
              }
              className="download-btn"
            >
              <Download size={20} /> Download Gleam
            </button>
            <img
              key={isDark ? data.darkUrl : data.lightUrl}
              src={isDark ? data.darkUrl : data.lightUrl}
              alt={data.altText}
              className="gleam-large"
              referrerPolicy="no-referrer"
            />
          </>
        )}
      </main>
    </div>
  );
}
