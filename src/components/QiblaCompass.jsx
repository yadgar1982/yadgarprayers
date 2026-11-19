import React, { useEffect, useRef, useState } from "react";

const KAABA = { lat: 21.4225, lon: 39.8262 };

const rad = (v) => (v * Math.PI) / 180;
const normalize = (v) => ((v % 360) + 360) % 360;

function getQibla(lat, lon) {
  const lat1 = rad(lat);
  const lat2 = rad(KAABA.lat);
  const dLon = rad(KAABA.lon - lon);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  return normalize((Math.atan2(y, x) * 180) / Math.PI);
}

function getDistance(lat, lon) {
  const R = 6371;
  const dLat = rad(KAABA.lat - lat);
  const dLon = rad(KAABA.lon - lon);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat)) * Math.cos(rad(KAABA.lat)) * Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Detailed Kaaba illustration
function Kaaba({ size = 58 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      {/* Top */}
      <path
        d="M10 35 L59 8 L110 35 L60 63 Z"
        fill="#303030"
        stroke="#D6B45D"
        strokeWidth="2"
      />

      {/* Left face */}
      <path
        d="M10 35 L60 63 V108 L10 80 Z"
        fill="#080808"
        stroke="#C8A34F"
        strokeWidth="2"
      />

      {/* Right face */}
      <path
        d="M60 63 L110 35 V80 L60 108 Z"
        fill="#181818"
        stroke="#C8A34F"
        strokeWidth="2"
      />

      {/* Gold Kiswah belt */}
      <path d="M10 46 L60 74 L110 46" stroke="#EBCB72" strokeWidth="7" />

      <path d="M10 52 L60 80 L110 52" stroke="#B18A3C" strokeWidth="2" />

      {/* Decorative gold embroidery */}
      <path
        d="M25 53 L25 59 M34 58 L34 64 M43 63 L43 69"
        stroke="#F4DA91"
        strokeWidth="2"
      />

      {/* Golden door */}
      <path
        d="M74 73 L95 62 V85 L74 97 Z"
        fill="#B98D38"
        stroke="#F5D88B"
        strokeWidth="2"
      />

      <path d="M80 75 L89 70 V82 L80 88 Z" fill="#F2D58B" />
    </svg>
  );
}

// Four-direction compass rose

function CompassRose({ heading }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        transform: `rotate(${-heading}deg)`,
        transition: "transform 180ms linear",
      }}
    >
      <svg viewBox="0 0 320 320" className="h-full w-full">
        <defs>
          <radialGradient id="compassFace">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="75%" stopColor="#f1f1ed" />
            <stop offset="100%" stopColor="#d5d5d0" />
          </radialGradient>

          <linearGradient id="metalRing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#777777" />
            <stop offset="25%" stopColor="#ffffff" />
            <stop offset="55%" stopColor="#888888" />
            <stop offset="80%" stopColor="#eeeeee" />
            <stop offset="100%" stopColor="#666666" />
          </linearGradient>
        </defs>

        {/* Metallic compass rings */}
        <circle cx="160" cy="160" r="155" fill="url(#metalRing)" />
        <circle cx="160" cy="160" r="150" fill="#555555" />
        <circle cx="160" cy="160" r="145" fill="url(#metalRing)" />
        <circle cx="160" cy="160" r="139" fill="url(#compassFace)" />

        {/* Inner silver border */}
        <circle
          cx="160"
          cy="160"
          r="133"
          fill="none"
          stroke="#777777"
          strokeWidth="1.5"
        />

        {/* Degree markings */}
        {Array.from({ length: 360 }, (_, i) => {
          const angle = (i * Math.PI) / 180;
          const major = i % 15 === 0;
          const medium = i % 5 === 0;

          const outer = 130;
          const inner = major ? 113 : medium ? 119 : 125;

          return (
            <line
              key={i}
              x1={160 + Math.sin(angle) * outer}
              y1={160 - Math.cos(angle) * outer}
              x2={160 + Math.sin(angle) * inner}
              y2={160 - Math.cos(angle) * inner}
              stroke="#292929"
              strokeWidth={major ? 1.5 : medium ? 0.9 : 0.45}
            />
          );
        })}

        {/* Degree numbers */}
        {Array.from({ length: 24 }, (_, i) => {
          const angle = (i * 15 * Math.PI) / 180;
          const value = i * 15;

          return (
            <text
              key={value}
              x={160 + Math.sin(angle) * 104}
              y={160 - Math.cos(angle) * 104}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="9"
              fontWeight="600"
              fill="#292929"
            >
              {value}
            </text>
          );
        })}

        {/* Inner decorative compass circles */}
        <circle
          cx="160"
          cy="160"
          r="76"
          fill="none"
          stroke="#999999"
          strokeWidth="1.5"
        />
        <circle
          cx="160"
          cy="160"
          r="62"
          fill="none"
          stroke="#aaaaaa"
          strokeWidth="1"
        />
        <circle
          cx="160"
          cy="160"
          r="45"
          fill="none"
          stroke="#c0c0c0"
          strokeWidth="1"
        />

        {/* Four-direction decorative compass rose */}
        <g stroke="#777777" strokeWidth="1" strokeLinejoin="round">
          <path d="M160 82 L170 150 L160 160 L150 150 Z" fill="#d4d4d4" />
          <path d="M238 160 L170 170 L160 160 L170 150 Z" fill="#eeeeee" />
          <path d="M160 238 L150 170 L160 160 L170 170 Z" fill="#d4d4d4" />
          <path d="M82 160 L150 150 L160 160 L150 170 Z" fill="#eeeeee" />
        </g>

        {/* Cardinal directions */}
        <g fontSize="15" fontWeight="bold" textAnchor="middle" fill="#222222">
          <text x="160" y="72">
            N
          </text>
          <text x="248" y="165">
            E
          </text>
          <text x="160" y="260">
            S
          </text>
          <text x="72" y="165">
            W
          </text>
        </g>

        {/* Center pivot */}
        <circle cx="160" cy="160" r="12" fill="#555555" />
        <circle cx="160" cy="160" r="8" fill="url(#metalRing)" />
        <circle cx="160" cy="160" r="3" fill="#333333" />
      </svg>
    </div>
  );
}

// Kaaba moves independently around the compass
function QiblaMarker({ angle }) {
  return (
    <div
      className="absolute inset-0 z-30 pointer-events-none"
      style={{
        transform: `rotate(${angle}deg)`,
        transition: "transform 180ms linear",
      }}
    >
      <div className="absolute left-1/2 top-1/2">
        {/* Green Qibla handle — rotates together with the Kaaba */}
        <div
          className="absolute left-1/2 top-0 z-0 h-[80px] w-[15px] -translate-x-1/2 -translate-y-full rounded-full"
          style={{
            background:
              "linear-gradient(to top, #7a4b08 0%, #c58a20 18%, #d6bb33 38%, #d4a12e 52%,  #b87913 85%, #f5d77e 100%)",
            boxShadow: "0 1px 5px rgba(150, 123, 5, 0.45)",
            clipPath: "polygon(50% 0%, 100% 15%, 70% 100%, 30% 100%, 0% 15%)",
          }}
        />
        <div
          className="absolute left-0 top-0"
          style={{
            transform: "translate(-50%, -50%) translateY(-100px)",
          }}
        >
          <div
            className="flex !h-[58px] !w-[42px] items-center justify-center"
            style={{
              transform: `rotate(${-angle}deg)`,
            }}
          >
            <Kaaba size={58} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QiblaCompass({ coordinates, cityName }) {
  const [location, setLocation] = useState(null);
  const [heading, setHeading] = useState(null);
  const [qibla, setQibla] = useState(null);
  const [distance, setDistance] = useState(null);
  const [error, setError] = useState("");
  const [active, setActive] = useState(false);

  const listenerRef = useRef(null);
  const eventRef = useRef(null);

  // Use selected city coordinates first; otherwise detect device GPS
  useEffect(() => {
    // Selected city coordinates take priority
    if (
      coordinates &&
      Number.isFinite(Number(coordinates.latitude)) &&
      Number.isFinite(Number(coordinates.longitude))
    ) {
      const latitude = Number(coordinates.latitude);
      const longitude = Number(coordinates.longitude);

      setLocation({ latitude, longitude });
      setQibla(getQibla(latitude, longitude));
      setDistance(getDistance(latitude, longitude));
      setError("");

      return;
    }

    // Fall back to the phone's GPS location
    if (!navigator.geolocation) {
      setError("Location is not supported by your browser.");
      return;
    }

    const watch = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const { latitude, longitude } = coords;

        setLocation({ latitude, longitude });
        setQibla(getQibla(latitude, longitude));
        setDistance(getDistance(latitude, longitude));
        setError("");
      },
      (err) => {
        if (err.code === 1) {
          setError("Please allow location access.");
        } else if (err.code === 2) {
          setError("Your location is unavailable.");
        } else if (err.code === 3) {
          setError("Location request timed out.");
        } else {
          setError("Unable to detect your location.");
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 20000,
      },
    );

    return () => navigator.geolocation.clearWatch(watch);
  }, [coordinates?.latitude, coordinates?.longitude]);
  // Enable orientation sensor
  const enableCompass = async () => {
    setError("");

    try {
      if (!window.DeviceOrientationEvent) {
        throw new Error("Compass sensor is unavailable.");
      }

      if (typeof DeviceOrientationEvent.requestPermission === "function") {
        const result = await DeviceOrientationEvent.requestPermission();

        if (result !== "granted") {
          throw new Error("Motion permission was denied.");
        }
      }

      if (listenerRef.current) return;

      const eventName =
        "ondeviceorientationabsolute" in window
          ? "deviceorientationabsolute"
          : "deviceorientation";

      const handler = (event) => {
        let value = null;

        if (typeof event.webkitCompassHeading === "number") {
          value = event.webkitCompassHeading;
        } else if (typeof event.alpha === "number") {
          value = normalize(360 - event.alpha);
        }

        if (value !== null) {
          setHeading(normalize(value));
        }
      };

      listenerRef.current = handler;
      eventRef.current = eventName;

      window.addEventListener(eventName, handler, true);
      setActive(true);
    } catch (err) {
      setError(err.message || "Unable to activate compass.");
    }
  };

  // Disable live compass and remove its sensor listener
const disableCompass = () => {
  if (listenerRef.current && eventRef.current) {
    window.removeEventListener(
      eventRef.current,
      listenerRef.current,
      true
    );
  }

  listenerRef.current = null;
  eventRef.current = null;

  setActive(false);
  setHeading(null);
};

  useEffect(() => {
    return () => {
      if (listenerRef.current && eventRef.current) {
        window.removeEventListener(eventRef.current, listenerRef.current, true);
      }
    };
  }, []);

  // Relative Qibla direction
  const relativeQibla =
    heading !== null && qibla !== null
      ? normalize(qibla - heading)
      : (qibla ?? 0);

  const aligned =
    heading !== null &&
    qibla !== null &&
    Math.min(normalize(qibla - heading), normalize(heading - qibla)) <= 5;

  return (
    <div className="relative mx-auto flex h-full max-h-[calc(100dvh-32px)] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-gradient-to-b from-white to-emerald-50 px-4 py-3 sm:rounded-3xl sm:border sm:border-emerald-100 sm:p-4">



{/* Madina-inspired Islamic architectural decoration */}
<div className="mb-0 flex justify-center">
<div className="relative flex h-[100px] w-[200px] items-end justify-center">

  
{/* Realistic Madinah-inspired green mosque dome */}
<div className="absolute left-1/2 top-[0px] z-10 h-[48px] w-[76px] -translate-x-1/2">

  {/* Golden crescent and finial */}
  <div className="absolute left-1/2 top-0 flex -translate-x-1/2 flex-col items-center">
    <span className="text-[15px] leading-none text-amber-400 drop-shadow-[0_1px_2px_rgba(120,70,10,0.5)]">
      ☾
    </span>
    <div className="h-[8px] w-[2px] bg-gradient-to-b from-yellow-200 to-amber-700" />
  </div>

  {/* Dome body */}
  <div
    className="absolute bottom-0 left-1/2 h-[25px] w-[48px] -translate-x-1/2 overflow-hidden border border-emerald-950/50"
    style={{
      borderRadius: "50% 50% 8% 8% / 85% 85% 10% 10%",
      background:
        "linear-gradient(100deg, #06452f 0%, #08764d 22%, #39a779 43%, #08764d 67%, #033d2a 100%)",
      boxShadow:
        "inset 4px 0 5px rgba(255,255,255,0.2), inset -4px 0 6px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.25)",
    }}
  >
    {/* Curved dome highlight */}
    <div className="absolute left-[9px] top-[3px] h-[17px] w-[9px] rounded-full bg-white/20 blur-[3px]" />

    {/* Decorative golden detail */}
    <div className="absolute bottom-0 left-1/2 h-[2px] w-8 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-700 via-yellow-200 to-amber-700" />
  </div>

  {/* Golden dome base */}
  <div className="absolute bottom-[-2px] left-1/2 h-[4px] w-[54px] -translate-x-1/2 rounded-full border border-amber-200 bg-gradient-to-r from-amber-700 via-yellow-200 to-amber-700 shadow-sm" />
</div>

  </div>
</div>


      {/* Location */}
      <div className="mb-3  bg-white p-3 text-center text-sm font-semibold text-emerald-800 ">
        {location ? (
          <>
            <p className="font-semibold text-emerald-800">
              {cityName || "Current Location"}
            </p>
          </>
        ) : (
          "Detecting location..."
        )}
      </div>

           {/* Live Compass ON/OFF */}
<div className="absolute left-5 top-3 z-50">
  <button
    type="button"
    role="switch"
    aria-label="Activate live compass"
    aria-checked={active}
    onClick={() => {
      if (active) {
        disableCompass();
      } else {
        enableCompass();
      }
    }}
  className={`relative h-6 w-11 rounded-full shadow-inner transition-colors duration-300 ${
  active ? "bg-emerald-600" : "bg-zinc-300"
}`}
  >
   <span
 className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-md transition-all duration-300 ${
  active ? "left-6" : "left-1"
}`}
/>
  </button>
</div>
      {/* Header */}
      <div className="mb-3 shrink-0 text-center">
        <p className="text-xs font-bold tracking-[3px] text-emerald-700">
          ISLAMIC COMPASS
        </p>

        <h2 className="mt-2 text-2xl font-extrabold tracking-wide text-zinc-500 [text-shadow:0_1px_0_#fff,0_2px_1px_rgba(0,0,0,0.25)]">
          Qibla Direction
        </h2>
      </div>

      {/* Main compass */}
      <div className="relative mx-auto aspect-square w-full max-w-[270px] shrink-0 sm:max-w-[310px]">
        {/* Outer border */}
        <div className="absolute inset-0 rounded-full border-[9px] border-zinc-200 bg-gradient-to-br from-white via-zinc-100 to-zinc-400 shadow-[0_3px_8px_rgba(0,0,0,0.25),inset_0_2px_4px_rgba(255,255,255,0.9)]">
          <div className="absolute inset-[5px] rounded-full border-2 border-emerald-100" />

          {/* Degree marks */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "repeating-conic-gradient(#527a69 0deg 1deg, transparent 1deg 15deg)",
              maskImage:
                "radial-gradient(transparent 0 91%, black 92% 94%, transparent 95%)",
              WebkitMaskImage:
                "radial-gradient(transparent 0 91%, black 92% 94%, transparent 95%)",
            }}
          />

          {/* Rotating cardinal compass */}
          <CompassRose heading={heading ?? 0} />

          {/* Independent Kaaba object */}
          {qibla !== null && <QiblaMarker angle={relativeQibla} />}
        </div>
      </div>
        {/* Details */}
      <div className="mt-3 grid shrink-0 grid-cols-2 gap-2">
        <div className="relative overflow-hidden rounded-xl border border-emerald-100 border-t-2 border-t-zinc-200 bg-white p-4 text-center shadow-sm">
          <p className="text-[10px] font-bold text-gray-400">QIBLA BEARING</p>
          <p className="mt-2 text-2xl font-bold text-emerald-800">
            {qibla !== null ? `${qibla.toFixed(1)}°` : "--"}
          </p>
        </div>

       <div className="relative overflow-hidden rounded-xl border border-emerald-100 border-t-2 border-t-zinc-200 bg-white p-4 text-center shadow-sm">
          <p className="text-[10px] font-bold text-gray-400">
            DISTANCE TO MAKKAH
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-800">
            {distance !== null ? Math.round(distance).toLocaleString() : "--"}
          </p>
          <p className="text-xs text-gray-400">Kilometers</p>
        </div>
      </div>


      {/* Qibla status */}
     <div className="mt-4 rounded-xl border border-emerald-100 bg-gradient-to-r from-white via-emerald-50 to-white p-3 text-center shadow-sm">
        {aligned ? (
          <p className="flex items-center justify-center gap-2 rounded-xl border border-amber-300/60 bg-gradient-to-r from-zinc-950 via-zinc-800 to-zinc-950 px-3 py-3 text-center text-sm font-bold tracking-wide text-amber-200 shadow-[0_3px_12px_rgba(6,78,59,0.2)]">
            <Kaaba size={26} />
            <span>You are facing the Holy Kaaba.</span>
          </p>
        ) : heading !== null && qibla !== null ? (
          <p className="text-sm font-medium text-emerald-900">
            Rotate your phone until face Kaaba ↑
          </p>
        ) : (
          <p className="text-sm text-gray-600">
            Enable your compass to find Qibla
          </p>
        )}
      </div>

    
  

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">
          {error}
        </p>
      )}


     <p className="mt-2 pb-1 text-center text-xs text-gray-400">
  Keep your phone flat and away from magnetic objects.
</p>
    </div>
  );
}
