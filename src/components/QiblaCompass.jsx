
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

  return normalize(Math.atan2(y, x) * 180 / Math.PI);
}

function getDistance(lat, lon) {
  const R = 6371;
  const dLat = rad(KAABA.lat - lat);
  const dLon = rad(KAABA.lon - lon);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat)) *
      Math.cos(rad(KAABA.lat)) *
      Math.sin(dLon / 2) ** 2;

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
      <path
        d="M10 46 L60 74 L110 46"
        stroke="#EBCB72"
        strokeWidth="7"
      />

      <path
        d="M10 52 L60 80 L110 52"
        stroke="#B18A3C"
        strokeWidth="2"
      />

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

      <path
        d="M80 75 L89 70 V82 L80 88 Z"
        fill="#F2D58B"
      />
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
        {/* Compass points */}
        <g
          stroke="#D8F3DF"
          strokeWidth="1.5"
          strokeLinejoin="round"
        >
          <path
            d="M160 38 L177 144 L160 160 L143 144 Z"
            fill="#2FA65D"
          />
          <path
            d="M282 160 L176 177 L160 160 L176 143 Z"
            fill="#248F50"
          />
          <path
            d="M160 282 L143 176 L160 160 L177 176 Z"
            fill="#2FA65D"
          />
          <path
            d="M38 160 L144 143 L160 160 L144 177 Z"
            fill="#248F50"
          />
        </g>

        {/* Inner details */}
        <circle
          cx="160"
          cy="160"
          r="29"
          fill="#319E5B"
          fillOpacity=".25"
          stroke="#299653"
          strokeWidth="2"
        />

        {/* Center pivot */}
        <circle
          cx="160"
          cy="160"
          r="11"
          fill="#39D45E"
          stroke="white"
          strokeWidth="3"
        />

        {/* Cardinal directions */}
        <g
          fontSize="17"
          fontWeight="bold"
          textAnchor="middle"
          fill="#E33B42"
        >
          <text x="160" y="24">N</text>
          <text x="297" y="166">E</text>
          <text x="160" y="307">S</text>
          <text x="23" y="166">W</text>
        </g>
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
        <div
          className="absolute left-0 top-0"
          style={{
            transform: "translate(-50%, -50%) translateY(-100px)",
          }}
        >
          <div
            className="flex h-[65px] w-[65px] items-center justify-center rounded-xl border-2 border-amber-400 bg-white shadow-[0_5px_15px_rgba(0,0,0,0.25)]"
            style={{
              transform: `rotate(${-angle}deg)`,
            }}
          >
            <Kaaba size={59} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QiblaCompass() {
  const [location, setLocation] = useState(null);
  const [heading, setHeading] = useState(null);
  const [qibla, setQibla] = useState(null);
  const [distance, setDistance] = useState(null);
  const [error, setError] = useState("");
  const [active, setActive] = useState(false);

  const listenerRef = useRef(null);
  const eventRef = useRef(null);

  // Live location
  useEffect(() => {
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
      },
     (error) => {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      setError("Location permission denied. Please allow location access in iPhone Settings.");
      break;
    case error.POSITION_UNAVAILABLE:
      setError("Your location is unavailable. Check your GPS settings.");
      break;
    case error.TIMEOUT:
      setError("Location request timed out. Please try again.");
      break;
    default:
      setError("Unable to detect your location.");
  }
},
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 20000,
      }
    );

    return () => navigator.geolocation.clearWatch(watch);
  }, []);

  // Enable orientation sensor
  const enableCompass = async () => {
    setError("");

    try {
      if (!window.DeviceOrientationEvent) {
        throw new Error("Compass sensor is unavailable.");
      }

      if (
        typeof DeviceOrientationEvent.requestPermission === "function"
      ) {
        const result =
          await DeviceOrientationEvent.requestPermission();

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

  useEffect(() => {
    return () => {
      if (listenerRef.current && eventRef.current) {
        window.removeEventListener(
          eventRef.current,
          listenerRef.current,
          true
        );
      }
    };
  }, []);

  // Relative Qibla direction
  const relativeQibla =
    heading !== null && qibla !== null
      ? normalize(qibla - heading)
      : qibla ?? 0;

  const aligned =
    heading !== null &&
    qibla !== null &&
    Math.min(
      normalize(qibla - heading),
      normalize(heading - qibla)
    ) <= 5;

  return (
    <div className="mx-auto flex min-h-[90vh] w-full max-w-md flex-col overflow-x-hidden bg-gradient-to-b from-white to-emerald-50 px-4 py-3 sm:min-h-0 sm:rounded-3xl sm:border sm:border-emerald-100 sm:p-5 sm:shadow-xl">

      {/* Header */}
      <div className="mb-3 shrink-0 text-center">
        <p className="text-xs font-bold tracking-[3px] text-emerald-700">
          ISLAMIC COMPASS
        </p>

        <h2 className="mt-2 text-2xl font-bold text-emerald-950">
          Qibla Direction
        </h2>

      
      </div>

      {/* Main compass */}
     <div className="relative mx-auto aspect-square w-full max-w-[270px] shrink-0 sm:max-w-[310px]">

        {/* Outer border */}
        <div className="absolute inset-0 rounded-full border-[9px] border-emerald-700 bg-white shadow-lg">
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
          {qibla !== null && (
            <QiblaMarker angle={relativeQibla} />
          )}
        </div>
      </div>

      {/* Qibla status */}
      <div className="mt-5 rounded-xl bg-emerald-100 p-3 text-center">
        {aligned ? (
          <p className="font-bold text-emerald-800">
            ✓ You are facing Qibla
          </p>
        ) : heading !== null && qibla !== null ? (
          <p className="text-sm font-medium text-emerald-900">
            Rotate your phone until the Kaaba reaches the top ↑
          </p>
        ) : (
          <p className="text-sm text-gray-600">
            Enable your compass to find Qibla
          </p>
        )}
      </div>

      {/* Details */}
     <div className="mt-3 grid shrink-0 grid-cols-2 gap-2">
        <div className="rounded-xl border border-emerald-100 bg-white p-4 text-center">
          <p className="text-[10px] font-bold text-gray-400">
            QIBLA BEARING
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-800">
            {qibla !== null ? `${qibla.toFixed(1)}°` : "--"}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-white p-4 text-center">
          <p className="text-[10px] font-bold text-gray-400">
            DISTANCE TO MAKKAH
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-800">
            {distance !== null
              ? Math.round(distance).toLocaleString()
              : "--"}
          </p>
          <p className="text-xs text-gray-400">Kilometers</p>
        </div>
      </div>

      {/* Location */}
      <div className="mt-3 rounded-xl bg-white p-3 text-xs text-gray-500">
        {location ? (
          <>
            <p className="font-semibold text-emerald-800">
              Current location
            </p>
            <p className="mt-1">
              {location.latitude.toFixed(5)},{" "}
              {location.longitude.toFixed(5)}
            </p>
          </>
        ) : (
          "Detecting location..."
        )}
      </div>

      {/* Heading */}
      <div className="mt-3 flex justify-between rounded-xl bg-white p-3 text-sm">
        <span className="text-gray-500">Device heading</span>
        <strong className="text-emerald-800">
          {heading !== null ? `${heading.toFixed(1)}°` : "--"}
        </strong>
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Button */}
     <button
  onClick={enableCompass}
  disabled={active}
  className="mt-3 w-full shrink-0 rounded-xl bg-emerald-700 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-800 disabled:opacity-60"
>
  {active ? "Compass Activated" : "Enable Live Compass"}
</button>

      <p className="mt-3 text-center text-xs text-gray-400">
        Keep your phone flat and away from magnetic objects.
      </p>
    </div>
  );
}
