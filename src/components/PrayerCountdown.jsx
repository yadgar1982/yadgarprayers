
import { useEffect, useState } from "react";

const PrayerCountdown = ({ prayerName, prayerTime, timezone }) => {
  const getRemainingTime = () => {
    if (!prayerTime || !timezone) return 0;

    const now = new Date();
    const timeMatch = prayerTime.match(/^(\d{1,2}):(\d{2})/);

    if (!timeMatch) return 0;

    const hours = Number(timeMatch[1]);
    const minutes = Number(timeMatch[2]);

    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });

    const getLocalParts = (date) => {
      const parts = formatter.formatToParts(date);

      return Object.fromEntries(
        parts
          .filter((part) => part.type !== "literal")
          .map((part) => [part.type, Number(part.value)])
      );
    };

    const getZonedDate = (year, month, day, hour, minute) => {
      const targetUTC = Date.UTC(year, month - 1, day, hour, minute);
      let guess = targetUTC;

      for (let i = 0; i < 3; i++) {
        const local = getLocalParts(new Date(guess));

        const representedUTC = Date.UTC(
          local.year,
          local.month - 1,
          local.day,
          local.hour,
          local.minute,
          local.second
        );

        guess += targetUTC - representedUTC;
      }

      return new Date(guess);
    };

    const today = getLocalParts(now);

    let prayerDate = getZonedDate(
      today.year,
      today.month,
      today.day,
      hours,
      minutes
    );

    if (prayerDate <= now) {
      const tomorrow = new Date(
        Date.UTC(today.year, today.month - 1, today.day + 1)
      );

      prayerDate = getZonedDate(
        tomorrow.getUTCFullYear(),
        tomorrow.getUTCMonth() + 1,
        tomorrow.getUTCDate(),
        hours,
        minutes
      );
    }

    return Math.max(0, Math.floor((prayerDate - now) / 1000));
  };

  const [remaining, setRemaining] = useState(getRemainingTime);

  useEffect(() => {
    setRemaining(getRemainingTime());

    const timer = setInterval(() => {
      setRemaining(getRemainingTime());
    }, 1000);

    return () => clearInterval(timer);
  }, [prayerTime, timezone]);

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  return (
    <div className="text-center">
      
      <div className="mt-2 flex items-center justify-center gap-3 font-serif text-4xl font-semibold tabular-nums text-[#f5dfa6] sm:text-5xl">
        <span>{String(hours).padStart(2, "0")}</span>
        <span>:</span>
        <span>{String(minutes).padStart(2, "0")}</span>
        <span>:</span>
        <span>{String(seconds).padStart(2, "0")}</span>
      </div>

    
    </div>
  );
};

export default PrayerCountdown;
