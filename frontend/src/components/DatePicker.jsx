import { useState, useEffect } from "react";

export default function DatePicker({ value, onChange }) {
  const [day,   setDay]   = useState("");
  const [month, setMonth] = useState("");
  const [year,  setYear]  = useState("");

  // When value changes from outside, sync the 3 dropdowns
  useEffect(() => {
    if (value && value.length === 10) {
      setYear(value.substring(0, 4));
      setMonth(value.substring(5, 7));
      setDay(value.substring(8, 10));
    } else {
      setDay("");
      setMonth("");
      setYear("");
    }
  }, [value]);

  // When any dropdown changes, fire onChange
  const handleChange = (newDay, newMonth, newYear) => {
    if (newDay && newMonth && newYear) {
      onChange(`${newYear}-${newMonth}-${newDay}`);
    } else {
      onChange("");
    }
  };

  const onDayChange = (e) => {
    const val = e.target.value;
    setDay(val);
    handleChange(val, month, year);
  };

  const onMonthChange = (e) => {
    const val = e.target.value;
    setMonth(val);
    handleChange(day, val, year);
  };

  const onYearChange = (e) => {
    const val = e.target.value;
    setYear(val);
    handleChange(day, month, val);
  };

  const totalDays = (month && year)
    ? new Date(parseInt(year), parseInt(month), 0).getDate()
    : 31;

  const currentYear = new Date().getFullYear();

  return (
    <div style={{ display: "flex", gap: "6px" }}>

      {/* Day */}
      <select value={day} onChange={onDayChange} style={{ flex: 1 }}>
        <option value="">DD</option>
        {Array.from({ length: totalDays }, (_, i) => {
          const d = String(i + 1).padStart(2, "0");
          return <option key={d} value={d}>{d}</option>;
        })}
      </select>

      {/* Month */}
      <select value={month} onChange={onMonthChange} style={{ flex: 2 }}>
        <option value="">Month</option>
        <option value="01">January</option>
        <option value="02">February</option>
        <option value="03">March</option>
        <option value="04">April</option>
        <option value="05">May</option>
        <option value="06">June</option>
        <option value="07">July</option>
        <option value="08">August</option>
        <option value="09">September</option>
        <option value="10">October</option>
        <option value="11">November</option>
        <option value="12">December</option>
      </select>

      {/* Year */}
      <select value={year} onChange={onYearChange} style={{ flex: 1 }}>
        <option value="">YYYY</option>
        {Array.from({ length: 6 }, (_, i) => {
          const y = String(currentYear - 2 + i);
          return <option key={y} value={y}>{y}</option>;
        })}
      </select>

    </div>
  );
}