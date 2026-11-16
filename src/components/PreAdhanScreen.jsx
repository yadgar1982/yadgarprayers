
import AnalogClock from "./AnalogClock";
import PrayerCountdown from "./PrayerCountdown";

const PreAdhanScreen = ({
  prayerName = "Maghrib",
  prayerTime,
  timezone,
  city,
  isRamadan = false,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex h-[100dvh] flex-col overflow-hidden bg-gradient-to-b from-[#061b19] via-[#0c3027] to-[#041512] text-white">
      
    

      {/* Header */}
      <header className="relative z-10 flex shrink-0 items-center justify-between px-5 py-5 sm:px-10">
                <button
          type="button"
          onClick={onClose}
          aria-label="Close pre-Adhan screen"
          className="rounded-full border border-[#d2b66f]/50 px-4 py-2 text-sm text-[#f2d797] transition hover:bg-[#d2b66f] hover:text-[#102a22]"
        >
          Close
        </button>
      </header>

     {/* Main content */}
<main className="relative z-10 mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col items-center justify-center gap-5 overflow-hidden px-2 py-3 sm:px-4">

  {/* Large Analog Clock */}
  <div className="w-full max-w-[min(75vh,600px)]">
    <AnalogClock timezone={timezone} isRamadan={isRamadan} />
  </div>

  {/* Prayer and Location */}
  <div className="text-center">
    <h1 className="font-serif text-2xl font-semibold text-[#f4d995] sm:text-3xl">
      {prayerName} in {city}
    </h1>

  </div>

  {/* Countdown */}
  <PrayerCountdown
    prayerName={prayerName}
    prayerTime={prayerTime}
    timezone={timezone}
  />

</main>
     
    </div>
  );
};

export default PreAdhanScreen;

