import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import "./quranStopStyles.css";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Languages,
  Search,
  Minus,
  Plus,
  LoaderCircle,
  Bookmark,
  BookmarkCheck,
  PanelTop,
} from "lucide-react";

const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");
const QURANENC = "https://quranenc.com/api/v1";
const TOTAL_PAGES = 610;
const TRANSLATION_OPTIONS = [
  { id: "fa", label: "Dari", key: "dari_badkhashani" },
  { id: "ur", label: "اردو", key: "urdu_junagarhi" },
  { id: "en", label: "English", key: "english_saheeh" },
  { id: "ps", label: "پښتو", key: "pashto_rwwad" },
];



export default function QuranReader({ onBack }) {
  const [page, setPage] = useState(() => {
    try {
      const v = JSON.parse(
        localStorage.getItem("yadgar-quran-progress") || "null",
      );
      return v?.page >= 1 && v.page <= TOTAL_PAGES ? Number(v.page) : 1;
    } catch {
      return 1;
    }
  });
  const [sura, setSura] = useState(() => {
    try {
      const v = JSON.parse(
        localStorage.getItem("yadgar-quran-progress") || "null",
      );
      return v?.sura >= 1 && v.sura <= 114 ? Number(v.sura) : 1;
    } catch {
      return 1;
    }
  });
  const [names, setNames] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [search, setSearch] = useState("");
  const [surahListOpen, setSurahListOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState("surah");
  const [showDari, setShowDari] = useState(false);
  const [translationLanguage, setTranslationLanguage] = useState("fa");
  const [fontSize, setFontSize] = useState(26);
  const [pageData, setPageData] = useState(null);
  const [pageTurnDirection, setPageTurnDirection] = useState("");
  const [pendingPageTurn, setPendingPageTurn] = useState(null);
  const [dariByVerse, setDariByVerse] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [translationVersion, setTranslationVersion] = useState("");
  const pendingSurahSelection = useRef(null);
  const [displayOnlySurah, setDisplayOnlySurah] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("yadgar-quran-progress") || "null")
          ?.displayOnlySurah || null
      );
    } catch {
      return null;
    }
  });
  const [controlsOpen, setControlsOpen] = useState(false);
  const [bookmark, setBookmark] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("yadgar-quran-bookmark") || "null",
      );
    } catch {
      return null;
    }
  });

  useEffect(() => {
    let alive = true;

    Promise.all([
      fetch(`${QURANENC}/translations/sowar_names?iso_code=ar`).then((r) =>
        r.json(),
      ),
      fetch(`${QURANENC}/translations/sowar_names?iso_code=en`).then((r) =>
        r.json(),
      ),
      fetch(`${API_BASE}/api/quran/chapters`).then((r) => {
        if (!r.ok) throw new Error("Could not load surah page ranges.");
        return r.json();
      }),
    ])
      .then(([ar, en, chapterResponse]) => {
        if (!alive) return;

        setNames(
          Array.from({ length: 114 }, (_, i) => ({
            number: i + 1,
            arabic: ar?.[i + 1] || "",
            english: en?.[i + 1] || `Surah ${i + 1}`,
          })),
        );

        const chapterList = Array.isArray(chapterResponse)
          ? chapterResponse
          : chapterResponse?.chapters ||
            chapterResponse?.data?.chapters ||
            chapterResponse?.data ||
            [];

        setChapters(chapterList);
      })
      .catch(() => {
        if (alive) {
          setNames(
            Array.from({ length: 114 }, (_, i) => ({
              number: i + 1,
              arabic: "",
              english: `Surah ${i + 1}`,
            })),
          );
        }
      });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    fetch(`${QURANENC}/translations/list/?localization=fa`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        const item = data?.translations?.find(
          (t) => t.key === "dari_badkhashani",
        );
        if (item?.version) setTranslationVersion(String(item.version));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setPageData(null);

    fetch(`${API_BASE}/api/quran/page/${page}`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok)
          throw new Error(
            "Could not load this Mushaf page. Check your page endpoint.",
          );
        return r.json();
      })
      .then((data) => {
        if (!Array.isArray(data?.verses))
          throw new Error("The page endpoint returned no verses.");
        setPageData(data);
        const firstVerseKey = data.verses[0]?.verse_key;
        const selectedSurah = pendingSurahSelection.current;
        if (selectedSurah != null) {
          setSura(selectedSurah);
          setDisplayOnlySurah(selectedSurah);
          pendingSurahSelection.current = null;
        } else if (firstVerseKey) {
          setSura(Number(firstVerseKey.split(":")[0]));
          setDisplayOnlySurah(null);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [page]);

  useEffect(() => {
    if (!showDari || !pageData?.verses?.length) return;

    const selectedTranslation = TRANSLATION_OPTIONS.find(
      (language) => language.id === translationLanguage,
    );

    if (!selectedTranslation) return;

    const surahNumbers = [
      ...new Set(pageData.verses.map((v) => Number(v.verse_key.split(":")[0]))),
    ];

    let cancelled = false;

    Promise.all(
      surahNumbers.map((number) =>
        fetch(
          `${QURANENC}/translation/sura/${selectedTranslation.key}/${number}`,
        )
          .then((response) => (response.ok ? response.json() : null))
          .then((data) => ({
            number,
            verses: Array.isArray(data?.result) ? data.result : [],
          })),
      ),
    )
      .then((results) => {
        if (cancelled) return;

        const translationMap = {};

        results.forEach(({ number, verses }) => {
          verses.forEach((v) => {
            if (v.aya != null && v.translation) {
              translationMap[`${number}:${v.aya}`] = v.translation;
            }
          });
        });

        setDariByVerse(translationMap);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [showDari, pageData, translationLanguage]);

  const active = names.find((item) => item.number === sura);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return names;
    return names.filter(
      (x) =>
        x.english.toLowerCase().includes(q) ||
        x.arabic.includes(search.trim()) ||
        String(x.number).includes(q),
    );
  }, [names, search]);

  const lines = useMemo(() => {
    const grouped = new Map();
    const lastLineByVerse = {};

    const visibleVerses = displayOnlySurah
      ? (pageData?.verses || []).filter(
          (verse) => Number(verse.verse_key.split(":")[0]) === displayOnlySurah,
        )
      : pageData?.verses || [];

    visibleVerses.forEach((verse) => {
      (verse.words || []).forEach((word) => {
        const lineNumber = Number(word.line_number);
        if (!Number.isFinite(lineNumber)) return;

        if (!grouped.has(lineNumber)) grouped.set(lineNumber, []);
        grouped.get(lineNumber).push({
          ...word,
          verseKey: verse.verse_key,
          verseNumber: verse.verse_number,
        });

        lastLineByVerse[verse.verse_key] = Math.max(
          lastLineByVerse[verse.verse_key] || 0,
          lineNumber,
        );
      });
    });

    return [...grouped.entries()]
      .sort(([a], [b]) => a - b)
      .map(([lineNumber, words]) => ({ lineNumber, words }))
      .map((line) => ({
        ...line,
        lastLineByVerse,
      }));
  }, [pageData, displayOnlySurah]);

  const toArabicNumber = (value) =>
    String(value).replace(/\d/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)]);

  const selectSura = (number) => {
    if (number < 1 || number > 114) return;

    pendingSurahSelection.current = number;
    setSura(number);
    setSearch("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });

    fetch(`${API_BASE}/api/quran/chapters?chapter_number=${number}`)
      .then((response) => {
        if (!response.ok)
          throw new Error("Could not find this surah's IndoPak starting page.");
        return response.json();
      })
      .then((data) => {
        const startPage = Number(data?.startPage);
        if (
          !Number.isInteger(startPage) ||
          startPage < 1 ||
          startPage > TOTAL_PAGES
        ) {
          throw new Error(
            "The chapters endpoint did not return a valid IndoPak startPage.",
          );
        }
        setSura(number);
        setDisplayOnlySurah(number);
        setPage(startPage);
      })
      .catch((err) => {
        pendingSurahSelection.current = null;
        setError(err.message);
      });
  };

  const selectJuz = async (juzNumber) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/quran/chapters?juz_number=${juzNumber}`,
      );

      const data = await response.json();

      if (!response.ok || !data.startPage) {
        console.error("Unable to load Juz:", data);
        return;
      }

      pendingSurahSelection.current = null;
      setDisplayOnlySurah(null);
      setPage(data.startPage);
      setSurahListOpen(false);
      setSearch("");
    } catch (error) {
      console.error("Error loading Juz:", error);
    }
  };

  const changePage = (nextPage) => {
    if (nextPage < 1 || nextPage > TOTAL_PAGES || pendingPageTurn !== null) {
      return;
    }

    const direction = nextPage > page ? "next" : "previous";

    pendingSurahSelection.current = null;
    setDisplayOnlySurah(null);

    setPageTurnDirection(direction);
    setPendingPageTurn(nextPage);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageTap = (event) => {
    // Don't turn the page when tapping Quran text or controls.
    if (
      event.target.closest(
        ".quran-mushaf-text, button, a, input, select, textarea",
      )
    ) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const tapX = event.clientX - rect.left;
    const pageMiddle = rect.width / 2;

    if (tapX >= pageMiddle) {
      changePage(page + 1);
    } else {
      changePage(page - 1);
    }
  };

  useEffect(() => {
    if (!pageData?.verses?.length || loading) return;
    try {
      localStorage.setItem(
        "yadgar-quran-progress",
        JSON.stringify({ page, sura, displayOnlySurah, showDari, fontSize }),
      );
    } catch (e) {
      console.warn("Quran progress could not be saved", e);
    }
  }, [pageData, loading, page, sura, displayOnlySurah, showDari, fontSize]);

  const bookmarkActive = Boolean(
    bookmark &&
    Number(bookmark.page) === Number(page) &&
    Number(bookmark.sura) === Number(sura) &&
    (bookmark.displayOnlySurah || null) === (displayOnlySurah || null),
  );

  const saveBookmark = () => {
    try {
      if (bookmarkActive) {
        localStorage.removeItem("yadgar-quran-bookmark");
        setBookmark(null);
        return;
      }

      const saved = {
        page,
        sura,
        displayOnlySurah,
        showDari,
        fontSize,
        savedAt: Date.now(),
      };

      localStorage.setItem("yadgar-quran-bookmark", JSON.stringify(saved));
      setBookmark(saved);
    } catch {
      setError("Bookmark could not be saved on this device.");
    }
  };

  const resumeBookmark = () => {
    if (!bookmark) return;
    setSura(Number(bookmark.sura) || 1);
    setDisplayOnlySurah(bookmark.displayOnlySurah || null);
    pendingSurahSelection.current = bookmark.displayOnlySurah || null;
    if (typeof bookmark.showDari === "boolean") setShowDari(bookmark.showDari);
    if (Number(bookmark.fontSize)) setFontSize(Number(bookmark.fontSize));
    const target = Number(bookmark.page);
    if (Number.isInteger(target) && target >= 1 && target <= TOTAL_PAGES)
      setPage(target);
    setControlsOpen(false);
  };

  return (
    <main className="fixed inset-0 z-[9999] h-[100vh] h-[100dvh] w-full max-w-[100vw] min-w-0 overflow-hidden bg-[#fffdf7] p-0 text-[#183d30]">
     
      <div className="relative flex h-full w-full min-w-0 flex-col overflow-hidden">
        <header
          className={`${controlsOpen ? "flex" : "hidden"} shrink-0 items-center justify-between gap-2 border-b border-[#e7dcc5] bg-[#fffdf7] px-3 py-2`}
        >
          <button
            onClick={onBack}
            className="inline-flex min-h-8 mt-3  items-center gap-2 rounded-xl border border-[#d8c9a9] bg-[#fffdf7] px-4 text-sm font-semibold hover:border-[#b99a55]"
          >
            <ArrowLeft size={17} /> Back to Library
          </button>
          <span className="rounded-full border border-[#d8c9a9] bg-[#fffdf7] px-3 py-2 text-xs text-[#7b6845]">
            Yadgar Quran
          </span>
        </header>

        <section className="flex min-h-0 w-full min-w-0 flex-none flex-col overflow-hidden border-0 bg-[#fffdf7] shadow-none">
          <header
            className={`${controlsOpen ? "block" : "hidden"} shrink-0 bg-gradient-to-br from-[#063b2e] via-[#174b3a] to-[#063b2e] px-3 py-2 text-center text-[#fff4d7]`}
          >
            <h1 className="mt-2 font-serif text-2xl font-bold sm:text-3xl">
              القرآن الكريم
            </h1>
          </header>

          <div
            className={`${controlsOpen ? "block" : "hidden"} max-h-[38dvh] shrink-0 overflow-y-auto border-b border-[#e7dcc5] bg-[#fbf7ed] p-2`}
          >
            <button
              type="button"
              onClick={() => setSurahListOpen((open) => !open)}
              aria-expanded={surahListOpen}
              aria-label={
                surahListOpen ? "Close Surah picker" : "Open Surah picker"
              }
              className="mb-3 flex w-full items-center gap-3 rounded-xl border border-[#d5c095] bg-[#fffdf7] px-3.5 py-3 text-left transition-colors hover:border-[#b99a55] hover:bg-[#fffaf0]"
            >
              {/* Decorative Surah number */}
              <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg border border-[#d8c49a] bg-[#f8f0df]">
                <span className="text-[9px] tracking-widest text-[#9a8050]">
                  SURAH
                </span>
                <span className="text-sm font-semibold tabular-nums text-[#174b3a]">
                  {String(sura).padStart(3, "0")}
                </span>
              </span>

              {/* Selected Surah */}
              <span className="min-w-0 flex-1">
                <span className="mb-1 block text-[10px] font-medium uppercase tracking-[0.15em] text-[#9a8050]">
                  Currently reading
                </span>

                <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="text-base font-semibold text-[#174b3a]">
                    {names.find((item) => item.number === sura)?.english ||
                      `Surah ${sura}`}
                  </span>

                  <span dir="rtl" className="font-serif text-lg text-[#8b6d36]">
                    {names.find((item) => item.number === sura)?.arabic || ""}
                  </span>
                </span>
              </span>

              {/* Picker indicator */}
              <span className="flex shrink-0 flex-col items-center gap-1">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e4d5b6] bg-white text-[#8b6d36] transition-colors group-hover:bg-[#f8f0df]">
                  <ChevronLeft
                    size={16}
                    className={`transition-transform duration-200 ${
                      surahListOpen ? "-rotate-90" : "rotate-180"
                    }`}
                  />
                </span>
                <span className="text-[10px] text-[#8b6d36]">
                  {surahListOpen ? "Close" : "Browse"}
                </span>
              </span>
            </button>

            {surahListOpen && (
              <div>
                <div className="mb-2 flex items-center gap-2">
                  {/* Surah / Juz tabs */}
                  <div className="grid w-[42%] shrink-0 grid-cols-2 gap-1 rounded-xl border border-[#ded1b5] bg-white p-1">
                    <button
                      type="button"
                      onClick={() => {
                        setPickerMode("surah");
                        setSearch("");
                      }}
                      className={`rounded-lg px-2 py-2 text-sm font-semibold transition ${
                        pickerMode === "surah"
                          ? "bg-[#174b3a] text-white shadow-sm"
                          : "text-[#7b6845] hover:bg-[#f5eedf]"
                      }`}
                    >
                      Surah
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPickerMode("juz");
                        setSearch("");
                      }}
                      className={`rounded-lg px-2 py-2 text-sm font-semibold transition ${
                        pickerMode === "juz"
                          ? "bg-[#174b3a] text-white shadow-sm"
                          : "text-[#7b6845] hover:bg-[#f5eedf]"
                      }`}
                    >
                      Juz
                    </button>
                  </div>

                  {/* Search */}
                  <div className="relative min-w-0 flex-1">
                    <Search
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#987638]"
                    />
                    <input
                      value={search}
                      S
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={
                        pickerMode === "surah"
                          ? "Search Surah..."
                          : "Search Juz..."
                      }
                      autoFocus
                      className="min-h-11 w-full rounded-xl border border-[#ded1b5] bg-white pl-9 pr-2 text-sm outline-none focus:border-[#b99a55] focus:ring-4 focus:ring-[#c5a45e]/15"
                    />
                  </div>
                </div>

                <div className="mt-2 overflow-hidden rounded-xl border border-[#ded1b5] bg-white">
                  <div className="flex items-center justify-between border-b border-[#eee4cf] px-3 py-2">
                    <span className="text-xs font-semibold text-[#7b6845]">
                      All 114 Surahs
                    </span>
                    <span className="text-[11px] text-[#987638]">
                      {filtered.length} shown
                    </span>
                  </div>
                  <div className="surah-picker-scroll max-h-[65vh] overflow-y-auto overscroll-contain touch-pan-y p-1">
                    {pickerMode === "surah" &&
                      filtered.map((item) => (
                        <button
                          key={item.number}
                          onClick={() => {
                            setSurahListOpen(false);
                            setSearch("");
                            selectSura(item.number);
                          }}
                          aria-current={
                            item.number === sura ? "true" : undefined
                          }
                          className={`flex min-h-10 w-full items-center justify-between rounded-lg px-3 text-left text-sm transition ${
                            item.number === sura
                              ? "bg-[#174b3a] text-[#fff4d7]"
                              : "text-[#3f4b3e] hover:bg-[#f5eedf]"
                          }`}
                        >
                          <span>
                            <span
                              className={`mr-2 ${item.number === sura ? "text-[#e8c879]" : "text-[#987638]"}`}
                            >
                              {item.number}.
                            </span>
                            {item.english}
                          </span>
                          <span dir="rtl" className="font-serif text-base">
                            {item.arabic}
                          </span>
                        </button>
                      ))}

                    {pickerMode === "juz" &&
                      Array.from({ length: 30 }, (_, i) => i + 1)
                        .filter((juz) => String(juz).includes(search.trim()))
                        .map((juz) => (
                          <button
                            key={juz}
                            type="button"
                            onClick={() => selectJuz(juz)}
                            className="w-full rounded-lg px-3 py-2 text-left text-sm text-[#174b3a] hover:bg-[#f5eedf]"
                          >
                            Juz {juz}
                          </button>
                        ))}

                    {pickerMode === "surah" && !filtered.length && (
                      <p className="p-3 text-sm text-[#8b7955]">
                        No Surah found.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-h-11 items-center gap-1 rounded-xl border border-[#d8c9a9] bg-white px-2">
                <button
                  aria-label="Decrease Arabic font size"
                  onClick={() => setFontSize((s) => Math.max(16, s - 2))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#f5eedf]"
                >
                  <Minus size={15} />
                </button>
                <span className="min-w-8 text-center text-xs text-[#7b6845]">
                  {fontSize}
                </span>
                <button
                  aria-label="Increase Arabic font size"
                  onClick={() => setFontSize((s) => Math.min(48, s + 2))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[#f5eedf]"
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-2 py-2 pb-[calc(env(safe-area-inset-bottom)+8px)]">
            <div className="mx-auto w-full max-w-3xl min-w-0">
              <div className="relative mb-3 text-left sm:text-center">
                <div className="absolute left-0 right-0 top-1/2 border-t border-[#c7a45b]/50" />
                <div className="relative inline-block bg-[#fffdf7] px-5 text-left sm:text-center">
                  <p className="text-xs font-semibold tracking-wide text-[#987638]">
                    PAGE {page}
                  </p>
                  <h2
                    dir="rtl"
                    className="mt-1 font-serif text-3xl font-bold text-[#174b3a] sm:text-4xl"
                  >
                    {active?.arabic || "سورة"}
                  </h2>
                  {/* <p className="mt-1 text-sm text-[#8b7955]">
                    {active?.english || `Surah ${sura}`}
                  </p> */}
                </div>
              </div>

              {loading && (
                <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-[#8b7955]">
                  <LoaderCircle
                    size={28}
                    className="animate-spin text-[#987638}"
                  />
                  <p className="text-sm">Loading Mushaf page...</p>
                </div>
              )}

              {error && !loading && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-center text-sm text-red-700">
                  {error}
                  <p className="mt-2 text-xs">Backend: {API_BASE}</p>
                </div>
              )}

              {!loading && !error && (
                <div
                  onClick={handlePageTap}
                  onAnimationEnd={(event) => {
                    if (event.target !== event.currentTarget) return;

                    if (pendingPageTurn !== null) {
                      setPage(pendingPageTurn);
                      setPendingPageTurn(null);
                    }

                    setPageTurnDirection("");
                  }}
                  className={`quran-page-content ${
                    pageTurnDirection ? `page-turn-${pageTurnDirection}` : ""
                  } mx-auto w-full max-w-full min-w-0 overflow-y-auto overflow-x-hidden rounded-[12px] border-2 border-double border-[#c7a45b]/70 bg-[#fffdf7] px-4 py-3 sm:p-5`}
                >
                  <div
                    className="quran-mushaf-text w-full max-w-full min-w-0 space-y-0"
                    dir="rtl"
                    style={{ fontSize: `${fontSize}px` }}
                  >
                    {lines
                      .flatMap((line) => line.words)
                      .map((word, index) => {
                        const key =
                          word.id ??
                          `${word.verseKey}-${word.position}-${index}`;
                        const wordSurah = Number(word.verseKey.split(":")[0]);
                        const isSurahStart =
                          Number(word.verseNumber) === 1 &&
                          Number(word.position) === 1;
                        const surahName = names.find(
                          (item) => item.number === wordSurah,
                        );
                        const translation = dariByVerse[word.verseKey];
                        const isAyahEnd = word.char_type_name === "end";

                        return (
                          <Fragment key={key}>
                            {isSurahStart && (
                              <>
                                <div className="my-2 w-full clear-both border-y border-[#d9bd7a] py-2 text-center">
                                  <span className="block font-serif text-xl font-bold text-[#174b3a]">
                                    {surahName?.arabic || ""}
                                  </span>
                                  <span className="block text-xs text-[#8b7955]">
                                    {surahName?.english || `Surah ${wordSurah}`}
                                  </span>
                                </div>
                                {wordSurah !== 1 && wordSurah !== 9 && (
                                  <div
                                    dir="rtl"
                                    className="mb-2 w-full clear-both text-center font-serif text-[#174b3a]"
                                    style={{ fontSize: `${fontSize}px` }}
                                  >
                                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                                  </div>
                                )}
                              </>
                            )}

                            {isAyahEnd ? (
                              <span
                                aria-label={`Ayah ${word.verseNumber}`}
                                title={`Ayah ${word.verseNumber}`}
                                className="quran-ayah-stop mx-1 inline-flex align-middle"
                              >
                                <span className="quran-ayah-stop-number">
                                  {toArabicNumber(word.verseNumber)}
                                </span>
                              </span>
                            ) : (
                              <span className="inline">
                                {(
                                  word.text_indopak_nastaleeq ||
                                  word.text ||
                                  ""
                                ).replace(
                                  /[\uE000-\uF8FF\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}\u25A1\u25A0\u25FB\u25FC\u25FD\u25FE\u25AB\u25BB]/gu,
                                  "",
                                )}{" "}
                              </span>
                            )}

                            {showDari && isAyahEnd && translation && (
                              <p
                                key={`translation-${word.verseKey}`}
                                dir={
                                  translationLanguage === "en" ? "ltr" : "rtl"
                                }
                                lang={translationLanguage}
                                className="my-1 w-full clear-both border-b border-[#e9dfcb] py-2 leading-7 text-[#62533b]"
                                style={{
                                  direction:
                                    translationLanguage === "en"
                                      ? "ltr"
                                      : "rtl",
                                  unicodeBidi: "plaintext",
                                  textAlign:
                                    translationLanguage === "en"
                                      ? "left"
                                      : "justify",
                                  textAlignLast:
                                    translationLanguage === "en"
                                      ? "left"
                                      : "right",
                                  fontSize: `${Math.max(12, fontSize * 0.62)}px`,
                                  lineHeight:
                                    translationLanguage === "ur" ? 2.2 : 1.8,
                                  fontFamily:
                                    translationLanguage === "ur"
                                      ? '"Noto Nastaliq Urdu", serif'
                                      : translationLanguage === "en"
                                        ? "Arial, sans-serif"
                                        : '"Noto Naskh Arabic", serif',
                                }}
                              >
                                {translation}
                                <span
                                  className={`${
                                    translationLanguage === "en"
                                      ? "ml-2"
                                      : "mr-2"
                                  } inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#c7a45b]/70 bg-[#f8f1e2] align-middle text-xs leading-none text-[#987638]`}
                                  style={{
                                    fontFamily: '"Noto Naskh Arabic", serif',
                                    lineHeight: 1,
                                    direction: "ltr",
                                  }}
                                >
                                  {toArabicNumber(word.verseNumber)}
                                </span>
                              </p>
                            )}
                          </Fragment>
                        );
                      })}
                  </div>
                </div>
              )}

              <nav className="mt-3 flex items-center justify-between gap-1 border-t border-[#e7dcc5] pt-2">
                <button
                  disabled={page === TOTAL_PAGES}
                  onClick={() => changePage(page + 1)}
                  className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-[#d8c9a9] bg-white px-3 text-sm font-semibold disabled:opacity-40 sm:px-4"
                >
                  <ChevronLeft size={17} />
                  Next page
                </button>
                <span className="text-xs font-medium text-[#8b7955]">
                  {page} / {TOTAL_PAGES}
                </span>

                <button
                  disabled={page === 1}
                  onClick={() => changePage(page - 1)}
                  className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-[#d8c9a9] bg-white px-3 text-sm font-semibold disabled:opacity-40 sm:px-4"
                >
                  Previous page <ChevronRight size={17} />
                </button>
              </nav>
            </div>
          </div>
        </section>

        <footer className="shrink-0 border-t border-[#e7dcc5] bg-[#fffdf7] py-2 text-center text-xs text-[#8b7955]">
  © {new Date().getFullYear()} Yadgar Tech Production
</footer>

        <div className="pointer-events-none absolute right-3 top-3 z-[10000] flex items-center gap-2 rounded-2xl border border-[#e8dcc4] bg-[#fffdf8]/95 p-1.5 shadow-[0_4px_14px_rgba(23,75,58,0.10)] backdrop-blur-sm">
          <button
            type="button"
            onClick={() => {
              setControlsOpen(true);
              setSurahListOpen(true);
            }}
            className="pointer-events-auto max-w-[100px] truncate rounded-lg border border-[#ded1b5] bg-white px-2 py-2 text-xs text-[#174b3a]"
            title="Choose Surah"
          >
            {active?.english || `Surah ${sura}`}
          </button>
          <select
            className="pointer-events-auto max-w-[110px] min-w-0 rounded-lg border border-[#ded1b5] bg-white px-2 py-2 text-xs"
            value={translationLanguage}
            onChange={(e) => {
              const value = e.target.value;

              setTranslationLanguage(value);

              if (value === "") {
                setShowDari(false);
              } else {
                setShowDari(true);
              }
            }}
          >
            <option value="">Quran only</option>

            {TRANSLATION_OPTIONS.map((language) => (
              <option key={language.id} value={language.id}>
                {language.label}
              </option>
            ))}
          </select>

          {/* Bookmark */}
          <button
            type="button"
            onClick={saveBookmark}
            aria-label="Bookmark this Quran page"
            aria-pressed={bookmarkActive}
            title={
              bookmarkActive ? "Bookmarked — click to remove" : "Save bookmark"
            }
            className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-xl border border-transparent bg-transparent transition-colors hover:bg-[#f3eee3]"
          >
            {bookmarkActive ? (
              <BookmarkCheck size={18} className="text-[#c7a45b]" />
            ) : (
              <Bookmark size={18} className="text-[#174b3a]" />
            )}
          </button>

          {/* Resume saved bookmark */}
          {bookmark && (
            <button
              type="button"
              onClick={resumeBookmark}
              className="pointer-events-auto flex h-9 items-center justify-center rounded-xl bg-[#174b3a] px-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#103b2d]"
            >
              Resume
            </button>
          )}

          {/* Quran controls */}
          <button
            type="button"
            onClick={() => setControlsOpen((open) => !open)}
            aria-label={
              controlsOpen ? "Hide Quran controls" : "Show Quran controls"
            }
            aria-pressed={controlsOpen}
            title={controlsOpen ? "Hide controls" : "Show controls"}
            className={`pointer-events-auto flex h-9 w-9 items-center justify-center rounded-xl border border-transparent transition-colors ${
              controlsOpen
                ? "bg-[#174b3a] text-white"
                : "bg-transparent text-[#174b3a] hover:bg-[#f3eee3]"
            }`}
          >
            <PanelTop size={18} />
          </button>
        </div>
      </div>
    </main>
  );
}
