
import { useEffect, useState } from "react";

const AnalogClock = ({ timezone, isRamadan = false }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone || "UTC",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hourCycle: "h23",
  }).formatToParts(time);

  const getPart = (type) =>
    Number(parts.find((part) => part.type === type)?.value || 0);

  const hours = getPart("hour");
  const minutes = getPart("minute");
  const seconds = getPart("second");

  const secondAngle = seconds * 6;
  const minuteAngle = minutes * 6 + seconds * 0.1;
  const hourAngle = (hours % 12) * 30 + minutes * 0.5;

  const dua = isRamadan
    ? {
        title: "Dua for Breaking the Fast",
        arabic:
          "ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ",
        transliteration:
          "Dhahaba adh-dhama'u wabtallatil-'urooqu wa thabatal-ajru in sha Allah.",
        translation:
          "The thirst has gone, the veins are moistened, and the reward is confirmed, if Allah wills.",
        reference: "Abu Dawud 2357",
      }
    : {
        title: "A Beautiful Daily Dua",
        arabic:
          "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
        transliteration:
          "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina adhaban-nar.",
        translation:
          "Our Lord, grant us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.",
        reference: "Quran 2:201",
      };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6">

  {isRamadan && (
        <div className="w-full text-center">
          <p className="mb-2 font-serif text-lg text-[#d9bd7c]">
            Dua for Breaking the Fast
          </p>
          <p
            dir="rtl"
            className="font-serif text-xl leading-relaxed text-[#fff1cf] sm:text-2xl"
          >
           {dua}
          </p>
        </div>
      )}
      {/* Large Classic Clock */}
      <div className="relative mx-auto aspect-square w-full max-w-[430px]">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#fff0a8] via-[#b78332] to-[#f8d77d] p-[9px] shadow-[0_15px_45px_rgba(0,0,0,0.35)]">
          <div className="h-full w-full rounded-full bg-gradient-to-br from-[#9b6825] via-[#f7d98a] to-[#8c5c1d] p-[5px]">
            <div className="h-full w-full overflow-hidden rounded-full border border-[#c5a46a] bg-gradient-to-br from-[#fffdf4] via-[#f6edda] to-[#e9d9ba] shadow-inner">
              <svg viewBox="0 0 400 400" className="h-full w-full">
                <defs>
                  <radialGradient id="classicClockFace">
                    <stop offset="0%" stopColor="#fffdf5" />
                    <stop offset="100%" stopColor="#eadbbd" />
                  </radialGradient>
                </defs>

                <circle
                  cx="200"
                  cy="200"
                  r="198"
                  fill="url(#classicClockFace)"
                />

                {/* Minute Markers */}
                {Array.from({ length: 60 }, (_, i) => (
                  <line
                    key={i}
                    x1="200"
                    y1="17"
                    x2="200"
                    y2={i % 5 === 0 ? "38" : "26"}
                    stroke="#392b1d"
                    strokeWidth={i % 5 === 0 ? "3" : "1.3"}
                    transform={`rotate(${i * 6} 200 200)`}
                  />
                ))}

                {/* Numbers */}
                {Array.from({ length: 12 }, (_, i) => {
                  const angle = (i * 30 - 90) * (Math.PI / 180);
                  const x = 200 + 151 * Math.cos(angle);
                  const y = 200 + 151 * Math.sin(angle);

                  return (
                    <text
                      key={i}
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#241b13"
                      fontFamily="Georgia, serif"
                      fontSize="35"
                    >
                      {i === 0 ? 12 : i}
                    </text>
                  );
                })}

                {/* Hour Hand */}
                <line
                  x1="200"
                  y1="214"
                  x2="200"
                  y2="112"
                  stroke="#241b13"
                  strokeWidth="11"
                  strokeLinecap="round"
                  transform={`rotate(${hourAngle} 200 200)`}
                />

                {/* Minute Hand */}
                <line
                  x1="200"
                  y1="215"
                  x2="200"
                  y2="65"
                  stroke="#302318"
                  strokeWidth="7"
                  strokeLinecap="round"
                  transform={`rotate(${minuteAngle} 200 200)`}
                />

                {/* Second Hand */}
                <line
                  x1="200"
                  y1="235"
                  x2="200"
                  y2="48"
                  stroke="#b47b2c"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  transform={`rotate(${secondAngle} 200 200)`}
                />

                {/* Gold Center */}
                <circle cx="200" cy="200" r="12" fill="#9c6b28" />
                <circle cx="200" cy="200" r="7" fill="#f8df99" />
                <circle cx="200" cy="200" r="3" fill="#6d471d" />
              </svg>
            </div>
          </div>
        </div>
      </div>

     
    </div>
  );
};

export default AnalogClock;
