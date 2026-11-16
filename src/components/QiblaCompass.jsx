
import { useEffect, useState, useCallback } from "react";
import {
  Compass,
  MapPin,
  LocateFixed,
  AlertCircle,
} from "lucide-react";

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

function calculateQiblaBearing(latitude, longitude) {
  const lat1 = (latitude * Math.PI) / 180;
  const lat2 = (KAABA_LAT * Math.PI) / 180;
  const deltaLng = ((KAABA_LNG - longitude) * Math.PI) / 180;

  const y = Math.sin(deltaLng);
  const x =
    Math.cos(lat1) * Math.tan(lat2) -
    Math.sin(lat1) * Math.cos(deltaLng);

  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

export default function QiblaCompass() {
  const [location, setLocation] = useState(null);
  const [bearing, setBearing] = useState(null);
  const [heading, setHeading] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sensorEnabled, setSensorEnabled] = useState(false);

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setLocation({ latitude, longitude });
        setBearing(calculateQiblaBearing(latitude, longitude));
        setLoading(false);
      },
      (err) => {
        setLoading(false);

        if (err.code === 1) {
          setError(
            "Location permission was denied. Please allow location access."
          );
        } else if (err.code === 2) {
          setError("Your current location could not be determined.");
        } else {
          setError("Location request timed out. Please try again.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  }, []);

  const enableCompass = async () => {
    setError("");

    try {
      // Request permission on iPhone Safari when required.
      if (
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function"
      ) {
        const permission =
          await DeviceOrientationEvent.requestPermission();

        if (permission !== "granted") {
          setError(
            "Compass permission was not granted. Please allow motion and orientation access."
          );
          return;
        }
      }

      if (typeof DeviceOrientationEvent === "undefined") {
        setError("Your browser does not support a device compass.");
        return;
      }

      setSensorEnabled(true);
    } catch (err) {
      setError(
        "Unable to access the compass. Please check your device permissions."
      );
    }
  };

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  useEffect(() => {
    if (!sensorEnabled) return;

    const handleOrientation = (event) => {
      let direction = null;

      // iPhone Safari provides a compass heading directly.
      if (typeof event.webkitCompassHeading === "number") {
        direction = event.webkitCompassHeading;
      }
      // Use alpha only when the browser confirms absolute orientation.
      else if (
        event.absolute === true &&
        typeof event.alpha === "number"
      ) {
        direction = 360 - event.alpha;
      }

      if (direction !== null && Number.isFinite(direction)) {
        setHeading((direction + 360) % 360);
      }
    };

    window.addEventListener("deviceorientation", handleOrientation);
    window.addEventListener(
      "deviceorientationabsolute",
      handleOrientation
    );

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
      window.removeEventListener(
        "deviceorientationabsolute",
        handleOrientation
      );
    };
  }, [sensorEnabled]);

  const compassRotation =
    bearing !== null && heading !== null
      ? bearing - heading
      : bearing ?? 0;

  const dialRotation = heading !== null ? -heading : 0;

  return (
    <section className="mx-auto w-full max-w-2xl rounded-2xl border border-[#c5a45e]/60 bg-gradient-to-b from-[#fffdf6] to-[#f5efdf] p-5 shadow-lg sm:p-7">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[#c5a45e]/60 bg-[#174b3a] text-[#e8c879]">
          <Compass size={25} strokeWidth={1.5} />
        </div>

        <h2 className="font-serif text-2xl font-semibold text-[#174b3a]">
          Qibla Direction
        </h2>

        <p className="mt-1 text-sm text-[#927d5c]">
          Find the direction of the Holy Kaaba
        </p>
      </div>

      <div className="mt-7 flex justify-center">
        <div className="relative flex h-64 w-64 items-center justify-center rounded-full border-[7px] border-[#c5a45e] bg-[#174b3a] shadow-[0_0_0_5px_#eadbb7,0_8px_20px_rgba(0,0,0,0.18)]">

          {/* Rotating compass dial and North marker */}
          <div
            className="absolute inset-3 rounded-full border border-[#d8bd78]/50 transition-transform duration-300"
            style={{ transform: `rotate(${dialRotation}deg)` }}
          >
            <span className="absolute left-1/2 top-1 -translate-x-1/2 font-serif text-sm font-bold text-white">
              N
            </span>

            <div className="absolute left-1/2 top-5 -translate-x-1/2">
              <div className="h-0 w-0 border-x-[6px] border-b-[10px] border-x-transparent border-b-white" />
            </div>

            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 font-serif text-sm text-[#f5df9d]">
              S
            </span>

            <span className="absolute right-1 top-1/2 -translate-y-1/2 font-serif text-sm text-[#f5df9d]">
              E
            </span>

            <span className="absolute left-1 top-1/2 -translate-y-1/2 font-serif text-sm text-[#f5df9d]">
              W
            </span>
          </div>

          {/* Qibla arrow - independent from the North dial */}
          <div
            className="absolute flex h-40 w-40 items-center justify-center transition-transform duration-500"
            style={{ transform: `rotate(${compassRotation}deg)` }}
          >
            <div className="absolute -top-9 flex flex-col items-center">
              <span className="mb-1 rounded-full border border-[#e8c879] bg-white p-2 font-serif text-[12px] font-bold text-green-900">
                قبلة
              </span>

              <div className="h-0 w-0 border-x-[10px] border-b-[22px] border-x-transparent border-b-[#e8c879]" />

              <div className="h-20 w-[3px] bg-gradient-to-b from-[#e8c879] to-[#f5e5b6]" />
            </div>

            <div className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-[#e8c879] bg-[#f8edcf]" />
          </div>

          {/* Center compass hub */}
          <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full border border-[#e8c879] bg-[#f7edda] text-[#174b3a] shadow-md">
            <Compass size={25} strokeWidth={1.5} />
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        {bearing !== null ? (
          <>
            <p className="text-sm text-[#927d5c]">
              Qibla bearing from North
            </p>

            <p className="mt-1 font-serif text-3xl font-semibold text-[#174b3a]">
              {bearing.toFixed(1)}°
            </p>
          </>
        ) : (
          <p className="text-sm text-[#927d5c]">
            Allow location access to calculate your Qibla direction.
          </p>
        )}

        <p className="mt-2 text-xs text-[#927d5c]">
          {heading === null
            ? "Enable your compass to find the real North direction."
            : "Turn your phone until N points toward the top."}
        </p>

        {heading !== null && (
          <p className="mt-1 text-xs font-medium text-[#174b3a]">
            Device heading: {heading.toFixed(1)}°
          </p>
        )}
      </div>

      {location && (
        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-[#315342]">
          <MapPin size={14} className="text-[#b18b45]" />
          <span>
            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </span>
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={enableCompass}
          className="flex items-center justify-center gap-2 rounded-lg border border-[#c5a45e] bg-[#174b3a] px-5 py-2.5 text-sm font-medium text-[#fff4d7] shadow-sm transition hover:bg-[#21634b]"
        >
          <Compass size={16} />
          {sensorEnabled ? "Compass Enabled" : "Enable Compass"}
        </button>

        <button
          type="button"
          onClick={getLocation}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg border border-[#c5a45e] bg-[#174b3a] px-5 py-2.5 text-sm font-medium text-[#fff4d7] shadow-sm transition hover:bg-[#21634b] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LocateFixed size={16} />
          {loading ? "Finding location..." : "Refresh Location"}
        </button>
      </div>
    </section>
  );
}
