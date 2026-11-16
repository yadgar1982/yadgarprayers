
import { useState } from "react";
import {
  BookMarked,
  Search,
  BookOpen,
  FileText,
} from "lucide-react";

const books = [
  {
    title: "The Holy Quran",
    author: "The Noble Quran",
    category: "Quran",
    language: "Arabic / English",
    description:
      "The sacred scripture of Islam, with guidance for all aspects of life.",
    cover: "quran",
    format: "PDF / Online",
  },
  {
    title: "Riyad as-Salihin",
    author: "Imam An-Nawawi",
    category: "Hadith",
    language: "Arabic / English",
    description:
      "A collection of authentic hadith covering faith, worship, manners, and daily life.",
    cover: "hadith",
    format: "Online",
  },
  {
    title: "Fortress of the Muslim",
    author: "Sa'id ibn Ali ibn Wahf Al-Qahtani",
    category: "Duas",
    language: "Arabic / English",
    description:
      "A collection of supplications and remembrance from the Quran and Sunnah.",
    cover: "duas",
    format: "PDF / Online",
  },
  {
    title: "The Sealed Nectar",
    author: "Safiur Rahman Mubarakpuri",
    category: "Seerah",
    language: "English",
    description:
      "A biography of Prophet Muhammad ﷺ and an account of his life and mission.",
    cover: "seerah",
    format: "Online",
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

  return (
    <section className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-6">
      <div className="overflow-hidden rounded-2xl border border-[#c5a45e]/60 bg-gradient-to-br from-[#fffdf7] via-[#f8f3e8] to-[#fffdf7] shadow-[0_8px_25px_rgba(23,75,58,0.12)]">

        <div className="bg-gradient-to-r from-[#063b2e] via-[#174b3a] to-[#063b2e] px-5 py-8 text-center">
          <BookMarked className="mx-auto mb-3 text-[#e8c879]" size={36} />
          <h2 className="font-serif text-3xl font-bold text-[#f4dfa9]">
            Islamic Library
          </h2>
          <p className="mt-2 text-sm text-[#f5e9cc]">
            Explore the knowledge and wisdom of Islam
          </p>
        </div>

        <div className="p-4 sm:p-6">
          <div className="relative mx-auto mb-5 max-w-xl">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a7955]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search books or authors..."
              className="w-full rounded-xl border border-[#d8c69d] bg-white py-3 pl-10 pr-4 text-sm text-[#174b3a] outline-none transition focus:border-[#b18b45] focus:ring-2 focus:ring-[#c5a45e]/20"
            />
          </div>

          <div className="mb-6 flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  activeCategory === category
                    ? "border-[#174b3a] bg-[#174b3a] text-[#f4dfa9] shadow-md"
                    : "border-[#c5a45e]/60 bg-white text-[#174b3a] hover:bg-[#f5eedc]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {filteredBooks.map((book) => (
              <article
                key={book.title}
                className="flex gap-4 rounded-xl border border-[#d8c69d] bg-white/90 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div
                  className={`flex h-40 w-28 shrink-0 flex-col items-center justify-center rounded-lg border border-[#e8c879]/60 bg-gradient-to-br ${coverStyles[book.cover]} p-3 text-center text-[#f4dfa9] shadow-md`}
                >
                  <BookOpen size={28} className="mb-3 text-[#e8c879]" />
                  <span className="font-serif text-sm font-bold">
                    {book.title}
                  </span>
                  <span className="mt-2 text-[9px] uppercase tracking-widest text-[#f5e9cc]">
                    Islamic Library
                  </span>
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="mb-2 w-fit rounded-full bg-[#f4eddb] px-3 py-1 text-[10px] font-semibold text-[#8b6b32]">
                    {book.category}
                  </span>

                  <h3 className="font-serif text-lg font-bold leading-snug text-[#174b3a]">
                    {book.title}
                  </h3>

                  <p className="mt-1 text-xs text-[#8b6b32]">
                    {book.author}
                  </p>

                  <p className="mt-3 text-xs leading-6 text-[#514b3d]">
                    {book.description}
                  </p>

                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                    <span className="flex items-center gap-1 text-[10px] text-[#75684d]">
                      <FileText size={13} />
                      {book.format}
                    </span>
                    <span className="text-[10px] text-[#75684d]">
                      {book.language}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredBooks.length === 0 && (
            <p className="py-10 text-center text-sm text-[#8b7955]">
              No books found. Try another search.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
