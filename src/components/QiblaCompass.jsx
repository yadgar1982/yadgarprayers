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
    <div className="qibla-panel relative mx-auto flex h-full max-h-[calc(100dvh-32px)] w-full max-w-md flex-col overflow-hidden rounded-[28px] px-4 py-3 sm:rounded-3xl sm:p-4">



{/* Decorative Mosque Skyline */}

<svg
  className="qibla-skyline pointer-events-none absolute bottom-[75px] left-0 z-0 h-[125px] w-full"
  viewBox="0 0 420 125"
  preserveAspectRatio="none"
  aria-hidden="true"
>
  {/* Background landscape */}
  <path
    d="M0 100 Q80 72 150 98 T300 90 T420 98 V125 H0Z"
    fill="#08718a"
    opacity=".35"
  />

  {/* Back minarets */}
  <g fill="#164d68">
    <path d="M35 105 V45 H39 V35 H43 V45 H47 V105Z" />
    <path d="M31 48 H51 L41 27Z" />
    <path d="M33 65 H49 V69 H33Z" />

    <path d="M370 105 V38 H374 V27 H378 V38 H382 V105Z" />
    <path d="M366 40 H386 L376 18Z" />
    <path d="M368 60 H384 V64 H368Z" />
  </g>

  {/* Main mosque body */}
  <g fill="#06364f">

    {/* Main building */}
    <path d="
      M95 110
      V86
      Q110 77 125 86
      V75
      Q160 65 195 75
      V110Z
    " />

    {/* Central dome */}
    <path d="
      M135 76
      C135 53 151 31 165 31
      C179 31 195 53 195 76
      Z
    " />

    {/* Dome base */}
    <path d="M130 75 H200 V81 H130Z" />

    {/* Small dome left */}
    <path d="
      M85 86
      C85 70 96 57 108 57
      C120 57 130 70 130 86Z
    " />

    {/* Small dome right */}
    <path d="
      M200 86
      C200 70 211 57 223 57
      C235 57 245 70 245 86Z
    " />

    {/* Side wings */}
    <path d="M65 110 V94 Q85 80 105 94 V110Z" />
    <path d="M225 110 V94 Q245 80 265 94 V110Z" />

    {/* Main entrance arch */}
    <path d="
      M148 110
      V97
      A17 17 0 0 1 182 97
      V110Z
    " fill="#021f34" />

    {/* Side arched windows */}
    <path d="
      M108 105 V96
      A7 7 0 0 1 122 96
      V105Z
    " fill="#021f34" />

    <path d="
      M208 105 V96
      A7 7 0 0 1 222 96
      V105Z
    " fill="#021f34" />
  </g>

  {/* Main minarets */}
  <g fill="#082e47">
    <path d="
      M265 110
      V42 H270 V35 H274 V42 H279 V110Z
    " />
    <path d="M261 45 H283 L272 22Z" />
    <path d="M263 62 H281 V67 H263Z" />
    <path d="M263 82 H281 V86 H263Z" />

    <path d="
      M320 110
      V51 H325 V44 H329 V51 H334 V110Z
    " />
    <path d="M316 53 H338 L327 30Z" />
    <path d="M318 71 H336 V76 H318Z" />
  </g>

  {/* Dome crescent and finials */}
  <g fill="#d9e6ee">
    <path d="M165 31 V17 H167 V31Z" />
    <path d="
      M159 17
      A6 6 0 1 0 170 12
      A5 5 0 1 1 159 17
    " />
    <path d="M108 57 V49 H110 V57Z" />
    <path d="M223 57 V49 H225 V57Z" />
    <path d="M272 22 V13 H274 V22Z" />
    <path d="M327 30 V21 H329 V30Z" />
  </g>

  {/* Decorative dome ribs */}
  <g
    fill="none"
    stroke="#6b9caf"
    strokeWidth="1"
    opacity=".55"
  >
    <path d="M165 35 Q150 53 150 75" />
    <path d="M165 35 Q180 53 180 75" />
  </g>

  {/* Foreground landscape */}
  <path
    d="
      M0 111
      Q60 94 110 108
      Q180 120 240 106
      Q330 91 420 108
      V125 H0Z
    "
    fill="#022b43"
  />
</svg>




{/* Madina-inspired Islamic architectural decoration */}
<div className="mb-0 flex justify-center">
<div className="relative flex h-[65px] w-[200px] items-end justify-center">

  
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


{/* Live Compass Toggle */}
<div className="absolute left-4 top-3 z-50 flex items-center gap-2">
  <span className="text-[10px] font-semibold tracking-wide text-zinc-100">
    Enable Compass
  </span>

  <button
    type="button"
    role="switch"
    aria-label="Live compass"
    aria-checked={active}
    onClick={() => {
      if (active) {
        disableCompass();
      } else {
        enableCompass();
      }
    }}
    className={`relative h-5 w-9 rounded-full transition-colors duration-300 ${
      active ? "bg-emerald-700" : "bg-zinc-300"
    }`}
  >
    <span
      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-300 ${
        active ? "left-[18px]" : "left-0.5"
      }`}
    />
  </button>
</div>

   
    


{/* Qibla Status */}
<div className="relative z-10 mb-2 rounded-xl p-2 text-center">
  {aligned ? (
  <div className="relative mx-auto flex w-fit items-center justify-center gap-3 overflow-hidden rounded-full border border-emerald-300/70 bg-gradient-to-r from-emerald-950 via-emerald-700 to-emerald-950 px-5 py-2 shadow-[0_0_18px_rgba(16,185,129,0.45),inset_0_1px_5px_rgba(255,255,255,0.3)]">

    {/* Shiny highlight */}
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-transparent" />

    <span className="relative animate-pulse text-lg font-bold text-emerald-200">
      ››
    </span>

    <div className="relative flex items-center justify-center rounded-full border border-amber-300/60 bg-emerald-900/80 p-1 shadow-[0_0_12px_rgba(250,204,21,0.45)]">
      <Kaaba size={35} />
    </div>


    <span className="relative animate-pulse text-lg font-bold text-emerald-200">
      ‹‹
    </span>
  </div>
) : heading !== null && qibla !== null ? (
  <p className="text-sm font-medium text-white">
    ↑ Rotate your phone to face Qibla
  </p>
) : (
  <p className="text-sm font-medium text-white">
    Enable your compass to find Qibla
  </p>
)}
</div>

{/* Quranic Calligraphy - Always Visible */}
<div className="qibla-verse relative z-10 mb-3 w-full shrink-0">
  <img
    src="/asset/qibla.png"
    alt="Quranic Qibla verse"
    className="block  w-full rounded-xl object-contain"
  />
</div>



      {/* Main compass */}
      <div className="relative z-10 mx-auto aspect-square w-full max-w-[320px] shrink-0">
        {/* Outer border */}
        <div className="absolute inset-0 rounded-full border-[9px] border-zinc-200 bg-gradient-to-br from-white via-zinc-100 to-zinc-400 shadow-[0_3px_8px_rgba(0,0,0,0.25),inset_0_2px_4px_rgba(255,255,255,0.9)]">
          <div className="absolute inset-[5px] rounded-full border-2 border-slate-100" />

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
      

{/* Centered Qibla Details */}
<div className="relative z-10 mt-2 flex w-full shrink-0 justify-center">
  <div className="qibla-info mx-auto w-fit rounded-2xl px-4 py-2">
    <div className="grid grid-cols-2 divide-x divide-slate-100">

      {/* Qibla Bearing */}
      <div className="px-3 text-center">
        <p className="text-[9px] font-semibold leading-tight tracking-wide text-zinc-400">
          QIBLA BEARING
        </p>
        <p className="mt-0.5 text-lg font-bold tabular-nums text-slate-800">
          {qibla !== null ? `${qibla.toFixed(1)}°` : "--"}
        </p>
      </div>

      {/* Distance to Makkah */}
      <div className="px-3 text-center">
        <p className="text-[9px] font-semibold leading-tight tracking-wide text-zinc-400">
          Dis-to-Makkah
        </p>
        <p className="mt-0.5 text-lg font-bold tabular-nums text-emerald-800">
          {distance !== null ? Math.round(distance).toLocaleString() : "--"}
        </p>
        <p className="text-[9px] leading-tight text-zinc-400">
          Kilometers
        </p>
      </div>

    </div>
  </div>
</div>


{/* Footer Message */}
<div className="mt-3 rounded-xl border border-emerald-100/70 bg-gradient-to-br from-emerald-50/80 via-white to-amber-50/40 px-3 py-3 text-center shadow-sm">

  <p className="text-xs font-medium leading-relaxed text-emerald-800">
    Let every prayer bring you closer to Allah.
  </p>

 

</div>


    
      {error && (
        <p className="mt-3 rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">
          {error}
        </p>
      )}


    
    </div>
  );
}
