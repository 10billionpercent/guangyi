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

      const img = new Image();
      img.crossOrigin = "anonymous";
      const blobUrl = window.URL.createObjectURL(blob);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (ctx) {
          const size = 2000;
          canvas.width = size;
          canvas.height = size;

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";

          ctx.fillStyle = isDark ? "#121212" : "#ffffff";
          ctx.fillRect(0, 0, size, size);

          // 1. Set independent maximum limits for width and height
          // size * 0.95 allows it to use up to 1900px of the width (only 2.5% padding on each side!)
          const maxWidth = size * 0.95;
          const maxHeight = size * 0.8; // Keeps a safe 10% vertical padding so it doesn't hit top/bottom

          // 2. Calculate scale factors based on independent limits
          const scaleX = maxWidth / img.width;
          const scaleY = maxHeight / img.height;

          // Take the smaller scale to ensure the image maintains its aspect ratio perfectly
          const scale = Math.min(scaleX, scaleY);

          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;

          // 3. Center the graphic perfectly inside the 2000x2000 square
          const xOffset = (size - scaledWidth) / 2;
          const yOffset = (size - scaledHeight) / 2;

          ctx.drawImage(img, xOffset, yOffset, scaledWidth, scaledHeight);

          canvas.toBlob(
            (finalBlob) => {
              if (finalBlob) {
                const finalUrl = window.URL.createObjectURL(finalBlob);
                const a = document.createElement("a");
                a.href = finalUrl;
                a.download = `gleam-square-${date}.png`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(finalUrl);
              }
            },
            "image/png",
            1.0,
          );
        }
        window.URL.revokeObjectURL(blobUrl);
      };

      img.src = blobUrl;
    } catch (error) {
      console.error("Square download failed ", error);
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
