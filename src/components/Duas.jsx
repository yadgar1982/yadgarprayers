
import { useState } from "react";
import { BookOpenText, Search, Copy, Check } from "lucide-react";

const duas = [
  {
    category: "Quran",
    title: "Increase in Knowledge",
    arabic: "رَبِّ زِدْنِي عِلْمًا",
    transliteration: "Rabbi zidni ilma",
    translation: "My Lord, increase me in knowledge.",
    reference: "Quran 20:114",
  },
  {
    category: "Quran",
    title: "Goodness in This Life and the Hereafter",
    arabic:
      "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    transliteration:
      "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina adhaban-nar",
    translation:
      "Our Lord, grant us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.",
    reference: "Quran 2:201",
  },
  {
    category: "Quran",
    title: "Seeking Forgiveness",
    arabic:
      "رَبَّنَا ظَلَمْنَا أَنْفُسَنَا وَإِنْ لَمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ",
    transliteration:
      "Rabbana zalamna anfusana wa illam taghfir lana wa tarhamna lanakunanna minal-khasirin",
    translation:
      "Our Lord, we have wronged ourselves. If You do not forgive us and have mercy upon us, we will surely be among the losers.",
    reference: "Quran 7:23",
  },
];

export default function Duas() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);

  const categories = ["All", "Quran"];

  const filteredDuas = duas.filter((dua) => {
    const matchesCategory =
      activeCategory === "All" || dua.category === activeCategory;

    const matchesSearch =
      `${dua.title} ${dua.arabic} ${dua.translation}`
        .toLowerCase()
        .includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const copyDua = async (dua, index) => {
    const text = `${dua.arabic}\n${dua.transliteration}\n${dua.translation}\n${dua.reference}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      setCopiedIndex(null);
    }
  };

  return (
    <section className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-6">
      <div className="overflow-hidden rounded-2xl border border-[#c5a45e]/60 bg-gradient-to-br from-[#fffdf7] via-[#f8f3e8] to-[#fffdf7] shadow-[0_8px_25px_rgba(23,75,58,0.12)]">

        <div className="bg-gradient-to-r from-[#063b2e] via-[#174b3a] to-[#063b2e] px-5 py-8 text-center">
          <BookOpenText className="mx-auto mb-3 text-[#e8c879]" size={34} />
          <h2 className="font-serif text-3xl font-bold text-[#f4dfa9]">
            Daily Duas
          </h2>
          <p className="mt-2 text-sm text-[#f5e9cc]">
            Remember Allah throughout your day
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
              placeholder="Search duas..."
              className="w-full rounded-xl border border-[#d8c69d] bg-white py-3 pl-10 pr-4 text-sm text-[#174b3a] outline-none transition focus:border-[#b18b45] focus:ring-2 focus:ring-[#c5a45e]/20"
            />
          </div>

          <div className="mb-6 flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
                  activeCategory === category
                    ? "border-[#174b3a] bg-[#174b3a] text-[#f4dfa9] shadow-md"
                    : "border-[#c5a45e]/60 bg-white text-[#174b3a] hover:bg-[#f5eedc]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="space-y-5">
            {filteredDuas.map((dua, index) => (
              <article
                key={dua.reference}
                className="rounded-xl border border-[#d8c69d] bg-white/90 p-5 shadow-sm transition hover:shadow-md sm:p-6"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="font-serif text-lg font-semibold text-[#174b3a]">
                    {dua.title}
                  </h3>

                  <span className="shrink-0 rounded-full bg-[#f4eddb] px-3 py-1 text-xs font-medium text-[#8b6b32]">
                    {dua.category}
                  </span>
                </div>

                <p
                  dir="rtl"
                  className="mb-5 text-right font-serif text-2xl leading-[2.2] text-[#174b3a] sm:text-3xl"
                >
                  {dua.arabic}
                </p>

                <p className="mb-3 text-sm italic leading-7 text-[#8b6b32]">
                  {dua.transliteration}
                </p>

                <p className="text-sm leading-7 text-[#514b3d]">
                  {dua.translation}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-[#e8dfca] pt-4">
                  <span className="text-xs font-semibold text-[#8b6b32]">
                    {dua.reference}
                  </span>

                  <button
                    type="button"
                    onClick={() => copyDua(dua, index)}
                    className="flex items-center gap-2 rounded-lg border border-[#c5a45e]/60 px-3 py-2 text-xs font-medium text-[#174b3a] transition hover:bg-[#f5eedc]"
                  >
                    {copiedIndex === index ? (
                      <>
                        <Check size={15} />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={15} />
                        Copy Dua
                      </>
                    )}
                  </button>
                </div>
              </article>
            ))}

            {filteredDuas.length === 0 && (
              <p className="py-10 text-center text-sm text-[#8b7955]">
                No duas found. Try another search.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
