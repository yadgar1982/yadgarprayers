import { useEffect, useState, useRef } from "react";
import {
  Settings,
  Trash2,
  Play,
  Square,
  MapPin,
  CalendarDays,
  BookOpenText,
  BookMarked,
  Compass,
} from "lucide-react";
import QiblaCompass from "./components/QiblaCompass";
import RamadanCalendar from "./components/RamadanCalender";
import PreAdhanScreen from "./components/PreAdhanScreen";
import Duas from "./components/Duas";
import IslamicLibrary from "./components/IslamicLibrary";

const APIURL = import.meta.env.VITE_API_URL;

// Calendar date helper using Afghan Dari month names

const getCalendarDates = (selectedTimezone) => {
  const today = new Date();

  // Afghan Dari Solar Hijri month names
  const solarMonths = [
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

  // Islamic Lunar Hijri month names
  const lunarMonths = [
    "محرم",
    "صفر",
    "ربیع‌الاول",
    "ربیع‌الثانی",
    "جمادی‌الاول",
    "جمادی‌الثانی",
    "رجب",
    "شعبان",
    "رمضان",
    "شوال",
    "ذوالقعده",
    "ذوالحجه",
  ];

  const solarParts = new Intl.DateTimeFormat("en-u-ca-persian-nu-latn", {
    timeZone: selectedTimezone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(today);

  const lunarParts = new Intl.DateTimeFormat(
    "en-u-ca-islamic-umalqura-nu-latn",
    {
      timeZone: selectedTimezone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
    },
  ).formatToParts(today);

  const getPart = (parts, type) =>
    Number(parts.find((part) => part.type === type).value);

  const solarDay = getPart(solarParts, "day");
  const solarMonth = getPart(solarParts, "month");
  const solarYear = getPart(solarParts, "year");

  const lunarDay = getPart(lunarParts, "day");
  const lunarMonth = getPart(lunarParts, "month");
  const lunarYear = getPart(lunarParts, "year");

  // const gregorianDate = new Intl.DateTimeFormat("en-GB", {
  //   day: "numeric",
  //   month: "long",
  //   year: "numeric",
  // }).format(today);

  return {
    solar: {
      day: solarDay,
      month: solarMonths[solarMonth - 1],
      year: solarYear,
    },
    lunar: {
      day: String(lunarDay).padStart(2, "0"),
      month: lunarMonths[lunarMonth - 1],
      year: lunarYear,
    },
    gregorian: new Intl.DateTimeFormat("en-GB", {
      timeZone: selectedTimezone,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
      .format(today)
      .replaceAll("/", "-"),
  };
};

const App = () => {
  const [locations, setLocations] = useState([]);
  const [showSavedCities, setShowSavedCities] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [showRamadanCalendar, setShowRamadanCalendar] = useState(
    () => localStorage.getItem("showRamadanCalendar") === "true",
  );

  useEffect(() => {
    localStorage.setItem("showRamadanCalendar", String(showRamadanCalendar));
  }, [showRamadanCalendar]);

  // Prevent background scrolling while a modal is open
  useEffect(() => {
    const shouldLockBody =
      showRamadanCalendar ||
      activeSection === "duas" ||
      activeSection === "books";

    if (shouldLockBody) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [showRamadanCalendar, activeSection]);

  const [notification, setNotification] = useState({
    message: "",
    type: "success",
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    cityId: "",
    cityName: "",
  });
  const [citySearch, setCitySearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchingCities, setSearchingCities] = useState(false);
  const [showLocationForm, setShowLocationForm] = useState(false);

  const [newLocation, setNewLocation] = useState({
    city: "",
    country: "",
    latitude: "",
    longitude: "",
    timezone: "",
  });
  const [selectedLocation, setSelectedLocation] = useState(
    () => localStorage.getItem("selectedLocation") || "",
  );
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prayerLoading, setPrayerLoading] = useState(false);
  const [currentCity, setCurrentCity] = useState("");
  const [selectedTimezone, setSelectedTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );
  const [locationMessage, setLocationMessage] = useState("");
  const [calculationMethod, setCalculationMethod] = useState(
    () => localStorage.getItem("calculationMethod") || "2",
  );
  useEffect(() => {
    localStorage.setItem("calculationMethod", calculationMethod);
  }, [calculationMethod]);

  // greetings
  const currentHour = new Date().getHours();

  const skyPhase =
    currentHour >= 5 && currentHour < 7
      ? "sunrise"
      : currentHour >= 7 && currentHour < 12
        ? "morning"
        : currentHour === 12
          ? "noon"
          : currentHour >= 13 && currentHour < 17
            ? "afternoon"
            : currentHour >= 17 && currentHour < 20
              ? "sunset"
              : "night";

  const greeting =
    currentHour >= 5 && currentHour < 12
      ? "Good Morning"
      : currentHour === 12
        ? "Good Noon"
        : currentHour >= 13 && currentHour < 17
          ? "Good Afternoon"
          : currentHour >= 17 && currentHour < 21
            ? "Good Evening"
            : "Good Night";

  const greetingMessage = {
    sunrise: "May your day begin with the remembrance of Allah.",
    morning: "May Allah bless your day with peace and happiness.",
    noon: "May Allah guide your steps throughout the day.",
    afternoon: "May your afternoon be filled with blessings.",
    sunset: "May Allah accept your prayers and good deeds.",
    night: "May Allah grant you a peaceful and blessed night.",
  };

  const [asrMethod, setAsrMethod] = useState(
    () => localStorage.getItem("asrMethod") || "1",
  );
  useEffect(() => {
    localStorage.setItem("asrMethod", asrMethod);
  }, [asrMethod]);
  const [activeCoordinates, setActiveCoordinates] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  // Prayer Alert Settings
  const [notificationPermission, setNotificationPermission] =
    useState("default");
  const [prayerAlertsEnabled, setPrayerAlertsEnabled] = useState(false);
  const lastAlertKey = useRef("");
  // Holds the Adhan audio player
  const adhanAudioRef = useRef(null);
  // Separate audio player for Fajr Adhan
  const fajrAdhanAudioRef = useRef(null);

  // Maghrib pre-Adhan screen
  const [showPreAdhanScreen, setShowPreAdhanScreen] = useState(false);
  const preAdhanTriggeredKey = useRef("");

  // check prayer alerts
  const checkPrayerAlerts = () => {
    if (!prayerTimes) return;
    const timeParts = new Intl.DateTimeFormat("en-GB", {
      timeZone: selectedTimezone,
      hour: "2-digit",
      minute: "2-digit",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hourCycle: "h23",
    }).formatToParts(currentTime);

    const getPart = (type) =>
      timeParts.find((part) => part.type === type)?.value;

    const currentHour = getPart("hour");
    const currentMinute = getPart("minute");
    const currentDate = `${getPart("year")}-${getPart("month")}-${getPart("day")}`;

    const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

    prayers.forEach((prayerName) => {
      const prayerTime = prayerTimes[prayerName];

      if (!prayerTime) return;

      // Extract only the hour and minute from the prayer time
      const [prayerHour, prayerMinute] = prayerTime.split(" ")[0].split(":");

      if (currentHour === prayerHour && currentMinute === prayerMinute) {
        const alertKey = `${currentDate}-${prayerName}`;

        if (lastAlertKey.current !== alertKey) {
          sendPrayerNotification(prayerName);
          playAdhan(prayerName);
          lastAlertKey.current = alertKey;
        }
      }
    });
  };

  // Check for prayer alerts whenever the clock updates
  useEffect(() => {
    checkPrayerAlerts();
  }, [currentTime, prayerTimes, selectedTimezone, prayerAlertsEnabled]);

  // Open the pre-Adhan screen one minute before Maghrib only
  useEffect(() => {
    if (!prayerTimes?.Maghrib || !selectedTimezone) return;

    const now = new Date();

    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: selectedTimezone,
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
          .map((part) => [part.type, Number(part.value)]),
      );
    };

    const localNow = getLocalParts(now);
    const [maghribHour, maghribMinute] = prayerTimes.Maghrib.split(" ")[0]
      .split(":")
      .map(Number);

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
          local.second,
        );

        guess += targetUTC - representedUTC;
      }

      return new Date(guess);
    };

    const maghribDate = getZonedDate(
      localNow.year,
      localNow.month,
      localNow.day,
      maghribHour,
      maghribMinute,
    );

    const secondsUntilMaghrib = Math.floor((maghribDate - now) / 1000);

    const todayKey = `${localNow.year}-${localNow.month}-${localNow.day}-Maghrib`;

    if (
      secondsUntilMaghrib >= 0 &&
      secondsUntilMaghrib <= 60 &&
      preAdhanTriggeredKey.current !== todayKey
    ) {
      preAdhanTriggeredKey.current = todayKey;
      setShowPreAdhanScreen(true);
    }
  }, [currentTime, prayerTimes, selectedTimezone]);

  // Separate controls for Fajr and regular Adhan
  const [fajrAdhanEnabled, setFajrAdhanEnabled] = useState(true);
  const [regularAdhanEnabled, setRegularAdhanEnabled] = useState(true);

  // Cloud recordings loaded from the backend
  const [regularAdhanSrc, setRegularAdhanSrc] = useState("");
  const [fajrAdhanSrc, setFajrAdhanSrc] = useState("");

  const [regularAdhanOptions, setRegularAdhanOptions] = useState([]);
  const [fajrAdhanOptions, setFajrAdhanOptions] = useState([]);
  const [showRegularAdhanManager, setShowRegularAdhanManager] = useState(false);

  const [showFajrAdhanManager, setShowFajrAdhanManager] = useState(false);
  // Load Adhan recordings from MongoDB and AWS S3
  useEffect(() => {
    const loadAdhanRecordings = async () => {
      try {
        const response = await fetch(`${APIURL}/api/adhan/recordings`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load Adhan recordings.");
        }

        const regularRecordings = data.recordings
          .filter((recording) => recording.type === "regular")
          .map((recording) => ({
            id: recording._id,
            name: recording.name,
            src: recording.audioUrl,
          }));

        const fajrRecordings = data.recordings
          .filter((recording) => recording.type === "fajr")
          .map((recording) => ({
            id: recording._id,
            name: recording.name,
            src: recording.audioUrl,
          }));

        setRegularAdhanOptions(regularRecordings);
        setFajrAdhanOptions(fajrRecordings);

        setRegularAdhanSrc(regularRecordings[0]?.src || "");
        setFajrAdhanSrc(fajrRecordings[0]?.src || "");
      } catch (error) {
        console.error("Error loading Adhan recordings:", error);
      }
    };

    loadAdhanRecordings();
  }, []);
  // Get today's date
  const getTodayDate = (timezone) => {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
      .format(new Date())
      .replaceAll("/", "-");
  };

  // Get prayer times
  const getPrayerTimes = async (
    latitude,
    longitude,
    method = calculationMethod,
    school = asrMethod,
    timezone = selectedTimezone,
  ) => {
    try {
      setPrayerLoading(true);
      setPrayerTimes(null);

      setActiveCoordinates({ latitude, longitude });

      const date = getTodayDate(timezone);

      const url = `${APIURL}/api/prayer-times?latitude=${latitude}&longitude=${longitude}&date=${date}&method=${method}&school=${school}`;
      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to get prayer times");
      }
      console.log("Prayer Times:", result.data.timings);
      console.log("API Location Details:", result.data.meta);
      setPrayerTimes(result.data.timings);
      setLocationMessage("");
    } catch (error) {
      console.error("Error fetching prayer times:", error);
      setLocationMessage("Unable to load prayer times. Please try again.");
    } finally {
      setPrayerLoading(false);
    }
  };

  // Get saved locations
  const getLocations = async () => {
    try {
      const response = await fetch(`${APIURL}/api/locations`);
      const result = await response.json();

      if (result.success) {
        setLocations(result.data);
        return result.data;
      }

      return [];
    } catch (error) {
      console.error("Error fetching locations:", error);
    } finally {
      setLoading(false);
    }
  };

  // Search for cities using Open-Meteo
  const searchCities = async () => {
    if (!citySearch.trim()) {
      setNotification({
        message: error.message || "Fajr Adhan upload failed.",
        type: "error",
      });

      setTimeout(() => {
        setNotification({ message: "", type: "success" });
      }, 4000);
      return;
    }

    try {
      setSearchingCities(true);

      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(citySearch)}&count=10&language=en&format=json`,
      );

      const result = await response.json();

      setSearchResults(result.results || []);

      if (!result.results || result.results.length === 0) {
        setNotification({
          message: "No matching cities found",
          type: "error",
        });

        setTimeout(() => {
          setNotification({ message: "", type: "success" });
        }, 4000);
      }
    } catch (error) {
      console.error("City search error:", error);
      setNotification({
        message: "Unable to search for cities. Please try again.",
        type: "error",
      });

      setTimeout(() => {
        setNotification({ message: "", type: "success" });
      }, 4000);
    } finally {
      setSearchingCities(false);
    }
  };

  // Save a selected city
  const handleSaveCity = async (city) => {
    try {
      const response = await fetch(`${APIURL}/api/locations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          city: city.name,
          country: city.country,
          latitude: city.latitude,
          longitude: city.longitude,
          timezone: city.timezone,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to save city");
      }

      await getLocations();

      // Clear the search after saving
      setCitySearch("");
      setSearchResults([]);

      setNotification({
        message: `${city.name} has been added to your saved cities!`,
        type: "success",
      });

      setTimeout(() => {
        setNotification({ message: "", type: "success" });
      }, 3000);
    } catch (error) {
      console.error("Error saving city:", error);
      setNotification({
        message: error.message || "Unable to save city. Please try again.",
        type: "error",
      });

      setTimeout(() => {
        setNotification({ message: "", type: "success" });
      }, 4000);
    }
  };

  // Delete a saved city
  const handleDeleteCity = async (id, cityName) => {
    try {
      const response = await fetch(`${APIURL}/api/locations/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to delete city");
      }

      await getLocations();
      // Clear the selected city if it was deleted
      if (selectedLocation === id) {
        setSelectedLocation("");
        setCurrentCity("");
        setPrayerTimes(null);
        setActiveCoordinates(null);
      }

      setDeleteConfirmation({
        isOpen: false,
        cityId: "",
        cityName: "",
      });

      setNotification({
        message: `${cityName} has been removed from your saved cities.`,
        type: "success",
      });

      setTimeout(() => {
        setNotification({ message: "", type: "success" });
      }, 3000);
    } catch (error) {
      console.error("Error deleting city:", error);

      setNotification({
        message: error.message || "Unable to delete city.",
        type: "error",
      });

      setTimeout(() => {
        setNotification({ message: "", type: "success" });
      }, 4000);
    }
  };
  // Add a new saved location
  const handleAddLocation = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`${APIURL}/api/locations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newLocation,
          latitude: Number(newLocation.latitude),
          longitude: Number(newLocation.longitude),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to add location");
      }

      setNewLocation({
        city: "",
        country: "",
        latitude: "",
        longitude: "",
        timezone: "",
      });

      setShowLocationForm(false);

      await getLocations();

      setNotification({
        message: "Location added successfully!",
        type: "success",
      });

      setTimeout(() => {
        setNotification({ message: "", type: "success" });
      }, 3000);
    } catch (error) {
      console.error("Error adding location:", error);
      setNotification({
        message: error.message || "Unable to save city. Please try again.",
        type: "error",
      });

      setTimeout(() => {
        setNotification({ message: "", type: "success" });
      }, 4000);
    }
  };

  // Detect current location
  const detectLocation = () => {
    setLocationMessage("");

    if (!navigator.geolocation) {
      setLocationMessage("Your browser does not support location detection.");
      return;
    }

    setLocationMessage("Detecting your location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        console.log("Detected Latitude:", latitude);
        console.log("Detected Longitude:", longitude);

        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setSelectedTimezone(timezone);

        setSelectedLocation("");
        try {
          const locationResponse = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          );

          const locationData = await locationResponse.json();

          const cityName =
            locationData.city ||
            locationData.locality ||
            locationData.principalSubdivision;

          setCurrentCity(cityName || "Your Current Location");
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          setCurrentCity("Your Current Location");
        }

        await getPrayerTimes(
          latitude,
          longitude,
          calculationMethod,
          asrMethod,
          timezone,
        );
      },
      (error) => {
        console.error("Location error:", error);

        setLocationMessage(
          "Location permission denied or unavailable. Please select a saved city.",
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    );
  };

  // Always use current location when the app opens
  useEffect(() => {
    getLocations();
    localStorage.removeItem("selectedLocation");
    setSelectedLocation("");
    detectLocation();

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  // Handle saved city selection
  const handleLocationChange = (event) => {
    const locationId = event.target.value;

    setSelectedLocation(locationId);
    localStorage.setItem("selectedLocation", locationId);
    setLocationMessage("");

    const location = locations.find((item) => item._id === locationId);

    if (location) {
      setCurrentCity(`${location.city}, ${location.country}`);
      setSelectedTimezone(
        location.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      );
      getPrayerTimes(
        location.latitude,
        location.longitude,
        calculationMethod,
        asrMethod,
        location.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      );
    } else {
      setPrayerTimes(null);
      setActiveCoordinates(null);
      setCurrentCity("");

      setSelectedTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }
  };

  // Handle calculation method change
  const handleCalculationMethodChange = (event) => {
    const method = event.target.value;

    setCalculationMethod(method);

    if (activeCoordinates) {
      getPrayerTimes(
        activeCoordinates.latitude,
        activeCoordinates.longitude,
        method,
      );
    }
  };

  // Get next prayer time

  const getNextPrayer = () => {
    if (!prayerTimes || !selectedTimezone) return null;

    const prayerNames = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
    const now = currentTime;

    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: selectedTimezone,
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
          .map((part) => [part.type, Number(part.value)]),
      );
    };

    const getZonedDate = (year, month, day, hours, minutes) => {
      const targetUTC = Date.UTC(year, month - 1, day, hours, minutes);

      let guess = targetUTC;

      for (let i = 0; i < 3; i++) {
        const local = getLocalParts(new Date(guess));

        const representedUTC = Date.UTC(
          local.year,
          local.month - 1,
          local.day,
          local.hour,
          local.minute,
          local.second,
        );

        guess += targetUTC - representedUTC;
      }

      return new Date(guess);
    };

    const today = getLocalParts(now);

    for (const name of prayerNames) {
      const [hours, minutes] = prayerTimes[name].split(":").map(Number);

      const prayerDate = getZonedDate(
        today.year,
        today.month,
        today.day,
        hours,
        minutes,
      );

      if (prayerDate > now) {
        return { name, time: prayerDate };
      }
    }

    const tomorrow = new Date(
      Date.UTC(today.year, today.month - 1, today.day + 1),
    );

    const [hours, minutes] = prayerTimes.Fajr.split(":").map(Number);

    return {
      name: "Fajr",
      time: getZonedDate(
        tomorrow.getUTCFullYear(),
        tomorrow.getUTCMonth() + 1,
        tomorrow.getUTCDate(),
        hours,
        minutes,
      ),
    };
  };

  const nextPrayer = getNextPrayer();
  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      setNotificationPermission("unsupported");
      return;
    }

    const permission = await Notification.requestPermission();

    setNotificationPermission(permission);

    if (permission === "granted") {
      setPrayerAlertsEnabled(true);

      new Notification("Global Adhan", {
        body: "Prayer notifications are enabled.",
      });
    }
  };

  // send prayer notification
  const sendPrayerNotification = (prayerName) => {
    if (!("Notification" in window)) return;

    if (Notification.permission !== "granted") return;

    new Notification(`${prayerName} Prayer Time`, {
      body: `It is time for ${prayerName} prayer.`,
      icon: "/favicon.ico",
    });
  };

  //Delete adhan recording

  const deleteAdhanRecording = async (recordingId) => {
    try {
      const regularRecording = regularAdhanOptions.find(
        (option) => option.id === recordingId,
      );

      const fajrRecording = fajrAdhanOptions.find(
        (option) => option.id === recordingId,
      );

      const response = await fetch(
        `${APIURL}/api/adhan/recordings/${recordingId}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete recording.");
      }

      setRegularAdhanOptions((current) =>
        current.filter((option) => option.id !== recordingId),
      );

      setFajrAdhanOptions((current) =>
        current.filter((option) => option.id !== recordingId),
      );

      if (regularRecording && regularRecording.src === regularAdhanSrc) {
        setRegularAdhanSrc("");
      }

      if (fajrRecording && fajrRecording.src === fajrAdhanSrc) {
        setFajrAdhanSrc("");
      }

      setNotification({
        message: "Adhan recording deleted successfully.",
        type: "success",
      });

      setTimeout(() => {
        setNotification({ message: "", type: "success" });
      }, 3000);
    } catch (error) {
      setNotification({
        message: error.message,
        type: "error",
      });

      setTimeout(() => {
        setNotification({ message: "", type: "success" });
      }, 4000);
    }
  };

  // Plays Fajr or regular Adhan based on the prayer
  const playAdhan = (prayerName) => {
    const isFajr = prayerName === "Fajr";

    if (isFajr && !fajrAdhanEnabled) return;
    if (!isFajr && !regularAdhanEnabled) return;

    const audioRef = isFajr ? fajrAdhanAudioRef : adhanAudioRef;

    if (!audioRef.current) return;

    audioRef.current.currentTime = 0;

    audioRef.current.play().catch((error) => {
      console.error("Adhan playback failed:", error);
    });
  };

  // Preview the selected Regular Adhan
  const previewRegularAdhan = () => {
    if (!adhanAudioRef.current) return;

    adhanAudioRef.current.currentTime = 0;

    adhanAudioRef.current.play().catch((error) => {
      console.error("Regular Adhan preview failed:", error);
    });
  };

  // Upload a Regular Adhan recording to the backend and S3
  const handleRegularAdhanUpload = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (file.type !== "audio/mpeg") {
      setNotification({
        message: "Please select an MP3 audio file.",
        type: "error",
      });

      setTimeout(() => {
        setNotification({ message: "", type: "success" });
      }, 4000);
      return;
    }

    try {
      const formData = new FormData();

      formData.append("audio", file);
      formData.append("name", file.name);
      formData.append("type", "regular");

      const response = await fetch(`${APIURL}/api/adhan/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed.");
      }

      const recordingsResponse = await fetch(`${APIURL}/api/adhan/recordings`);

      const recordingsData = await recordingsResponse.json();

      const uploadedRecording = recordingsData.recordings.find(
        (recording) => recording._id === data.recording._id,
      );

      if (!uploadedRecording) {
        throw new Error("Playback link was not found.");
      }

      setRegularAdhanSrc(uploadedRecording.audioUrl);
      setRegularAdhanOptions(
        recordingsData.recordings
          .filter((recording) => recording.type === "regular")
          .map((recording) => ({
            id: recording._id,
            name: recording.name,
            src: recording.audioUrl,
          })),
      );

      setNotification({
        message: "Regular Adhan uploaded successfully!",
        type: "success",
      });

      setTimeout(() => {
        setNotification({ message: "", type: "success" });
      }, 3000);
    } catch (error) {
      console.error("Regular Adhan upload error:", error);
      setNotification({
        message: error.message || "Regular Adhan upload failed.",
        type: "error",
      });

      setTimeout(() => {
        setNotification({ message: "", type: "success" });
      }, 4000);
    } finally {
      event.target.value = "";
    }
  };

  // Upload a Fajr Adhan recording to the backend and S3
  const handleFajrAdhanUpload = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (file.type !== "audio/mpeg") {
      setNotification({
        message: "Please select an MP3 audio file.",
        type: "error",
      });

      setTimeout(() => {
        setNotification({ message: "", type: "success" });
      }, 4000);
      return;
    }

    try {
      const formData = new FormData();

      formData.append("audio", file);
      formData.append("name", file.name);
      formData.append("type", "fajr");

      const response = await fetch(`${APIURL}/api/adhan/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed.");
      }

      const recordingsResponse = await fetch(`${APIURL}/api/adhan/recordings`);

      const recordingsData = await recordingsResponse.json();

      const uploadedRecording = recordingsData.recordings.find(
        (recording) => recording._id === data.recording._id,
      );

      if (!uploadedRecording) {
        throw new Error("Playback link was not found.");
      }

      setFajrAdhanSrc(uploadedRecording.audioUrl);

      setFajrAdhanOptions(
        recordingsData.recordings
          .filter((recording) => recording.type === "fajr")
          .map((recording) => ({
            id: recording._id,
            name: recording.name,
            src: recording.audioUrl,
          })),
      );

      setNotification({
        message: "Fajr Adhan uploaded successfully!",
        type: "success",
      });

      setTimeout(() => {
        setNotification({ message: "", type: "success" });
      }, 3000);
    } catch (error) {
      console.error("Fajr Adhan upload error:", error);
      setNotification({
        message: error.message || "Fajr Adhan upload failed.",
        type: "error",
      });

      setTimeout(() => {
        setNotification({ message: "", type: "success" });
      }, 4000);
    } finally {
      event.target.value = "";
    }
  };
  // Preview the selected Fajr Adhan
  const previewFajrAdhan = () => {
    if (!fajrAdhanAudioRef.current) return;

    fajrAdhanAudioRef.current.currentTime = 0;

    fajrAdhanAudioRef.current.play().catch((error) => {
      console.error("Fajr Adhan preview failed:", error);
    });
  };
  // Stop an Adhan recording
  const stopAdhan = (audioRef) => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  };

  const getCountdown = () => {
    if (!nextPrayer) return "";

    const difference = nextPrayer.time - currentTime;

    const hours = Math.floor(difference / 3600000);
    const minutes = Math.floor((difference % 3600000) / 60000);
    const seconds = Math.floor((difference % 60000) / 1000);

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  // Convert 24-hour time to 12-hour time
  const formatTime = (time) => {
    if (!time) return "--:--";

    const [hours, minutes] = time.split(":").map(Number);

    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;

    return `${formattedHours}:${String(minutes).padStart(2, "0")} ${period}`;
  };
  const prayers = [
    { name: "Fajr", time: prayerTimes?.Fajr },
    { name: "Sunrise", time: prayerTimes?.Sunrise },
    { name: "Dhuhr", time: prayerTimes?.Dhuhr },
    { name: "Asr", time: prayerTimes?.Asr },
    { name: "Maghrib", time: prayerTimes?.Maghrib },
    { name: "Isha", time: prayerTimes?.Isha },
  ];
  const calendarDates = getCalendarDates(selectedTimezone);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#020b09] via-[#071b16] to-[#020806] px-2 p-4 text-[#f5eedc]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(24,112,77,0.20),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(184,145,67,0.08),_transparent_45%)]" />

      {/* Success Notification */}
      <div className="fixed right-5 top-5 z-50">
        {notification.message && (
          <div
            className={`flex items-center gap-3 rounded-xl border px-5 py-4 shadow-xl ${
              notification.type === "success"
                ? "border-emerald-200 bg-white text-emerald-800"
                : "border-red-200 bg-white text-red-800"
            }`}
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                notification.type === "success"
                  ? "bg-emerald-100"
                  : "bg-red-100"
              }`}
            >
              {notification.type === "success" ? "✓" : "!"}
            </div>

            <div>
              <p className="font-semibold">
                {notification.type === "success"
                  ? "Success!"
                  : "Something went wrong"}
              </p>
              <p className="text-sm text-gray-600">{notification.message}</p>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-800">
              Delete Saved City?
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Are you sure you want to remove{" "}
              <strong>{deleteConfirmation.cityName}</strong> from your saved
              cities? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setDeleteConfirmation({
                    isOpen: false,
                    cityId: "",
                    cityName: "",
                  })
                }
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() =>
                  handleDeleteCity(
                    deleteConfirmation.cityId,
                    deleteConfirmation.cityName,
                  )
                }
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete City
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}

      {/* GLOBAL ADHAN BRAND & CALENDAR CARD */}
      <div className="mx-auto mt-4 w-full max-w-5xl overflow-hidden rounded-2xl border border-[#c5a45e]/70 bg-[#fffdf7] shadow-[0_12px_35px_rgba(23,75,58,0.13)]">
        {/* BRAND HEADER */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#082f26] via-[#174b3a] to-[#0b382b] px-4 pb-4 pt-5 text-center sm:pb-5 sm:pt-6">
          {/* Subtle decorative details */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "radial-gradient(circle at center, #e8c879 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />

          <div className="relative z-10">
            <p className="mb-1 text-[14px] font-medium tracking-[0.4em] text-[#d8bd78]">
              ۞ YADGAR ۞
            </p>

            <h1 className="font-serif text-xl font-bold uppercase tracking-[0.12em] text-[#f4dfa9] sm:text-3xl sm:tracking-[0.18em]">
              ISLAMIC CALENDER
            </h1>

            {/* DYNAMIC SKY GREETING */}
            <div
              className={`sky-banner sky-${skyPhase} mt-4 rounded-xl border border-[#e8c879]/40 shadow-inner`}
            >
              <div className="sky-stars">
                {Array.from({ length: 18 }).map((_, i) => (
                  <span key={i} className={`sky-star star-${i + 1}`}>
                    ✦
                  </span>
                ))}
              </div>

              <div className="sky-sun">
                <div className="sun-glow" />
              </div>

              <div className="sky-moon">☾</div>

              <div className="sky-cloud cloud-one" />
              <div className="sky-cloud cloud-two" />

              <div className="sky-greeting">
                <p className="greeting-time">{greeting}</p>

                <p className="greeting-message">{greetingMessage[skyPhase]}</p>
              </div>
            </div>

            <p className="mt-3 text-[9px] font-medium tracking-[0.25em] text-[#e8c879] sm:text-[10px]">
              A MOMENT OF REMEMBRANCE
            </p>
          </div>
        </div>

        {/* CALENDAR SECTION */}
        <div className="px-3 py-5 sm:px-7 sm:py-6">
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#c5a45e]" />
            <span className="text-lg text-[#b18b45]">۞</span>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#c5a45e]" />
          </div>

          <div className="grid grid-cols-3 divide-x divide-[#d8c69d]">
            {/* SOLAR HIJRI */}
            <div className="min-w-0 px-1.5 text-center sm:px-4">
              <p
                dir="rtl"
                className="text-xs font-semibold text-[#98733c] sm:text-sm"
              >
                هجری شمسی
              </p>

              <p
                dir="rtl"
                className="mt-2 break-words font-serif text-sm font-bold leading-relaxed text-[#174b3a] sm:text-lg"
              >
                {calendarDates.solar.day} - {calendarDates.solar.month} -{" "}
                {calendarDates.solar.year}
              </p>
            </div>

            {/* LUNAR HIJRI */}
            <div className="min-w-0 px-1.5 text-center sm:px-4">
              <p
                dir="rtl"
                className="text-xs font-semibold text-[#98733c] sm:text-sm"
              >
                هجری قمری
              </p>

              <p
                dir="rtl"
                className="mt-2 break-words font-serif text-sm font-bold leading-relaxed text-[#174b3a] sm:text-lg"
              >
                {calendarDates.lunar.day} - {calendarDates.lunar.month} -{" "}
                {calendarDates.lunar.year}
              </p>
            </div>

            {/* GREGORIAN */}
            <div className="min-w-0 px-1.5 text-center sm:px-4">
              <p className="text-xs font-semibold text-[#98733c] sm:text-sm">
                میلادی
              </p>

              <p
                dir="ltr"
                className="mt-2 font-serif text-sm font-bold leading-relaxed text-[#174b3a] sm:text-lg"
              >
                {calendarDates.gregorian}
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center gap-3">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#c5a45e]" />
            <span className="text-sm text-[#b18b45]">✧ ۞ ✧</span>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#c5a45e]" />
          </div>
        </div>
      </div>

      {/* Main Navigation Buttons */}

      <div className="mx-auto mt-4 flex w-full max-w-4xl flex-wrap items-center justify-center gap-2 px-3">
        {/* Islamic Calendar */}
        <button
          type="button"
          onClick={() => {
            setActiveSection("calendar");
            setShowRamadanCalendar(true);
          }}
          className={`group relative flex h-10 items-center justify-center gap-1.5 rounded-lg border px-2 text-[#fff4d7] transition-all duration-300 ${
            calendarDates.lunar.month === "رمضان"
              ? "ramadan-glow border-[#f4d27c] bg-gradient-to-br from-green-700 to-green-900"
              : "border-[#c5a45e]/60 bg-gradient-to-br from-[#103d30] to-[#1c5943] shadow-sm hover:border-[#e5ca83] hover:shadow-md"
          }`}
        >
          <CalendarDays
            size={16}
            strokeWidth={1.7}
            className="shrink-0 text-[#e8c879] group-hover:scale-110"
          />
          <span className="whitespace-nowrap font-serif text-xs font-medium">
            Calendar
          </span>
        </button>

        {/* Duas */}
        <button
          type="button"
          onClick={() => {
            setShowRamadanCalendar(false);
            setActiveSection("duas");
          }}
          className="group flex h-10 items-center justify-center gap-1.5 rounded-lg border border-[#c5a45e]/60 bg-gradient-to-br from-[#103d30] to-[#1c5943] px-2 text-[#fff4d7] shadow-sm transition-all duration-200 hover:border-[#e5ca83] hover:shadow-md"
        >
          <BookOpenText
            size={16}
            strokeWidth={1.7}
            className="shrink-0 text-[#8ed8c0] group-hover:scale-110"
          />
          <span className="whitespace-nowrap font-serif text-xs font-medium">
            Duas
          </span>
        </button>

        {/* Islamic Books */}
        <button
          type="button"
          onClick={() => {
            setShowRamadanCalendar(false);
            setActiveSection("books");
          }}
          className="group flex h-10 items-center justify-center gap-1.5 rounded-lg border border-[#c5a45e]/60 bg-gradient-to-br from-[#103d30] to-[#1c5943] px-2 text-[#fff4d7] shadow-sm transition-all duration-200 hover:border-[#e5ca83] hover:shadow-md"
        >
          <BookMarked
            size={16}
            strokeWidth={1.7}
            className="shrink-0 text-[#e8a66b] group-hover:scale-110"
          />
          <span className="whitespace-nowrap font-serif text-xs font-medium">
            Books
          </span>
        </button>

        {/* Settings */}
        <button
          type="button"
          onClick={() => {
            setShowRamadanCalendar(false);

            const isOpening = activeSection !== "settings";

            setActiveSection(isOpening ? "settings" : "");

            if (isOpening) {
              setNotification({
                message: "Scroll down to manage your app",
                type: "success",
              });

              setTimeout(() => {
                setNotification({ message: "", type: "success" });
              }, 5000);

              setTimeout(() => {
                window.scrollTo({
                  top: document.documentElement.scrollHeight * 0.5,
                  behavior: "smooth",
                });
              }, 150);
            } else {
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }
          }}
          className="group flex h-10 items-center justify-center gap-1.5 rounded-lg border border-[#c5a45e]/60 bg-gradient-to-br from-[#103d30] to-[#1c5943] px-2 text-[#fff4d7] shadow-sm transition-all duration-200 hover:border-[#e5ca83] hover:shadow-md"
        >
          <Settings
            size={16}
            strokeWidth={1.7}
            className="shrink-0 text-[#d6b5ef] transition-transform group-hover:rotate-45"
          />
          <span className="whitespace-nowrap font-serif text-xs font-medium">
            Settings
          </span>
        </button>
      </div>

      {/* Qibla Compass Modal */}
      {activeSection === "qibla" && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm"
          onClick={() => setActiveSection("")}
        >
          <div
            className="relative w-full max-w-md rounded-2xl  bg-gradient-to-b from-[#fffdf6] to-[#f5efdf] p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveSection("")}
              className="absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-[#c5a45e]/50 text-lg text-white transition bg-red-500 hover:bg-red-300"
              aria-label="Close Qibla"
            >
              ×
            </button>

            <QiblaCompass
              coordinates={activeCoordinates}
              cityName={currentCity}
            />
          </div>
        </div>
      )}

      <main className="mx-auto max-w-6xl px-5 py-10">
        {/* Prayer Times */}
        <section className="relative mx-auto mb-8 max-w-6xl rounded-[28px] border-[3px] border-double border-[#c5a45e] bg-[#fdfbf5]/60 px-3 py-5 shadow-[0_8px_28px_rgba(139,107,50,0.10)] sm:px-6 sm:py-7">
          {/* Delicate certificate-style ornamental frame */}
          <div className="pointer-events-none absolute inset-2 rounded-[22px] border border-[#c5a45e]/50" />

          <span className="pointer-events-none absolute left-4 top-2 text-xl text-[#b18b45]">
            ❧
          </span>
          <span className="pointer-events-none absolute right-4 top-2 text-xl text-[#b18b45]">
            ❧
          </span>
          <span className="pointer-events-none absolute bottom-2 left-4 text-xl text-[#b18b45]">
            ❧
          </span>
          <span className="pointer-events-none absolute bottom-2 right-4 text-xl text-[#b18b45]">
            ❧
          </span>
          {/* Elegant Section Heading */}

          <div className="relative mb-6 overflow-hidden rounded-2xl border border-[#c5a45e]/50 bg-gradient-to-b from-[#fffdf8] to-[#f6efdf] px-5 py-7 text-center shadow-[0_5px_18px_rgba(139,107,50,0.10)]">
            {/* Delicate ornamental corners */}

            <div className="mb-3 flex items-center justify-center gap-3 text-xs font-medium tracking-[0.3em] text-[#a47c37]">
              <span className="h-px w-10 bg-[#c5a45e]/70" />
              <span>  </span>
              <span className="h-px w-10 bg-[#c5a45e]/70" />
            </div>

            <h2 className="font-serif text-2xl font-bold tracking-wide text-[#174b3a] text-lg sm:text-3xl">
             ✧ Today's Prayer Times ✧
              
            </h2>
{currentCity && (
  <p className="mt-2 font-serif text-sm font-semibold text-[#98733c]">
    <MapPin size={14} className="mr-1 inline-block" />
    {currentCity}
  </p>
)}

            <button
              type="button"
              onClick={() => {
                setShowRamadanCalendar(false);
                setActiveSection("qibla");
              }}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#c5a45e]/60 bg-[#174b3a] px-4 py-1.5 text-[#f4dfa9] shadow-sm transition-all duration-200 hover:border-[#e5c77f] hover:bg-[#21634b]"
            >
              <Compass size={14} strokeWidth={1.6} />
              <span className="font-serif text-xs tracking-wide">
                Find Qibla
              </span>
            </button>
         

            <div className="mx-auto mt-4 flex max-w-xs items-center justify-center gap-3 text-[#b18b45]">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#c5a45e]" />
              <span className="text-lg">✧ ۞ ✧</span>
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#c5a45e]" />
            </div>
          </div>

          {/* Loading State */}
          {prayerLoading && (
            <div className="rounded-2xl border border-[#e8d9b5] bg-[#fffdf7] px-5 py-10 text-center shadow-sm">
              <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-[#e8d9b5] border-t-[#174b3a]" />
              <p className="text-sm font-medium text-[#8b7040]">
                Loading prayer times...
              </p>
            </div>
          )}

          {/* Empty State */}
          {!prayerLoading && !prayerTimes && (
            <div className="rounded-2xl border border-[#e8d9b5] bg-[#fffdf7] px-5 py-10 text-center shadow-sm">
              <div className="mb-3 text-3xl text-[#b18b45]">✧</div>
              <p className="font-serif text-lg text-[#174b3a]">
                Your Prayer Schedule
              </p>
              <p className="mt-2 text-sm text-[#927d5c]">
                Select or detect a location to see prayer times.
              </p>
            </div>
          )}

          {/* Prayer Cards */}

          {prayerTimes && (
            <div className="grid grid-cols-2 gap-2 sm:gap-5 lg:grid-cols-3">
              {prayers.map((prayer) => {
                const scenes = {
                  Fajr: {
                    sky: "from-[#101b3d] via-[#394d78] to-[#d18b82]",
                    caption: "First Light",
                    celestial: "☾",
                    celestialStyle:
                      "text-[#fff1c5] shadow-[0_0_35px_12px_rgba(255,235,180,0.18)]",
                    stars: true,
                    sun: false,
                    glow: "bg-[#e4a58a]/30",
                    horizon: "from-[#273b59] to-[#6c647d]",
                  },
                  Sunrise: {
                    sky: "from-[#667b9d] via-[#e7a16d] to-[#ffe0a3]",
                    caption: "A New Beginning",
                    celestial: "☀",
                    celestialStyle:
                      "text-[#fff2b0] shadow-[0_0_55px_22px_rgba(255,207,117,0.5)]",
                    stars: false,
                    sun: true,
                    glow: "bg-[#ffcf85]/40",
                    horizon: "from-[#8b665a] to-[#e4a66e]",
                  },
                  Dhuhr: {
                    sky: "from-[#2775ae] via-[#75b9df] to-[#d8e9e9]",
                    caption: "Radiance of Day",
                    celestial: "☀",
                    celestialStyle:
                      "text-[#fff4c4] shadow-[0_0_55px_24px_rgba(255,235,160,0.45)]",
                    stars: false,
                    sun: true,
                    glow: "bg-[#fff1b5]/40",
                    horizon: "from-[#527c78] to-[#8ba88a]",
                  },
                  Asr: {
                    sky: "from-[#617a9c] via-[#d99a69] to-[#f4d1a0]",
                    caption: "Afternoon Serenity",
                    celestial: "☀",
                    celestialStyle:
                      "text-[#fff0bf] shadow-[0_0_45px_18px_rgba(255,213,145,0.4)]",
                    stars: false,
                    sun: true,
                    glow: "bg-[#f5c48b]/40",
                    horizon: "from-[#655b4c] to-[#c18a61]",
                  },
                  Maghrib: {
                    sky: "from-[#34385d] via-[#bd665b] to-[#f2a45e]",
                    caption: "Golden Sunset",
                    celestial: "☼",
                    celestialStyle:
                      "text-[#ffe0a0] shadow-[0_0_45px_20px_rgba(255,166,91,0.4)]",
                    stars: false,
                    sun: true,
                    glow: "bg-[#ffb66e]/40",
                    horizon: "from-[#47394a] to-[#a45c4c]",
                  },
                  Isha: {
                    sky: "from-[#071329] via-[#142b50] to-[#34476b]",
                    caption: "Under the Stars",
                    celestial: "☾",
                    celestialStyle:
                      "text-[#fff1c5] shadow-[0_0_35px_12px_rgba(255,235,180,0.18)]",
                    stars: true,
                    sun: false,
                    glow: "bg-[#526a91]/20",
                    horizon: "from-[#101e35] to-[#263c50]",
                  },
                };

                const scene = scenes[prayer.name] || scenes.Dhuhr;

                return (
                  <div
                    key={prayer.name}
                    className="group relative overflow-hidden rounded-t-[125px] rounded-b-2xl border-2 border-[#c5a45e] bg-[#174b3a] p-2 shadow-[0_7px_22px_rgba(23,75,58,0.20)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(155,125,65,0.25)]"
                  >
                    <div
                      className={`relative min-h-[230px] sm:min-h-[275px] overflow-hidden rounded-t-[90px] sm:rounded-t-[115px] rounded-b-xl bg-gradient-to-b ${scene.sky}`}
                    >
                      {/* Atmospheric glow */}
                      <div
                        className={`absolute left-1/2 top-[24%] h-32 w-32 -translate-x-1/2 rounded-full blur-3xl ${scene.glow}`}
                      />

                      {/* Stars */}
                      {scene.stars && (
                        <div className="absolute inset-0 text-[#fff3d0]">
                          {[
                            ["15%", "17%"],
                            ["28%", "30%"],
                            ["72%", "16%"],
                            ["83%", "35%"],
                            ["42%", "12%"],
                            ["64%", "43%"],
                            ["20%", "47%"],
                            ["91%", "12%"],
                          ].map(([left, top], i) => (
                            <span
                              key={i}
                              className="absolute text-xs opacity-80"
                              style={{ left, top }}
                            >
                              ✦
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Sun or crescent */}
                      <div className="absolute left-1/2 top-[24%] -translate-x-1/2">
                        <div
                          className={`flex h-16 w-16 items-center justify-center rounded-full ${scene.celestialStyle}`}
                        >
                          <span className="text-5xl">{scene.celestial}</span>
                        </div>
                      </div>

                      {/* Soft clouds */}
                      <div className="absolute left-[8%] top-[42%] h-4 w-20 rounded-full bg-white/20 blur-md" />
                      <div className="absolute right-[8%] top-[48%] h-3 w-16 rounded-full bg-white/20 blur-md" />

                      {/* Distant mountains */}
                      <div
                        className={`absolute bottom-[24%] h-20 w-full bg-gradient-to-t ${scene.horizon}`}
                        style={{
                          clipPath:
                            "polygon(0 75%, 18% 30%, 32% 65%, 52% 12%, 70% 62%, 86% 25%, 100% 70%, 100% 100%, 0 100%)",
                        }}
                      />

                      {/* Mosque silhouette */}
                      <div className="absolute bottom-[19%] left-0 right-0 flex items-end justify-center text-[#102f2b]">
                        <svg
                          viewBox="0 0 300 95"
                          className="w-full max-w-[280px] drop-shadow-md"
                          fill="currentColor"
                        >
                          <path d="M20 95V48H55V95H20ZM62 95V35Q80 5 98 35V95H62ZM103 95V48H197V95H103ZM202 95V35Q220 5 238 35V95H202ZM245 95V48H280V95H245Z" />
                          <path d="M125 95V49Q150 8 175 49V95H125Z" />
                          <path d="M145 30V13H155V30Z M150 13L150 3L157 12Z" />
                          <path d="M35 48V15H40V48ZM32 15L37 2L43 15ZM260 48V15H265V48ZM257 15L262 2L268 15Z" />
                          <path
                            d="M137 95V66Q150 48 163 66V95Z"
                            fill="#d4b875"
                            opacity=".75"
                          />
                        </svg>
                      </div>

                      {/* Foreground landscape */}
                      <div className="absolute bottom-0 h-[25%] w-full bg-gradient-to-t from-[#0b2923] via-[#174b3a] to-[#174b3a]/80" />

                      {/* Prayer information */}
                      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[#09251f] via-[#12382e]/90 to-transparent px-3 pb-6 pt-12 text-center">
                        <h3 className="font-serif text-2xl font-semibold tracking-wide text-[#fff4d7]">
                          {prayer.name}
                        </h3>

                        <div className="my-2 flex items-center justify-center gap-2">
                          <div className="h-px w-8 bg-[#d8bd78]" />
                          <span className="text-xs text-[#e6ce91]">✧</span>
                          <div className="h-px w-8 bg-[#d8bd78]" />
                        </div>

                       <p
  className="text-1xl sm:text-3xl font-bold tabular-nums tracking-wider text-[#fff1c9]"
  style={{ fontFamily: "'Orbitron', sans-serif" }}
>
  {formatTime(prayer.time)}
</p>

                      
                      </div>

                      {/* Delicate inner gold arch */}
                      <div className="pointer-events-none absolute inset-2 rounded-t-[105px] rounded-b-lg border border-[#e5ca83]/60" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Next  Prayer Time */}
        {nextPrayer && (
          <div className="relative mb-8 mt-4 overflow-hidden rounded-[2rem] border border-[#c5a45e]/70 bg-gradient-to-br from-[#092f25] via-[#14513d] to-[#08291f] px-6 py-9 text-center text-[#fff7e5] shadow-[0_12px_35px_rgba(8,47,36,0.25)] sm:px-10">
            {/* Decorative background details */}
            <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full border border-[#d8bd7b]/15" />
            <div className="pointer-events-none absolute -right-16 -bottom-16 h-56 w-56 rounded-full border border-[#d8bd7b]/15" />

            <div className="relative mx-auto max-w-xl">
              {/* Gold ornament */}
              <div className="mb-4 flex items-center justify-center gap-3 text-[#d9bd79]">
                <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#d9bd79]" />
                <span className="text-xl">✧</span>
                <span className="text-xs tracking-[0.35em]">NEXT PRAYER</span>
                <span className="text-xl">✧</span>
                <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#d9bd79]" />
              </div>

              {/* Prayer name */}
              <h3 className="font-serif text-4xl font-semibold tracking-wide text-[#fff3d4] sm:text-5xl">
                {nextPrayer.name}
              </h3>

              {/* Prayer time */}
              <p className="mt-3 text-base tracking-[0.15em] text-[#e5d5a9]">
                {nextPrayer.time.toLocaleTimeString([], {
                  timeZone: selectedTimezone,
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>

              {/* Decorative divider */}
              <div className="my-7 flex items-center justify-center gap-3">
                <span className="h-px w-16 bg-[#c5a45e]/50" />
                <span className="text-[#d9bd79]">۞</span>
                <span className="h-px w-16 bg-[#c5a45e]/50" />
              </div>

              {/* Countdown */}
              <div className="rounded-2xl border border-[#d9bd79]/35 bg-black/15 px-5 py-5 shadow-inner">
                <p className="mb-2 text-[10px] font-medium tracking-[0.35em] text-[#d9bd79]">
                  TIME REMAINING
                </p>

                <p
  className="text-4xl font-semibold tabular-nums tracking-[0.12em] text-white sm:text-5xl"
  style={{ fontFamily: "'Orbitron', sans-serif" }}
>
  {getCountdown()}
</p>
              </div>

              <p className="mt-5 font-serif text-sm italic text-[#e8d9b5]">
                Prepare your heart for prayer
              </p>

              <div className="mt-4 text-lg text-[#d9bd79]">☾ ✧ ☽</div>
            </div>
          </div>
        )}

        {activeSection === "settings" && (
          <>
            {/* Location and Settings */}

            <section className="mb-6 mx-auto max-w-5xl rounded-2xl border border-[#e8d9b5] bg-[#fffdf8] p-4 shadow-[0_4px_18px_rgba(155,125,65,0.10)] sm:p-5">
              {/* Section Heading */}
              <div className="mb-5 text-center">
                <div className="mb-1 text-xs font-medium tracking-[0.25em] text-[#b18b45]">
                  ✧ GLOBAL ADHAN ✧
                </div>
                <h2 className="text-xl font-semibold tracking-wide text-[#174b3a]">
                  Location & Settings
                </h2>
                <p className="mt-1 text-xs text-[#927d5c]">
                  Choose your location and prayer calculation method
                </p>
                <div className="mx-auto mt-3 h-px w-20 bg-gradient-to-r from-transparent via-[#c5a45e] to-transparent" />
              </div>

              {/* Calculation Settings */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                {/* Calculation Method */}
                <div>
                  <label
                    htmlFor="calculationMethod"
                    className="mb-1.5 block text-xs font-semibold tracking-wide text-[#685638]"
                  >
                    Calculation Method
                  </label>

                  <select
                    id="calculationMethod"
                    value={calculationMethod}
                    onChange={handleCalculationMethodChange}
                    className="w-full max-w-sm rounded-lg border border-[#dfd0ad] bg-white px-3 py-2 text-sm text-[#34483c] shadow-sm outline-none transition focus:border-[#b89550] focus:ring-2 focus:ring-[#eadbb8]"
                  >
                    <option value="2">ISNA (North America)</option>
                    <option value="1">
                      University of Islamic Sciences, Karachi
                    </option>
                    <option value="3">Muslim World League</option>
                    <option value="4">Umm Al-Qura University, Makkah</option>
                    <option value="5">Egyptian General Authority</option>
                  </select>
                </div>

                {/* Asr Method */}
                <div>
                  <label
                    htmlFor="asrMethod"
                    className="mb-1.5 block text-xs font-semibold tracking-wide text-[#685638]"
                  >
                    Asr Calculation
                  </label>

                  <select
                    id="asrMethod"
                    value={asrMethod}
                    onChange={(event) => {
                      const method = event.target.value;
                      setAsrMethod(method);

                      if (activeCoordinates) {
                        getPrayerTimes(
                          activeCoordinates.latitude,
                          activeCoordinates.longitude,
                          calculationMethod,
                          method,
                        );
                      }
                    }}
                    className="w-full max-w-sm rounded-lg border border-[#dfd0ad] bg-white px-3 py-2 text-sm text-[#34483c] shadow-sm outline-none transition focus:border-[#b89550] focus:ring-2 focus:ring-[#eadbb8]"
                  >
                    <option value="0">
                      Standard (Shafi'i, Maliki, Hanbali)
                    </option>
                    <option value="1">Hanafi</option>
                  </select>
                </div>

                {/* Location */}
                <div className="md:col-span-2 border-t border-[#eee4d0] pt-4">
                  <label className="mb-2 block text-xs font-semibold tracking-wide text-[#685638]">
                    Your Location
                  </label>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={detectLocation}
                      className="rounded-lg border border-[#a88a4b] bg-[#174b3a] px-4 py-2 text-xs font-semibold text-[#fffaf0] shadow-sm transition hover:bg-[#21634b] focus:outline-none focus:ring-2 focus:ring-[#d9c28d]"
                    >
                      ✧ Use My Current Location
                    </button>

                    <select
                      value={selectedLocation}
                      onChange={handleLocationChange}
                      disabled={loading}
                      className="w-full rounded-lg border border-[#dfd0ad] bg-white px-3 py-2 text-sm text-[#34483c] outline-none transition focus:border-[#b89550] focus:ring-2 focus:ring-[#eadbb8] disabled:opacity-60 sm:max-w-xs"
                    >
                      <option value="">Choose a saved city</option>

                      {locations.map((location) => (
                        <option key={location._id} value={location._id}>
                          {location.city}, {location.country}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Manage Saved Cities */}
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => setShowSavedCities(!showSavedCities)}
                      className="flex items-center justify-between rounded-lg border border-[#e5d7b8] bg-[#fbf7ed] px-3 py-2 text-xs font-semibold text-[#705b34] transition hover:bg-[#f5ecd9]"
                    >
                      <span>Manage Saved Cities ({locations.length})</span>
                      <span className="ml-5 text-[#b18b45]">
                        {showSavedCities ? "▲" : "▼"}
                      </span>
                    </button>

                    {showSavedCities && (
                      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {locations.map((location) => (
                          <div
                            key={location._id}
                            className="flex items-center justify-between rounded-lg border border-[#eadfc9] bg-white px-3 py-2"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-[#315342]">
                                {location.city}
                              </p>
                              <p className="text-xs text-[#96856a]">
                                {location.country}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                setDeleteConfirmation({
                                  isOpen: true,
                                  cityId: location._id,
                                  cityName: location.city,
                                })
                              }
                              className="ml-2 rounded-md border border-red-100 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                            >
                              Delete
                            </button>
                          </div>
                        ))}

                        {locations.length === 0 && (
                          <p className="rounded-lg bg-[#fbf7ed] p-3 text-xs text-[#927d5c]">
                            No saved cities yet.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Add New City Form */}
                  {showLocationForm && (
                    <form
                      onSubmit={handleAddLocation}
                      className="mt-3 rounded-xl border border-[#e8d9b5] bg-[#fffdf8] p-3"
                    >
                      <h3 className="mb-3 text-sm font-semibold text-[#315342]">
                        Add New City
                      </h3>

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <input
                          type="text"
                          placeholder="City"
                          value={newLocation.city}
                          onChange={(event) =>
                            setNewLocation({
                              ...newLocation,
                              city: event.target.value,
                            })
                          }
                          required
                          className="w-full rounded-lg border border-[#dfd0ad] bg-white px-3 py-2 text-sm outline-none focus:border-[#b89550] focus:ring-2 focus:ring-[#eadbb8]"
                        />

                        <input
                          type="text"
                          placeholder="Country"
                          value={newLocation.country}
                          onChange={(event) =>
                            setNewLocation({
                              ...newLocation,
                              country: event.target.value,
                            })
                          }
                          required
                          className="w-full rounded-lg border border-[#dfd0ad] bg-white px-3 py-2 text-sm outline-none focus:border-[#b89550] focus:ring-2 focus:ring-[#eadbb8]"
                        />

                        <input
                          type="number"
                          step="any"
                          placeholder="Latitude"
                          value={newLocation.latitude}
                          onChange={(event) =>
                            setNewLocation({
                              ...newLocation,
                              latitude: event.target.value,
                            })
                          }
                          required
                          className="w-full rounded-lg border border-[#dfd0ad] bg-white px-3 py-2 text-sm outline-none focus:border-[#b89550] focus:ring-2 focus:ring-[#eadbb8]"
                        />

                        <input
                          type="number"
                          step="any"
                          placeholder="Longitude"
                          value={newLocation.longitude}
                          onChange={(event) =>
                            setNewLocation({
                              ...newLocation,
                              longitude: event.target.value,
                            })
                          }
                          required
                          className="w-full rounded-lg border border-[#dfd0ad] bg-white px-3 py-2 text-sm outline-none focus:border-[#b89550] focus:ring-2 focus:ring-[#eadbb8]"
                        />

                        <input
                          type="text"
                          placeholder="Timezone (e.g. America/New_York)"
                          value={newLocation.timezone}
                          onChange={(event) =>
                            setNewLocation({
                              ...newLocation,
                              timezone: event.target.value,
                            })
                          }
                          required
                          className="w-full rounded-lg border border-[#dfd0ad] bg-white px-3 py-2 text-sm outline-none focus:border-[#b89550] focus:ring-2 focus:ring-[#eadbb8] sm:col-span-2"
                        />
                      </div>

                      <button
                        type="submit"
                        className="mt-3 rounded-lg border border-[#a88a4b] bg-[#174b3a] px-4 py-2 text-xs font-semibold text-[#fffaf0] shadow-sm transition hover:bg-[#21634b]"
                      >
                        Save City
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Location Status */}
              {locationMessage && (
                <p className="mt-4 rounded-lg border border-[#eadbb8] bg-[#fff9e9] px-3 py-2 text-center text-xs text-[#8b6b30]">
                  {locationMessage}
                </p>
              )}

              {/* Current Selection */}
              {currentCity && (
                <div className="mt-3 rounded-lg border border-[#d9e8dc] bg-[#f2f8f1] px-3 py-2 flex justify-center text-center">
                  <p className="flex items-center gap-1.5 text-xs text-[#315342]">
                    <MapPin size={16} className="text-emerald-500" />
                    <span className="font-semibold">{currentCity}</span>
                  </p>
                </div>
              )}
            </section>

            {/* CITY & ADHAN CONTROL CENTER */}
            <section className="mx-auto mt-6 max-w-5xl overflow-hidden rounded-[2rem] border border-[#d8c28b] bg-gradient-to-br from-[#fffdf7] via-[#fbf7ed] to-[#f4eddd] shadow-[0_12px_35px_rgba(23,75,58,0.12)]">
              {/* Elegant Header */}
              <div className="relative overflow-hidden bg-gradient-to-r from-[#0b3025] via-[#174b3a] to-[#0b3025] px-5 py-7 text-center sm:px-8">
                <div className="pointer-events-none absolute -left-12 -top-16 h-40 w-40 rounded-full border border-[#d8bd78]/20" />
                <div className="pointer-events-none absolute -bottom-20 -right-10 h-48 w-48 rounded-full border border-[#d8bd78]/20" />

                <div className="relative">
                  <div className="mb-2 text-xs tracking-[0.35em] text-[#dfc68e]">
                    ✧ YOUR PERSONAL WORSHIP ✧
                  </div>

                  <h2 className="font-serif text-2xl font-semibold tracking-wide text-[#fff4d7] sm:text-3xl">
                    City & Adhan Settings
                  </h2>

                  <p className="mt-2 text-xs text-[#e5d5ac] sm:text-sm">
                    Customize your location and beautiful prayer call
                  </p>

                  <div className="mx-auto mt-4 h-px w-28 bg-gradient-to-r from-transparent via-[#d8bd78] to-transparent" />
                </div>
              </div>

              <div className="space-y-6 p-4 sm:p-7">
                {/* CITY SEARCH */}
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#d8bd78]/60 bg-[#f3ead5] text-lg text-[#174b3a]">
                      <icon name="map-pin" size="lg" />
                    </span>

                    <div>
                      <h3 className="font-serif text-lg font-semibold text-[#174b3a]">
                        Add a New City
                      </h3>
                      <p className="text-xs text-[#927d5c]">
                        Find and save another prayer location
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter city name (e.g. Kabul)"
                      value={citySearch}
                      onChange={(event) => setCitySearch(event.target.value)}
                      className="min-w-0 flex-1 rounded-xl border border-[#dfd2b5] bg-white/80 px-3 py-2.5 text-sm text-[#174b3a] outline-none transition placeholder:text-[#a99b7e] focus:border-[#a98a4e] focus:ring-2 focus:ring-[#c5a45e]/20"
                    />

                    <button
                      type="button"
                      onClick={searchCities}
                      disabled={searchingCities}
                      className="shrink-0 rounded-xl bg-gradient-to-r from-[#174b3a] to-[#23644b] px-4 py-2.5 text-sm font-semibold text-[#fff4d7] shadow-sm transition hover:brightness-110 disabled:opacity-50"
                    >
                      {searchingCities ? "Searching..." : "Search"}
                    </button>
                  </div>

                  {/* CITY SEARCH RESULTS */}
                  {searchResults.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {searchResults.map((city, index) => (
                        <div
                          key={`${city.id}-${index}`}
                          className="flex items-center justify-between gap-3 rounded-xl border border-[#e6d9bc] bg-white/80 p-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#174b3a]">
                              {city.name}
                            </p>

                            <p className="text-xs text-[#927d5c]">
                              {[city.admin1, city.country]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSaveCity(city)}
                            className="shrink-0 rounded-lg bg-[#174b3a] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#23644b]"
                          >
                            Save City
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* GOLD DIVIDER */}
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#dfd2b5]" />
                  <span className="text-sm text-[#b18b45]">✧ ۞ ✧</span>
                  <div className="h-px flex-1 bg-[#dfd2b5]" />
                </div>

                {/* ADHAN SETTINGS */}
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#d8bd78]/60 bg-[#f3ead5] text-[#174b3a]">
                      <icon name="volume-2" size="lg" />
                    </span>

                    <div>
                      <h3 className="font-serif text-lg font-semibold text-[#174b3a]">
                        Adhan Preferences
                      </h3>
                      <p className="text-xs text-[#927d5c]">
                        Choose your prayer call recordings
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* REGULAR ADHAN */}
                    <div className="rounded-2xl border border-[#dfd2b5] bg-white/70 p-4 shadow-sm">
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <h4 className="font-serif text-base font-semibold text-[#174b3a]">
                            Regular Adhan
                          </h4>
                          <p className="text-[11px] text-[#927d5c]">
                            Daily prayer recording
                          </p>
                        </div>

                        <span className="text-xl text-[#b18b45]">☾</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={regularAdhanSrc}
                          onChange={(e) => setRegularAdhanSrc(e.target.value)}
                          className="min-w-0 flex-1 rounded-lg border border-[#dfd2b5] bg-[#faf8f1] p-2.5 text-xs text-[#174b3a] outline-none focus:border-[#a98a4e]"
                        >
                          {regularAdhanOptions.map((option) => (
                            <option key={option.id} value={option.src}>
                              {option.name}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() =>
                            setShowRegularAdhanManager(!showRegularAdhanManager)
                          }
                          title="Manage Regular Adhan recordings"
                          aria-label="Manage Regular Adhan recordings"
                          className="rounded-lg border border-[#dfd2b5] p-2.5 text-[#174b3a] transition hover:bg-[#f3ead5]"
                        >
                          <Settings size={18} strokeWidth={1.6} />
                        </button>
                      </div>

                      {/* REGULAR RECORDING MANAGER */}
                      {showRegularAdhanManager && (
                        <div className="mt-3 rounded-xl border border-[#e6d9bc] bg-[#faf8f1] p-3">
                          <p className="mb-2 text-xs font-semibold text-[#174b3a]">
                            Manage Regular Recordings
                          </p>

                          {regularAdhanOptions.length === 0 ? (
                            <p className="text-xs text-[#927d5c]">
                              No recordings available.
                            </p>
                          ) : (
                            regularAdhanOptions.map((option) => (
                              <div
                                key={option.id}
                                className="mb-2 flex items-center justify-between gap-2 rounded-lg border border-[#e6d9bc] bg-white p-2"
                              >
                                <span className="truncate text-xs text-[#174b3a]">
                                  {option.name}
                                </span>

                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteAdhanRecording(option.id)
                                  }
                                  disabled={option.src === regularAdhanSrc}
                                  title="Delete recording"
                                  aria-label={`Delete ${option.name}`}
                                  className="ml-2 rounded-lg p-2 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                  <Trash2 size={17} strokeWidth={1.7} />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {/* REGULAR AUDIO CONTROLS */}
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={previewRegularAdhan}
                          title="Preview Regular Adhan"
                          aria-label="Preview Regular Adhan"
                          className="flex items-center gap-2 rounded-lg bg-[#174b3a] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#23644b]"
                        >
                          <Play
                            size={16}
                            fill="currentColor"
                            strokeWidth={1.7}
                          />
                          Preview
                        </button>

                        <button
                          type="button"
                          onClick={() => stopAdhan(adhanAudioRef)}
                          title="Stop Regular Adhan"
                          aria-label="Stop Regular Adhan"
                          className="rounded-lg border border-[#dfd2b5] p-2 text-[#174b3a] transition hover:bg-[#f3ead5]"
                        >
                          <Square
                            size={16}
                            fill="currentColor"
                            strokeWidth={1.7}
                          />
                        </button>
                      </div>

                      {/* REGULAR UPLOAD */}
                      <div className="mt-4 border-t border-[#e9dfca] pt-3">
                        <label className="mb-2 block text-xs font-semibold text-[#174b3a]">
                          Upload Regular Adhan (MP3)
                        </label>

                        <input
                          type="file"
                          accept="audio/mpeg,.mp3"
                          onChange={handleRegularAdhanUpload}
                          className="w-full min-w-0 rounded-lg border border-[#dfd2b5] bg-[#faf8f1] p-2 text-xs text-[#927d5c] file:mr-2 file:rounded-md file:border-0 file:bg-[#174b3a] file:px-2 file:py-1.5 file:text-xs file:font-medium file:text-white"
                        />
                      </div>
                    </div>

                    {/* FAJR ADHAN */}
                    <div className="rounded-2xl border border-[#dfd2b5] bg-white/70 p-4 shadow-sm">
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <h4 className="font-serif text-base font-semibold text-[#174b3a]">
                            Fajr Adhan
                          </h4>
                          <p className="text-[11px] text-[#927d5c]">
                            Special dawn recording
                          </p>
                        </div>

                        <span className="text-xl text-[#b18b45]">✧</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={fajrAdhanSrc}
                          onChange={(e) => setFajrAdhanSrc(e.target.value)}
                          className="min-w-0 flex-1 rounded-lg border border-[#dfd2b5] bg-[#faf8f1] p-2.5 text-xs text-[#174b3a] outline-none focus:border-[#a98a4e]"
                        >
                          {fajrAdhanOptions.map((option) => (
                            <option key={option.id} value={option.src}>
                              {option.name}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() =>
                            setShowFajrAdhanManager(!showFajrAdhanManager)
                          }
                          title="Manage Fajr Adhan recordings"
                          aria-label="Manage Fajr Adhan recordings"
                          className="rounded-lg border border-[#dfd2b5] p-2.5 text-[#174b3a] transition hover:bg-[#f3ead5]"
                        >
                          <Settings size={18} strokeWidth={1.6} />
                        </button>
                      </div>

                      {/* FAJR RECORDING MANAGER */}
                      {showFajrAdhanManager && (
                        <div className="mt-3 rounded-xl border border-[#e6d9bc] bg-[#faf8f1] p-3">
                          <p className="mb-2 text-xs font-semibold text-[#174b3a]">
                            Manage Fajr Recordings
                          </p>

                          {fajrAdhanOptions.length === 0 ? (
                            <p className="text-xs text-[#927d5c]">
                              No recordings available.
                            </p>
                          ) : (
                            fajrAdhanOptions.map((option) => (
                              <div
                                key={option.id}
                                className="mb-2 flex items-center justify-between gap-2 rounded-lg border border-[#e6d9bc] bg-white p-2"
                              >
                                <span className="truncate text-xs text-[#174b3a]">
                                  {option.name}
                                </span>

                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteAdhanRecording(option.id)
                                  }
                                  disabled={option.src === fajrAdhanSrc}
                                  title="Delete recording"
                                  aria-label={`Delete ${option.name}`}
                                  className="ml-2 rounded-lg p-2 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                  <Trash2 size={17} strokeWidth={1.7} />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {/* FAJR AUDIO CONTROLS */}
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={previewFajrAdhan}
                          title="Preview Fajr Adhan"
                          aria-label="Preview Fajr Adhan"
                          className="flex items-center gap-2 rounded-lg bg-[#174b3a] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#23644b]"
                        >
                          <Play
                            size={16}
                            fill="currentColor"
                            strokeWidth={1.7}
                          />
                          Preview
                        </button>

                        <button
                          type="button"
                          onClick={() => stopAdhan(fajrAdhanAudioRef)}
                          title="Stop Fajr Adhan"
                          aria-label="Stop Fajr Adhan"
                          className="rounded-lg border border-[#dfd2b5] p-2 text-[#174b3a] transition hover:bg-[#f3ead5]"
                        >
                          <Square
                            size={16}
                            fill="currentColor"
                            strokeWidth={1.7}
                          />
                        </button>
                      </div>

                      {/* FAJR UPLOAD */}
                      <div className="mt-4 border-t border-[#e9dfca] pt-3">
                        <label className="mb-2 block text-xs font-semibold text-[#174b3a]">
                          Upload Fajr Adhan (MP3)
                        </label>

                        <input
                          type="file"
                          accept="audio/mpeg,.mp3"
                          onChange={handleFajrAdhanUpload}
                          className="w-full min-w-0 rounded-lg border border-[#dfd2b5] bg-[#faf8f1] p-2 text-xs text-[#927d5c] file:mr-2 file:rounded-md file:border-0 file:bg-[#174b3a] file:px-2 file:py-1.5 file:text-xs file:font-medium file:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ENABLE / DISABLE SETTINGS */}
                <div className="rounded-2xl border border-[#dfd2b5] bg-[#f7f1e5] p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Settings size={17} className="text-[#a98a4e]" />
                    <h4 className="font-serif text-sm font-semibold text-[#174b3a]">
                      Prayer Alert Controls
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#e5d8bb] bg-white/80 p-3 text-sm text-[#174b3a] transition hover:border-[#c5a45e]">
                      <input
                        type="checkbox"
                        checked={regularAdhanEnabled}
                        onChange={(e) =>
                          setRegularAdhanEnabled(e.target.checked)
                        }
                        className="h-4 w-4 accent-emerald-700"
                      />
                      <span className="font-medium">Enable Regular Adhan</span>
                    </label>

                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#e5d8bb] bg-white/80 p-3 text-sm text-[#174b3a] transition hover:border-[#c5a45e]">
                      <input
                        type="checkbox"
                        checked={fajrAdhanEnabled}
                        onChange={(e) => setFajrAdhanEnabled(e.target.checked)}
                        className="h-4 w-4 accent-emerald-700"
                      />
                      <span className="font-medium">Enable Fajr Adhan</span>
                    </label>
                  </div>
                </div>

                <div className="pb-1 text-center text-xs tracking-[0.2em] text-[#b18b45]">
                  ✧ ۞ ✧
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* DUAS MODAL */}
      {activeSection === "duas" && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative mx-auto my-6 w-full max-w-5xl">
            <button
              onClick={() => setActiveSection("")}
              className="absolute right-3 top-3 z-50 flex h-9 w-9 items-center justify-center rounded-full border border-[#c5a45e] bg-[#174b3a] text-xl text-[#fff4d7] shadow-lg hover:bg-[#236b4e]"
              aria-label="Close Duas"
            >
              ×
            </button>
            <Duas />
          </div>
        </div>
      )}

      {/* ISLAMIC LIBRARY MODAL */}
      {activeSection === "books" && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative mx-auto my-6 w-full max-w-5xl">
            <button
              onClick={() => setActiveSection("")}
              className="absolute right-3 top-3 z-50 flex h-9 w-9 items-center justify-center rounded-full border border-[#c5a45e] bg-[#174b3a] text-xl text-[#fff4d7] shadow-lg hover:bg-[#236b4e]"
              aria-label="Close Islamic Library"
            >
              ×
            </button>
            <IslamicLibrary />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white px-6 py-6 text-center text-sm text-slate-500">
        <p>For further connections, visit us at</p>

        <a
          href="https://www.yadgar.net"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block font-semibold text-[#174b3a] underline decoration-[#c5a45e] underline-offset-4 transition hover:text-[#b18b45]"
        >
          www.yadgar.net
        </a>
      </footer>

      {showRamadanCalendar && (
        <RamadanCalendar
          onClose={() => setShowRamadanCalendar(false)}
          coordinates={activeCoordinates}
          timezone={selectedTimezone}
          calculationMethod={calculationMethod}
          asrMethod={asrMethod}
          currentCity={currentCity}
        />
      )}

      {showPreAdhanScreen && (
        <PreAdhanScreen
          prayerName="Maghrib"
          prayerTime={prayerTimes?.Maghrib}
          timezone={selectedTimezone}
          city={currentCity}
          isRamadan={calendarDates.lunar.month === "رمضان"}
          onClose={() => setShowPreAdhanScreen(false)}
        />
      )}
      {/* Regular Adhan audio player */}
      <audio ref={adhanAudioRef} src={regularAdhanSrc} preload="auto" />

      {/* Fajr Adhan audio player */}
      <audio ref={fajrAdhanAudioRef} src={fajrAdhanSrc} preload="auto" />
    </div>
  );
};

export default App;
