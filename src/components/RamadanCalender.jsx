import "./RamadanCalendar.css";
import { useEffect, useState } from "react";
import { X, Sun, Moon, Star } from "lucide-react";

//get ramadan dates
const getRamadanDates = (timezone, monthOffset = 0) => {
  const currentDate = new Date();

  const localDateParts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone || "UTC",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(currentDate);

  const year = Number(
    localDateParts.find((part) => part.type === "year").value,
  );

  const month = Number(
    localDateParts.find((part) => part.type === "month").value,
  );

  const day = Number(localDateParts.find((part) => part.type === "day").value);

  const start = new Date(Date.UTC(year, month - 1, day, 12));

  const formatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
    timeZone: timezone || "UTC",
    day: "numeric",
    month: "numeric",
  });

  const parts = formatter.formatToParts(start);

  const hijriDay = Number(parts.find((part) => part.type === "day").value);

  start.setUTCDate(start.getUTCDate() - hijriDay + 1);
  const monthFormatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
    timeZone: timezone || "UTC",
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });

  for (let i = 0; i < Math.abs(monthOffset); i++) {
    if (monthOffset > 0) {
      const currentParts = monthFormatter.formatToParts(start);
      const currentMonth = currentParts.find(
        (part) => part.type === "month",
      ).value;
      const currentYear = currentParts.find(
        (part) => part.type === "year",
      ).value;

      do {
        start.setUTCDate(start.getUTCDate() + 1);
        const parts = monthFormatter.formatToParts(start);
        var newMonth = parts.find((part) => part.type === "month").value;
        var newYear = parts.find((part) => part.type === "year").value;
      } while (newMonth === currentMonth && newYear === currentYear);
    } else {
      start.setUTCDate(start.getUTCDate() - 1);

      while (
        Number(
          monthFormatter
            .formatToParts(start)
            .find((part) => part.type === "day").value,
        ) !== 1
      ) {
        start.setUTCDate(start.getUTCDate() - 1);
      }
    }
  }
  return start;
};

//get ramadan datelist
const getRamadanDateList = (startDate, timezone) => {
  if (!startDate) return [];

  const formatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
    timeZone: timezone || "UTC",
    day: "numeric",
    month: "numeric",
  });

  const startParts = formatter.formatToParts(startDate);

  const startMonth = Number(
    startParts.find((part) => part.type === "month").value,
  );

  const dates = [];

  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate);
    date.setUTCDate(startDate.getUTCDate() + i);

    const parts = formatter.formatToParts(date);

    const month = Number(parts.find((part) => part.type === "month").value);

    if (month !== startMonth) break;

    dates.push(date);
  }

  return dates;
};

const getDateLabels = (dateString) => {
  const [day, month, year] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12));

  // Islamic (Hijri) date
  const hijriParts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
    day: "numeric",
    month: "numeric",
    timeZone: "UTC",
  }).formatToParts(date);

  const hijriDay = hijriParts.find((part) => part.type === "day").value;

  const hijriMonth = Number(
    hijriParts.find((part) => part.type === "month").value,
  );

  const hijriMonths = [
    "محرم",
    "صفر",
    "ربيع الأول",
    "ربيع الثاني",
    "جمادى الأول",
    "جمادى الآخر",
    "رجب",
    "شعبان",
    "رمضان المبارك",
    "شوال",
    "ذو القعدة",
    "ذو الحجة",
  ];

  // Afghan Shamsi date
  const shamsiParts = new Intl.DateTimeFormat("en-u-ca-persian", {
    day: "numeric",
    month: "numeric",
    timeZone: "UTC",
  }).formatToParts(date);

  const shamsiDay = shamsiParts.find((part) => part.type === "day").value;

  const shamsiMonth = Number(
    shamsiParts.find((part) => part.type === "month").value,
  );

  const shamsiMonths = [
    "حمل",
    "ثور",
    "جوزا",
    "سرطان",
    "اسد",
    "سنبله",
    "میزان",
    "عقرب",
    "قوس",
    "جدی",
    "دلو",
    "حوت",
  ];

  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "UTC",
  }).format(date);

  // Gregorian date in English
  const miladiDay = String(day).padStart(2, "0");

  const miladiMonth = new Intl.DateTimeFormat("en-US", {
    month: "short",
    timeZone: "UTC",
  }).format(date);

  return {
    weekday,
    hijri: `${hijriDay} ${hijriMonths[hijriMonth - 1]}`,
    shamsi: `${shamsiDay} ${shamsiMonths[shamsiMonth - 1]}`,
    miladi: `${miladiMonth}-${miladiDay}`,
  };
};

const formatPrayerTime = (time) => {
  if (!time) return "";

  const [hour, minute] = time.split(" ")[0].split(":").map(Number);

  const period = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 || 12;

  return `${formattedHour}:${String(minute).padStart(2, "0")} ${period}`;
};
const RamadanCalendar = ({
  onClose,
  coordinates,
  timezone,
  calculationMethod,
  asrMethod,
  currentCity,
}) => {
  const [selectedRamadanDay, setSelectedRamadanDay] = useState(1);
  const [selectedMonthOffset, setSelectedMonthOffset] = useState(0);
  const [ramadanSchedule, setRamadanSchedule] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarError, setCalendarError] = useState("");
  const [ramadanStartDate, setRamadanStartDate] = useState(null);
    const ramadanDates = getRamadanDateList(ramadanStartDate, timezone);
  const [currentTime, setCurrentTime] = useState(new Date());

useEffect(() => {
  const timer = setInterval(() => {
    setCurrentTime(new Date());
  }, 1000);

  return () => clearInterval(timer);
}, []);



  useEffect(() => {
    const loadRamadanSchedule = async () => {
      if (
        !coordinates?.latitude ||
        !coordinates?.longitude ||
        !ramadanStartDate
      ) {
        setRamadanSchedule([]);
        return;
      }

      try {
        setCalendarLoading(true);
        setCalendarError("");

        const dates = getRamadanDateList(ramadanStartDate, timezone);

        const months = [
          ...new Set(
            dates.map(
              (date) => `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}`,
            ),
          ),
        ];

        const results = await Promise.all(
          months.map(async (monthKey) => {
            const [year, month] = monthKey.split("-");

            const response = await fetch(
              `${import.meta.env.VITE_API_URL}/api/prayer-times/calendar?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&year=${year}&month=${month}&method=${calculationMethod}&school=${asrMethod}`,
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
              throw new Error(
                result.message || "Unable to load Ramadan times.",
              );
            }

            return result.data;
          }),
        );

        const allDays = results.flat();

        const schedule = dates.map((date, index) => {
          const day = String(date.getUTCDate()).padStart(2, "0");
          const month = String(date.getUTCMonth() + 1).padStart(2, "0");
          const year = date.getUTCFullYear();
          const dateKey = `${day}-${month}-${year}`;

          const prayerDay = allDays.find(
            (item) => item.date.gregorian.date === dateKey,
          );

          return {
            day: index + 1,
            date: dateKey,
            sehri: prayerDay?.timings?.Fajr,
            iftar: prayerDay?.timings?.Maghrib,
          };
        });

        setRamadanSchedule(schedule);
      } catch (error) {
        setCalendarError(error.message);
      } finally {
        setCalendarLoading(false);
      }
    };

    loadRamadanSchedule();
  }, [coordinates, ramadanStartDate, timezone, calculationMethod, asrMethod]);

  useEffect(() => {
    const startDate = getRamadanDates(timezone, selectedMonthOffset);
    setRamadanStartDate(startDate);
  }, [timezone, selectedMonthOffset]);

  const hijriParts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).formatToParts(ramadanStartDate || new Date());
  const hijriYear = hijriParts.find((part) => part.type === "year").value;

  const hijriDay = Number(hijriParts.find((part) => part.type === "day").value);

  const hijriMonth = Number(
    hijriParts.find((part) => part.type === "month").value,
  );

  const moonDay = hijriMonth === 9 ? selectedRamadanDay : hijriDay;
  const hijriMonthNames = [
    "محرم",
    "صفر",
    "ربيع الأول",
    "ربيع الثاني",
    "جمادى الأول",
    "جمادى الآخر",
    "رجب",
    "شعبان",
    "رمضان المبارک",
    "شوال",
    "ذو القعدة",
    "ذو الحجة",
  ];

  const currentHijriMonthName = hijriMonthNames[hijriMonth - 1];
  const todayParts = new Intl.DateTimeFormat("en-GB", {
  timeZone: timezone || "UTC",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
}).formatToParts(new Date());

const todayDateString = [
  todayParts.find((part) => part.type === "day").value,
  todayParts.find((part) => part.type === "month").value,
  todayParts.find((part) => part.type === "year").value,
].join("-");

  const todayLabels = getDateLabels(todayDateString);

  const hour = new Date().getHours();
  const isMorning = hour >= 5 && hour < 17;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-2 sm:p-4">
      <div className="relative flex max-h-[95dvh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-[#d8bd78] bg-gradient-to-br from-[#fff9eb] via-[#f5e8cc] to-[#e8d3aa] shadow-[0_20px_70px_rgba(0,0,0,0.45)] sm:rounded-[28px]">
        {" "}
        {/* Royal Ramadan Header */}
        <div className="relative z-20 shrink-0 overflow-hidden border-b-2 border-[#d8bd78] bg-gradient-to-b from-[#03130f] via-[#08251d] to-[#041a14] px-4 py-5 text-center sm:px-6 sm:py-7">
          {/* Decorative Stars */}
          <Star
            className="absolute left-[12%] top-8 text-amber-300"
            size={18}
          />
          <Star
            className="absolute right-[15%] top-12 text-amber-300"
            size={14}
          />
          <Star
            className="absolute left-[28%] top-24 text-amber-200"
            size={12}
          />
          <Star
            className="absolute right-[30%] top-7 text-amber-200"
            size={12}
          />

          {/* Realistic Sun or Crescent Moon */}
          <div className="mb-6 flex justify-center">
            {isMorning ? (
              <div className="relative flex h-24 w-24 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-2xl" />
                <div className="absolute h-20 w-20 rounded-full bg-amber-300/20 blur-xl" />
                <div
                  className="relative h-16 w-16 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle at 35% 30%, #fff9c4 0%, #ffe082 25%, #ffb300 60%, #d97706 100%)",
                    boxShadow:
                      "0 0 20px 8px rgba(255,190,60,0.35), 0 0 50px 15px rgba(255,170,40,0.18)",
                  }}
                />
              </div>
            ) : (
              <div className="relative flex h-28 w-28 items-center justify-center">
           

                <svg viewBox="0 0 120 120" className="relative h-28 w-28">
                  <defs>
                    <radialGradient id="moonGold" cx="35%" cy="30%" r="75%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="40%" stopColor="#fff4c2" />
                      <stop offset="75%" stopColor="#bfc728" />
                      <stop offset="100%" stopColor="#ddab3d" />
                    </radialGradient>

                    <filter id="moonGlow">
                      <feGaussianBlur stdDeviation="5" />
                    </filter>

                    <mask id="moonMask">
                      <rect width="120" height="120" fill="black" />
                      <circle cx="60" cy="60" r="48" fill="white" />
                      <circle
                        cx={
                          moonDay <= 15
                            ? 55 - ((moonDay - 1) / 14) * 155
                            : -100 + ((moonDay - 15) / 15) * 165
                        }
                        cy="60"
                        r="48"
                        fill="black"
                      />
                    </mask>
                  </defs>

                 

                  <g mask="url(#moonMask)">
                    <circle cx="60" cy="60" r="48" fill="url(#moonGold)" />

                    <circle
                      cx="39"
                      cy="48"
                      r="3"
                      fill="#b98536"
                      opacity="0.25"
                    />
                    <circle
                      cx="51"
                      cy="72"
                      r="4"
                      fill="#b98536"
                      opacity="0.2"
                    />
                    <circle
                      cx="27"
                      cy="68"
                      r="2"
                      fill="#fff5cf"
                      opacity="0.5"
                    />
                  </g>
                </svg>
              </div>
            )}
          </div>

        

          <p className="mb-3 text-sm font-medium uppercase tracking-[0.35em] text-amber-200">
            {isMorning ? "A Blessed Morning" : "A Peaceful Evening"}
          </p>

          <div className="mb-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">

  <button
    type="button"
    onClick={() => {
      setSelectedRamadanDay(1);
      setSelectedMonthOffset((prev) => prev - 1);
    }}
    className="justify-self-start rounded-full border border-amber-300 px-2 py-2 text-xs text-amber-200 transition hover:bg-amber-300 hover:text-[#183b70] sm:px-4 sm:text-sm"
  >
    ← Previous
  </button>

  <h1 className="text-center font-serif text-xl font-semibold tracking-wide text-[#f4d995] sm:text-3xl">
    {currentHijriMonthName}
    <span className="mt-1 flex justify-center gap-2 text-xs font-normal tracking-[0.15em] text-[#fff0c5] sm:text-base">
      <span>هجری قمری</span>
      {hijriYear}
    </span>
  </h1>

  <button
    type="button"
    onClick={() => {
      setSelectedRamadanDay(1);
      setSelectedMonthOffset((prev) => prev + 1);
    }}
    className="justify-self-end rounded-full border border-amber-300 px-2 py-2 text-xs text-amber-200 transition hover:bg-amber-300 hover:text-[#183b70] sm:px-4 sm:text-sm"
  >
    Next →
  </button>

</div>

         

          <div className="mx-auto mt-5 h-px w-48 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

          {hijriMonth === 9 && (
            <p className="mt-4 text-sm tracking-widest text-amber-100">
              MAY THIS HOLY MONTH BRING PEACE AND BLESSINGS
            </p>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-5 top-5 rounded-full border border-amber-400/40 p-2 text-amber-200 transition hover:bg-amber-400/20"
          >
            <X size={23} />
          </button>
        </div>
        {/* Calendar Content */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#f8f1df] p-3 sm:p-6">
          <div className="mb-8 text-center">
            <p className="text-amber-600">✦ ❖ ✦</p>

            {currentCity && (
              <p className="mt-2 text-base font-semibold text-[#9a7b43]">
                {currentCity}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-base font-semibold">
              <span className="mt-2 text-base font-bold text-[#183b70]">
                {todayLabels.hijri}
              </span>

              <span className="mt-2 text-base font-bold text-[#168477]">
                {todayLabels.shamsi}
              </span>

              <span className="fmt-2 text-base font-bold text-[#a36b28]">
                {todayLabels.miladi}
              </span>
            </div>

           
          </div>
          {calendarError && (
            <p className="mb-4 text-center text-red-600">{calendarError}</p>
          )}

          {calendarLoading && (
            <p className="mb-4 text-center text-[#8a7959]">
              Loading Ramadan prayer times...
            </p>
          )}
          <div className="overflow-hidden rounded-xl border-2 border-[#c49a45] shadow-lg">
            <div className="grid grid-cols-[1.6fr_1fr_1fr] bg-gradient-to-r from-[#030b18] to-[#183b55] p-2 text-center text-[10px] font-bold uppercase tracking-wide text-amber-200 sm:p-4 sm:text-sm sm:tracking-wider">
              <div>
                <div>{currentHijriMonthName}</div>
                <div className="mt-1 text-[9px] font-medium normal-case tracking-normal text-amber-100/80">
                  Hijri · Shamsi · Miladi
                </div>
              </div>
              <div className="flex items-center justify-center">
                {hijriMonth === 9 ? "سحور" : "فجر"}
              </div>

              <div className="flex items-center justify-center">
                {hijriMonth === 9 ? "افطار" : "مغرب"}
              </div>
            </div>

            <div>
              {ramadanSchedule.map((ramadanDay, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedRamadanDay(index + 1)}
                  style={{
                    cursor: "pointer",
                    outline:
                      selectedRamadanDay === index + 1
                        ? "2px solid #c49a45"
                        : "none",
                  }}
                 className={`grid grid-cols-[1.6fr_1fr_1fr] border-t border-amber-200 px-1 py-3 text-center text-xs transition-colors sm:px-3 sm:py-4 sm:text-sm ${
  ramadanDay.date === todayDateString
    ? "bg-[#f3dfaa] ring-2 ring-inset ring-[#c49a45] shadow-inner"
    : index % 2 === 0
      ? "bg-[#fffaf0]"
      : "bg-[#f3e8d0]"
}`}
                >
                  <div className="min-w-0 px-1 font-bold text-green-800">
                    {/* <div className="text-[26px]">{index + 1}</div> */}
                    <span className="font-semibold text-[#183b70]">
                      {getDateLabels(ramadanDay.date).weekday} ·{" "}
                      {getDateLabels(ramadanDay.date).hijri}
                    </span>

                    <div className="mt-2 flex flex-col items-center justify-center gap-1 text-[10px] font-medium sm:flex-row sm:gap-2 sm:text-xs">
                      <span className="text-[#c49a45]"></span>

                      <span className="font-semibold text-[#168477]">
                        {getDateLabels(ramadanDay.date).shamsi}
                      </span>

                      <span className="text-[#c49a45]"></span>

                      <span className="font-semibold text-[#a36b28]">
                        {getDateLabels(ramadanDay.date).miladi}
                      </span>
                    </div>
                  </div>

                  <div className="whitespace-nowrap font-semibold text-[#174b3a] text-xs sm:text-sm">
                    {ramadanDay.sehri
                      ? formatPrayerTime(ramadanDay.sehri)
                      : "--:--"}
                  </div>
                  <div className="whitespace-nowrap font-semibold text-[#b77932] text-xs sm:text-sm">
                    {ramadanDay.iftar
                      ? formatPrayerTime(ramadanDay.iftar)
                      : "--:--"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {hijriMonth === 9 && (
            <p className="mt-7 text-center font-serif text-sm text-green-800">
              ✧ May Allah accept your fasting and prayers ✧
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RamadanCalendar;
