import { useState, useRef, useEffect } from "react";

interface DatePickerProps {
  value: string; // expected format: DD-MM-YYYY
  onChange: (dateStr: string) => void;
  placeholder?: string;
}

const parseDate = (dateStr: string): Date | null => {
  if (dateStr.length === 8) {
    const y = parseInt(dateStr.substring(0, 4));
    const m = parseInt(dateStr.substring(4, 6));
    const d = parseInt(dateStr.substring(6, 8));
    return new Date(y, m - 1, d);
  }
  return null;
};

const toDisplay = (dateStr: string) => {
  if (dateStr.length !== 8) return dateStr;
  return `${dateStr.substring(6, 8)}-${dateStr.substring(4, 6)}-${dateStr.substring(0, 4)}`;
};

export default function DatePicker({
  value,
  onChange,
  placeholder = "DD-MM-YYYY",
}: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [tempYear, setTempYear] = useState(new Date().getFullYear());
  const [tempMonth, setTempMonth] = useState(new Date().getMonth());
  const pickerRef = useRef<HTMLDivElement>(null);

  const goPrevMonth = () => {
    if (tempMonth === 0) {
      setTempYear((prev) => prev - 1);
      setTempMonth(11);
    } else {
      setTempMonth((prev) => prev - 1);
    }
  };

  const goNextMonth = () => {
    if (tempMonth === 11) {
      setTempYear((prev) => prev + 1);
      setTempMonth(0);
    } else {
      setTempMonth((prev) => prev + 1);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPicker]);

  const handleDateSelect = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    onChange(`${y}${m}${d}`);
    setShowPicker(false);
  };

  const openPicker = () => {
    const parsed = parseDate(value);
    if (parsed && !isNaN(parsed.getTime())) {
      setTempYear(parsed.getFullYear());
      setTempMonth(parsed.getMonth());
    } else {
      const now = new Date();
      setTempYear(now.getFullYear());
      setTempMonth(now.getMonth());
    }
    setShowPicker(true);
  };

  // Get days array with proper weekday offsets
  const getDaysInMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay(); // 0 = Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysArray: (number | null)[] = [];

    // Add empty cells before the first day of the month
    for (let i = 0; i < startWeekday; i++) {
      daysArray.push(null);
    }
    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
      daysArray.push(i);
    }
    return daysArray;
  };

  const days = getDaysInMonth(tempYear, tempMonth);

  return (
    <div className="date-picker-wrapper" ref={pickerRef}>
      <div className="date-picker-input-wrap">
        <input
          type="text"
          className="date-picker-input"
          placeholder={placeholder}
          value={toDisplay(value)} // Show human-readable
          readOnly
          onClick={openPicker}
        />
        <button
          className="date-picker-icon-btn"
          type="button"
          onClick={openPicker}
          aria-label="Pick date"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </button>
      </div>

      {showPicker && (
        <div className="date-picker-popup">
          <div className="dp-header">
            <button onClick={goPrevMonth}>&lt;</button>
            <span>
              {new Date(tempYear, tempMonth).toLocaleString("default", {
                month: "long",
              })}{" "}
              {tempYear}
            </span>
            <button onClick={goNextMonth}>&gt;</button>
          </div>
          <div className="dp-weekdays">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="dp-days">
            {days.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="dp-empty-day" />;
              }
              const date = new Date(tempYear, tempMonth, day);
              const dateFormatted = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
              const isSelected = value === dateFormatted;
              return (
                <button
                  key={idx}
                  className={`dp-day ${isSelected ? "selected" : ""}`}
                  onClick={() => handleDateSelect(date)}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
