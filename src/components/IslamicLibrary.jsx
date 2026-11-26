
import { useState } from "react";
import QuranReader from "./QuranReader";
import {
  BookMarked,
  Search,
  BookOpen,
  FileText,
  ArrowRight
} from "lucide-react";

const books = [
  {
    id: "quran",
    title: "The Holy Quran",
    author: "The Noble Quran",
    category: "Quran",
    language: "Arabic / English",
    description:
      "The sacred scripture of Islam, with guidance for all aspects of life.",
    cover: "quran",
    format: "PDF / Online",
    pdfUrl: "",
  },
  {
    id: "riyad-as-salihin",
    title: "Riyad as-Salihin",
    author: "Imam An-Nawawi",
    category: "Hadith",
    language: "Arabic / English",
    description:
      "A collection of authentic hadith covering faith, worship, manners, and daily life.",
    cover: "hadith",
    format: "Online",
    pdfUrl: "",
  },
  {
    id: "fortress-of-the-muslim",
    title: "Fortress of the Muslim",
    author: "Sa'id ibn Ali ibn Wahf Al-Qahtani",
    category: "Duas",
    language: "Arabic / English",
    description:
      "A collection of supplications and remembrance from the Quran and Sunnah.",
    cover: "duas",
    format: "PDF / Online",
    pdfUrl: "",
  },
  {
    id: "the-sealed-nectar",
    title: "The Sealed Nectar",
    author: "Safiur Rahman Mubarakpuri",
    category: "Seerah",
    language: "English",
    description:
      "A biography of Prophet Muhammad ﷺ and an account of his life and mission.",
    cover: "seerah",
    format: "Online",
    pdfUrl: "",
  },
];

const categories = ["All", "Quran", "Hadith", "Duas", "Seerah"];

const coverStyles = {
  quran: "from-[#174b3a] to-[#063b2e]",
  hadith: "from-[#795b2d] to-[#49351c]",
  duas: "from-[#315d68] to-[#173c46]",
  seerah: "from-[#6c4b70] to-[#3d2945]",
};

export default function IslamicLibrary() {
  const [showQuranReader, setShowQuranReader] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const filteredBooks = books.filter((book) => {
    const matchesCategory =
      activeCategory === "All" || book.category === activeCategory;

    const matchesSearch =
      `${book.title} ${book.author} ${book.description}`
        .toLowerCase()
        .includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });



  const featuredQuran = books.find(
  (book) => book.category.toLowerCase() === "quran",
);


if (showQuranReader) {
  return (
    <QuranReader
      onBack={() => setShowQuranReader(false)}
    />
  );
}
 return (
  <section className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-6 sm:py-7">
    <div className="overflow-hidden rounded-3xl border border-[#c5a45e]/60 bg-gradient-to-br from-[#fffdf7] via-[#f8f3e8] to-[#fffdf7] shadow-[0_10px_35px_rgba(23,75,58,0.12)]">

      {/* LIBRARY HEADER */}
      <header className="relative overflow-hidden bg-gradient-to-br from-[#063b2e] via-[#174b3a] to-[#063b2e] px-5 py-8 sm:px-8 sm:py-10">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border border-[#e8c879]/15" />
        <div className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full border border-[#e8c879]/20" />

        <div className="relative z-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#e8c879]/50 bg-[#e8c879]/10">
            <BookOpen size={30} className="text-[#e8c879]" />
          </div>

          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#e8c879] sm:text-xs">
            Yadgar · Islamic Library
          </p>

          <h2 className="font-serif text-3xl font-bold leading-tight text-[#fff4d7] sm:text-4xl">
            Knowledge that brings
            <span className="mt-1 block text-[#e8c879]">
              us closer
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#f5e9cc] sm:text-base">
            Explore the Holy Quran, Hadith, and Islamic knowledge.
            Read, reflect, and grow in faith.
          </p>
        </div>
      </header>

      <div className="p-4 sm:p-7">

        {/* SEARCH */}
        <div className="relative mx-auto mb-7 max-w-2xl">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#987638]"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search books, authors, or topics..."
            className="w-full rounded-2xl border border-[#dfd2b5] bg-white py-3.5 pl-12 pr-4 text-sm text-[#174b3a] outline-none transition placeholder:text-[#a99a7d] focus:border-[#c5a45e] focus:ring-4 focus:ring-[#c5a45e]/10"
          />
        </div>

        {/* FEATURED QURAN */}
        {featuredQuran && (
          <section className="relative mb-8 overflow-hidden rounded-2xl border border-[#c5a45e]/70 bg-gradient-to-br from-[#174b3a] via-[#0c4031] to-[#063b2e] p-5 shadow-[0_8px_25px_rgba(23,75,58,0.15)] sm:p-7">

            {/* Decorative pattern */}
            <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full border border-[#e8c879]/20" />
            <div className="pointer-events-none absolute -right-5 -top-5 h-32 w-32 rounded-full border border-[#e8c879]/20" />

            <div className="relative z-10 grid grid-cols-1 items-center gap-5 sm:grid-cols-[1fr_auto] sm:gap-8">

              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#e8c879]/40 bg-[#e8c879]/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#e8c879]">
                  <BookMarked size={13} />
                  Featured Book
                </span>

                <h3 className="mt-4 font-serif text-2xl font-bold text-[#fff4d7] sm:text-3xl">
                  The Holy Quran
                </h3>

                <p
                  dir="rtl"
                  lang="ar"
                  className="mt-3 font-serif text-3xl leading-relaxed text-[#e8c879] sm:text-4xl"
                >
                  القرآن الكريم
                </p>

                <p className="mt-3 max-w-lg text-sm leading-6 text-[#e6dcc2]">
                  Begin your journey with the Book of Allah.
                  Read, reflect, and continue your daily recitation.
                </p>

                <button
                  type="button"
                  onClick={() => setShowQuranReader(true)}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#e8c879] bg-[#e8c879] px-5 py-3 text-sm font-bold text-[#174b3a] shadow-sm transition hover:bg-[#f4dfa9]"
                >
                  <BookOpen size={17} />
                  Explore Quran
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* Quran decorative cover */}
              <div className="mx-auto hidden sm:block">
                <div className="flex h-40 w-32 items-center justify-center rounded-xl border-2 border-[#d8b65d] bg-gradient-to-br from-[#0a3327] to-[#1d6047] p-2 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
                  <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border border-[#d8b65d]/70">
                    <span className="text-3xl text-[#e8c879]">۞</span>
                    <span className="mt-2 font-serif text-xl text-[#fff4d7]">
                      القرآن
                    </span>
                    <span className="mt-2 text-[8px] tracking-[0.2em] text-[#e8c879]">
                      AL-QURAN
                    </span>
                    <span className="mt-2 text-2xl text-[#e8c879]">۞</span>
                  </div>
                </div>
              </div>

            </div>
          </section>
        )}

        {/* CONTINUE READING / DAILY READING */}
        <section className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">

          <div className="flex items-center gap-4 rounded-2xl border border-[#e5d8bb] bg-white/80 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#174b3a]/10">
              <BookOpen size={23} className="text-[#174b3a]" />
            </div>

            <div>
              <h3 className="font-serif text-base font-bold text-[#174b3a]">
                Continue Reading
              </h3>
              <p className="mt-1 text-xs leading-5 text-[#8b7955]">
                Return to your saved reading place.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-[#e5d8bb] bg-white/80 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#c5a45e]/15">
              <BookMarked size={23} className="text-[#987638]" />
            </div>

            <div>
              <h3 className="font-serif text-base font-bold text-[#174b3a]">
                Daily Recitation
              </h3>
              <p className="mt-1 text-xs leading-5 text-[#8b7955]">
                Make a little time for Quran every day.
              </p>
            </div>
          </div>

        </section>

        {/* LIBRARY TITLE */}
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#987638]">
              Discover
            </p>

            <h3 className="mt-1 font-serif text-2xl font-bold text-[#174b3a]">
              Explore the Library
            </h3>
          </div>

          <p className="text-xs text-[#8b7955]">
            {filteredBooks.length} books
          </p>
        </div>

        {/* CATEGORY FILTERS */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                activeCategory === category
                  ? "border-[#174b3a] bg-[#174b3a] text-[#fff4d7] shadow-sm"
                  : "border-[#dfd2b5] bg-white text-[#6d6049] hover:border-[#c5a45e] hover:bg-[#f8f3e8]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* BOOK GRID */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">

          {filteredBooks
            .filter((book) => book !== featuredQuran || activeCategory !== "All")
            .map((book) => (
              <article
                key={book.id || book.title}
                className="group overflow-hidden rounded-2xl border border-[#e5d8bb] bg-white shadow-[0_3px_12px_rgba(80,60,25,0.05)] transition duration-300 hover:-translate-y-1 hover:border-[#c5a45e] hover:shadow-[0_10px_25px_rgba(23,75,58,0.12)]"
              >
                {/* BOOK COVER */}
                <div
                  className={`relative flex h-36 items-center justify-center overflow-hidden sm:h-48 ${
                    coverStyles[book.category.toLowerCase()] ||
                    "bg-gradient-to-br from-[#174b3a] to-[#063b2e]"
                  }`}
                >
                  <div className="absolute inset-2 rounded-xl border border-[#e8c879]/30" />

                  <div className="relative flex h-[85%] w-[72%] flex-col items-center justify-center rounded-lg border border-[#e8c879]/50 bg-black/10 px-2 text-center shadow-inner">
                    <BookOpen
                      size={28}
                      className="mb-3 text-[#e8c879] transition duration-300 group-hover:scale-110"
                    />

                    <p className="line-clamp-3 font-serif text-sm font-bold leading-5 text-[#fff4d7] sm:text-base">
                      {book.title}
                    </p>

                    <span className="mt-3 text-[8px] font-semibold uppercase tracking-[0.18em] text-[#e8c879]">
                      Yadgar Library
                    </span>
                  </div>
                </div>

                {/* BOOK DETAILS */}
                <div className="p-3 sm:p-4">
                  <span className="inline-block rounded-full bg-[#f5eedf] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-[#987638]">
                    {book.category}
                  </span>

                  <h4 className="mt-2 line-clamp-2 font-serif text-sm font-bold leading-5 text-[#174b3a] sm:text-base">
                    {book.title}
                  </h4>

                  <p className="mt-1 line-clamp-1 text-xs text-[#8b7955]">
                    {book.author}
                  </p>

                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#75664d]">
                    {book.description}
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t border-[#eee4cf] pt-3">
                    <span className="flex items-center gap-1 text-[10px] text-[#987638]">
                      <FileText size={12} />
                      Book
                    </span>

                    <span className="text-xs font-semibold text-[#174b3a] transition group-hover:text-[#987638]">
                      Explore
                      <ArrowRight
                        size={13}
                        className="ml-1 inline transition group-hover:translate-x-1"
                      />
                    </span>
                  </div>
                </div>
              </article>
            ))}

        </div>

        {/* EMPTY SEARCH */}
        {filteredBooks.length === 0 && (
          <div className="rounded-2xl border border-[#dfd2b5] bg-white py-12 text-center">
            <Search size={30} className="mx-auto mb-3 text-[#c5a45e]" />

            <h4 className="font-serif text-lg font-bold text-[#174b3a]">
              No books found
            </h4>

            <p className="mt-2 text-sm text-[#8b7955]">
              Try another title, author, or category.
            </p>
          </div>
        )}

        {/* FOOTER */}
        <div className="mt-8 border-t border-[#e5d8bb] pt-5 text-center">
          <p className="font-serif text-sm text-[#987638]">
            ✧ May Allah increase us in beneficial knowledge ✧
          </p>
        </div>

      </div>
    </div>
  </section>
);
}
