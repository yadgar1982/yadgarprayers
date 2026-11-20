import { useEffect, useState } from "react";
import {
  BookOpenText,
  Search,
  Copy,
  Check,
  X,
  Activity,
  BookOpen,
  RotateCcw,
  CheckCircle2,
  Sunrise,
  MoonStar,
  ArrowRight,
} from "lucide-react";

const COMPLETION_TIME = 60 * 60 * 1000;
const STORAGE_KEY = "yadgar-dua-completions";
// category: ["Morning", "Evening", "After Prayer"]
const duas = [
  {
    id: 1,
    category: ["morning", "all"],
    arabic:
      "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَمَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    translation:
      "Praise be to Allāh Who gave us life after He caused us to die and to Him is the return",
    repeatCount: 1,
    schedule: ["morning", "all"],
  },

  {
    id: 2,
    category: ["morning", "evening", "all"],
    arabic:
      "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ، رَبِّ اغْفِرْ لِي",
    translation:
      "Praise be to Allāh Who gave us life after He caused us to die and to Him is the return",
    repeatCount: 1,
    schedule: ["morning", "evening", "all"],
  },
  {
    id: 3,
    category: ["morning", "evening", "all"],
    arabic:
      "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ، رَبِّ اغْفِرْ لِي",
    translation:
      "Praise be to Allāh Who gave us life after He caused us to die and to Him is the return",
    repeatCount: 1,
    schedule: ["morning", "evening", "all"],
  },
  {
    id: 4,
    category: ["morning", "evening", "all"],
    arabic:
      "بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم ﴿ ﴾ اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ لَّهُ مَا فِي السَّمَوَاتِ وَمَا فِي الأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلاَّ بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلاَ يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلاَّ بِمَا شَاء وَسِعَ كُرْسِيُّهُ السَّمَوَاتِ وَالأَرْضَ وَلاَ يَؤُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    translation:
      "Praise be to Allāh Who gave us life after He caused us to die and to Him is the return",
    repeatCount: 1,
    schedule: ["morning", "evening", "all"],
  },
  {
    id: 5,
    category: ["morning", "evening", "after Salat", "all"],
    title:
      "من قالها حين يصبح أجير من الجن حتى يمسى ومن قالها حين يمسى أجير من الجن حتى يصبح.",
    arabic:
      "ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلۡحَيُّ ٱلۡقَيُّومُۚ لَا تَأۡخُذُهُۥ سِنَةٞ وَلَا نَوۡمٞۚ لَّهُۥ مَا فِي ٱلسَّمَٰوَٰتِ وَمَا فِي ٱلۡأَرۡضِۗ مَن ذَا ٱلَّذِي يَشۡفَعُ عِندَهُۥٓ إِلَّا بِإِذۡنِهِۦۚ يَعۡلَمُ مَا بَيۡنَ أَيۡدِيهِمۡ وَمَا خَلۡفَهُمۡۖ وَلَا يُحِيطُونَ بِشَيۡءٖ مِّنۡ عِلۡمِهِۦٓ إِلَّا بِمَا شَآءَۚ وَسِعَ كُرۡسِيُّهُ ٱلسَّمَٰوَٰتِ وَٱلۡأَرۡضَۖ وَلَا يَـُٔودُهُۥ حِفۡظُهُمَاۚ وَهُوَ ٱلۡعَلِيُّ ٱلۡعَظِيمُ⁠۝٢٥٥",
    translation: " ",
    repeatCount: 1,
    schedule: ["morning", "evening", "after Salat", "all"],
  },
  {
    id: 6,
    category: ["morning", "evening", "after Salat", "all"],
    title: " من قالها حين يصبح وحين يمسى كفته من كل شىء (الإخلاص والمعوذتين).",
    arabic:
      "قُلۡ هُوَ ٱللَّهُ أَحَدٌ⁠۝١ ٱللَّهُ ٱلصَّمَدُ⁠۝٢ لَمۡ يَلِدۡ وَلَمۡ يُولَدۡ⁠۝٣ وَلَمۡ يَكُن لَّهُۥ كُفُوًا أَحَدُۢ⁠۝٤",
    translation: " ",
    repeatCount: 3,
    schedule: ["morning", "evening", "after Salat", "all"],
  },
  {
    id: 7,
    category: ["morning", "evening", "after Salat", "all"],
    title: " من قالها حين يصبح وحين يمسى كفته من كل شىء (الإخلاص والمعوذتين).",
    arabic:
      "قُلۡ أَعُوذُ بِرَبِّ ٱلۡفَلَقِ⁠۝١ مِن شَرِّ مَا خَلَقَ⁠۝٢ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ⁠۝٣ وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِي ٱلۡعُقَدِ⁠۝٤ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ⁠۝٥ ",
    translation: " ",
    repeatCount: 3,
    schedule: ["morning", "evening", "after Salat", "all"],
  },
  {
    id: 8,
    category: ["morning", "evening", "after Salat", "all"],
    title: " من قالها حين يصبح وحين يمسى كفته من كل شىء (الإخلاص والمعوذتين).",
    arabic:
      "قُلۡ أَعُوذُ بِرَبِّ ٱلنَّاسِ⁠۝١ مَلِكِ ٱلنَّاسِ⁠۝٢ إِلَٰهِ ٱلنَّاسِ⁠۝٣ مِن شَرِّ ٱلۡوَسۡوَاسِ ٱلۡخَنَّاسِ⁠۝٤ ٱلَّذِي يُوَسۡوِسُ فِي صُدُورِ ٱلنَّاسِ⁠۝٥ مِنَ ٱلۡجِنَّةِ وَٱلنَّاسِ⁠۝٦",
    translation: " ",
    repeatCount: 3,
    schedule: ["morning", "evening", "after Salat", "all"],
  },
  {
    id: 9,
    category: ["evening", "all"],
    title: "",
    arabic:
      "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ.",
    translation: " ",
    repeatCount: 1,
    schedule: ["evening", "all"],
  },
  {
    id: 10,
    category: ["morning", "all"],
    title: "",
    arabic:
      "أَصْبَحْنا وَأَصْبَحَ المُلْكُ لله وَالحَمدُ لله ، لا إلهَ إلاّ اللّهُ وَحدَهُ لا شَريكَ لهُ، لهُ المُلكُ ولهُ الحَمْد، وهُوَ على كلّ شَيءٍ قدير ، رَبِّ أسْأَلُكَ خَيرَ ما في هذا اليوم وَخَيرَ ما بَعْدَه ، وَأَعوذُ بِكَ مِنْ شَرِّ ما في هذا اليوم وَشَرِّ ما بَعْدَه، رَبِّ أَعوذُبِكَ مِنَ الْكَسَلِ وَسوءِ الْكِبَر ، رَبِّ أَعوذُ بِكَ مِنْ عَذابٍ في النّارِ وَعَذابٍ في القَبْر.",
    translation: " ",
    repeatCount: 1,
    schedule: ["morning", "all"],
  },
  {
    id: 11,
    category: ["morning", "evening", "all"],
    title: "",
    arabic:
      "اللّهمَّ أَنْتَ رَبِّي لا إلهَ إلاّ أَنْتَ ، خَلَقْتَني وَأَنا عَبْدُك ، وَأَنا عَلى عَهْدِكَ وَوَعْدِكَ ما اسْتَطَعْت ، أَعوذُبِكَ مِنْ شَرِّ ما صَنَعْت ، أَبوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبوءُ بِذَنْبي فَاغْفِرْ لي فَإِنَّهُ لا يَغْفِرُ الذُّنوبَ إِلاّ أَنْتَ . ",
    translation: "",
    repeatCount: 1,
    schedule: ["morning", "evening", "all"],
  },
  {
    id: 12,
    category: ["morning", "all"],
    title: "",
    arabic:
      "اللّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُك ، وَأُشْهِدُ حَمَلَةَ عَرْشِك ، وَمَلَائِكَتَكَ ، وَجَميعَ خَلْقِك ، أَنَّكَ أَنْتَ اللهُ لا إلهَ إلاّ أَنْتَ وَحْدَكَ لا شَريكَ لَك ، وَأَنَّ ُ مُحَمّداً عَبْدُكَ وَرَسولُك. ",
    translation: " ",
    repeatCount: 1,
    schedule: ["morning", "all"],
  },
  {
    id: 13,
    category: ["morning", "all"],
    title: "",
    arabic:
      "اللّهُمَّ ما أَصْبََحَ بي مِنْ نِعْمَةٍ أَو بِأَحَدٍ مِنْ خَلْقِك ، فَمِنْكَ وَحْدَكَ لا شريكَ لَك ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْر. ",
    translation: " ",
    repeatCount: 1,
    schedule: ["morning", "all"],
  },
  {
    id: 14,
    category: ["morning", "evening", "all"],
    title: "",
    arabic:
      "حَسْبِيَ اللّهُ لا إلهَ إلاّ هُوَ عَلَيهِ تَوَكَّلتُ وَهُوَ رَبُّ العَرْشِ العَظيم.",
    translation: " ",
    repeatCount: 7,
    schedule: ["morning", "evening", "all"],
  },
  {
    id: 15,
    category: ["morning", "evening", "all", ""],
    title: "",
    arabic:
      "بِسمِ اللهِ الذي لا يَضُرُّ مَعَ اسمِهِ شَيءٌ في الأرْضِ وَلا في السّماءِ وَهوَ السّميعُ العَليم.",
    translation: " ",
    repeatCount: 3,
    schedule: ["morning", "evening", "all"],
  },
  {
    id: 16,
    category: ["morning", "evening", "all"],
    title: "",
    arabic:
      "اللّهُمَّ بِكَ أَصْبَحْنا وَبِكَ أَمْسَينا ، وَبِكَ نَحْيا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُور.",
    translation: " ",
    repeatCount: 1,
    schedule: ["morning", "evening", "all"],
  },
  {
    id: 17,
    category: ["morning", "all"],
    title: "",
    arabic:
      "أَصْبَحْنا عَلَى فِطْرَةِ الإسْلاَمِ، وَعَلَى كَلِمَةِ الإِخْلاَصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِينَا إبْرَاهِيمَ حَنِيفاً مُسْلِماً وَمَا كَانَ مِنَ المُشْرِكِينَ.",
    translation: " ",
    repeatCount: 1,
    schedule: ["morning", "all"],
  },
  {
    id: 18,
    category: ["morning", "evening", "all"],
    title: "",
    arabic:
      "سُبْحانَ اللهِ وَبِحَمْدِهِ عَدَدَ خَلْقِه ، وَرِضا نَفْسِه ، وَزِنَةَ عَرْشِه ، وَمِدادَ كَلِماتِه.",
    translation: " ",
    repeatCount: 3,
    schedule: ["morning", "evening", "all"],
  },
  {
    id: 19,
    category: ["morning", "evening", "all"],
    title: "",
    arabic:
      "اللّهُمَّ عافِني في بَدَني ، اللّهُمَّ عافِني في سَمْعي ، اللّهُمَّ عافِني في بَصَري ، لا إلهَ إلاّ أَنْتَ.",
    translation: " ",
    repeatCount: 1,
    schedule: ["morning", "evening", "all"],
  },
  {
    id: 20,
    category: ["morning", "evening", "all"],
    title: "",
    arabic:
      "اللّهُمَّ إِنّي أَعوذُ بِكَ مِنَ الْكُفر ، وَالفَقْر ، وَأَعوذُ بِكَ مِنْ عَذابِ القَبْر ، لا إلهَ إلاّ أَنْتَ.",
    translation: " ",
    repeatCount: 1,
    schedule: ["morning", "evening", "all"],
  },
  {
    id: 21,
    category: ["morning", "evening", "all"],
    title: "",
    arabic:
      "اللّهُمَّ إِنِّي أسْأَلُكَ العَفْوَ وَالعافِيةَ في الدُّنْيا وَالآخِرَة ، اللّهُمَّ إِنِّي أسْأَلُكَ العَفْوَ وَالعافِيةَ في ديني وَدُنْيايَ وَأهْلي وَمالي ، اللّهُمَّ اسْتُرْ عوْراتي وَآمِنْ رَوْعاتي ، اللّهُمَّ احْفَظْني مِن بَينِ يَدَيَّ وَمِن خَلْفي وَعَن يَميني وَعَن شِمالي ، وَمِن فَوْقي ، وَأَعوذُ بِعَظَمَتِكَ أَن أُغْتالَ مِن تَحْتي.",
    translation: " ",
    repeatCount: 1,
    schedule: ["morning", "evening", "all"],
  },
  {
    id: 22,
    category: ["morning", "evening", "all"],
    title: "",
    arabic:
      "يَا حَيُّ يَا قيُّومُ بِرَحْمَتِكَ أسْتَغِيثُ أصْلِحْ لِي شَأنِي كُلَّهُ وَلاَ تَكِلْنِي إلَى نَفْسِي طَرْفَةَ عَيْنٍ.",
    translation: " ",
    repeatCount: 3,
    schedule: ["morning", "evening", "all"],
  },
  {
    id: 23,
    category: ["morning", "all"],
    title: "",
    arabic:
      "أَصْبَحْنا وَأَصْبَحْ المُلكُ للهِ رَبِّ العالَمين ، اللّهُمَّ إِنِّي أسْأَلُكَ خَيْرَ هذا اليَوْم ، فَتْحَهُ ، وَنَصْرَهُ ، وَنورَهُ وَبَرَكَتَهُ ، وَهُداهُ ، وَأَعوذُ بِكَ مِنْ شَرِّ ما فيهِ وَشَرِّ ما بَعْدَه.",
    translation: " ",
    repeatCount: 1,
    schedule: ["morning", "all"],
  },
  {
    id: 24,
    category: ["morning", "evening", "all"],
    title: "",
    arabic:
      "اللّهُمَّ عالِمَ الغَيْبِ وَالشّهادَةِ فاطِرَ السّماواتِ وَالأرْضِ رَبَّ كلِّ شَيءٍ وَمَليكَه ، أَشْهَدُ أَنْ لا إِلهَ إِلاّ أَنْت ، أَعوذُ بِكَ مِن شَرِّ نَفْسي وَمِن شَرِّ الشَّيْطانِ وَشِرْكِهِ ، وَأَنْ أَقْتَرِفَ عَلى نَفْسي سوءاً أَوْ أَجُرَّهُ إِلى مُسْلِم.",
    translation: " ",
    repeatCount: 1,
    schedule: ["morning", "evening", "all"],
  },
  {
    id: 25,
    category: ["morning", "evening", "all"],
    title: "",
    arabic: "أَعوذُ بِكَلِماتِ اللّهِ التّامّاتِ مِنْ شَرِّ ما خَلَق.",
    translation: " ",
    repeatCount: 3,
    schedule: ["morning", "evening", "all"],
  },
  {
    id: 26,
    category: ["morning", "evening", "all"],
    title: "",
    arabic: "اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ على نَبِيِّنَا مُحمَّد.",
    translation: " ",
    repeatCount: 10,
    schedule: ["morning", "evening", "all"],
  },
  {
    id: 27,
    category: ["morning", "evening", "all"],
    title: "",
    arabic:
      "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنْ الْعَجْزِ وَالْكَسَلِ، وَأَعُوذُ بِكَ مِنْ الْجُبْنِ وَالْبُخْلِ، وَأَعُوذُ بِكَ مِنْ غَلَبَةِ الدَّيْنِ، وَقَهْرِ الرِّجَالِ.",
    translation: " ",
    repeatCount: 1,
    schedule: ["morning", "evening", "all"],
  },
  {
    id: 28,
    category: ["morning", "evening", "all"],
    title: "",
    arabic:
      "أسْتَغْفِرُ اللهَ العَظِيمَ الَّذِي لاَ إلَهَ إلاَّ هُوَ، الحَيُّ القَيُّومُ، وَأتُوبُ إلَيهِ.",
    translation: " ",
    repeatCount: 3,
    schedule: ["morning", "evening", "all"],
  },

  {
    id: 29,
    category: ["morning", "evening", "all"],
    title: "",
    arabic:
      "يَا رَبِّ , لَكَ الْحَمْدُ كَمَا يَنْبَغِي لِجَلَالِ وَجْهِكَ , وَلِعَظِيمِ سُلْطَانِكَ.",
    translation: " ",
    repeatCount: 3,
    schedule: ["morning", "evening", "all"],
  },
  {
    id: 30,
    category: ["morning", "evening", "all"],
    title: "",
    arabic:
      "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا.",
    translation: " ",
    repeatCount: 1,
    schedule: ["morning", "evening", "all"],
  },
  {
    id: 31,
    category: ["morning", "evening", "all"],
    title: "",
    arabic: "سُبْحانَ اللهِ وَبِحَمْدِهِ.",
    translation: " ",
    repeatCount: 100,
    schedule: ["morning", "evening", "all"],
  },
  {
    id: 32,
    category: ["morning", "evening", "all"],
    title: "",
    arabic: "أسْتَغْفِرُ اللهَ وَأتُوبُ إلَيْهِ",
    translation: " ",
    repeatCount: 100,
    schedule: ["morning", "evening", "all"],
  },
  {
    id: 33,
    category: ["after Salat"],
    title: "",
    arabic: "سُبْحَانَ اللَّهِ",
    translation: " ",
    repeatCount: 33,
    schedule: ["after Salat"],
  },
  {
    id: 34,
    category: ["after Salat"],
    title: "",
    arabic: "الْحَمْدُ لِلَّهِ",
    translation: " ",
    repeatCount: 33,
    schedule: ["after Salat"],
  },
  {
    id: 35,
    category: ["after Salat"],
    title: "",
    arabic: "اللَّهُ أَكْبَرُ",
    translation: " ",
    repeatCount: 33,
    schedule: ["after Salat"],
  },
];

export default function Duas() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [duaCounts, setDuaCounts] = useState({});
  const [completedDuas, setCompletedDuas] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  // Load completed Duas and remove expired highlights
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const now = Date.now();

      const valid = Object.fromEntries(
        Object.entries(saved).filter(
          ([, timestamp]) =>
            typeof timestamp === "number" && now - timestamp < COMPLETION_TIME,
        ),
      );

      setCompletedDuas(valid);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
    } catch {
      setCompletedDuas({});
    }
  }, []);

  useEffect(() => {
    try {
      const savedCounts = JSON.parse(
        localStorage.getItem("yadgar-dua-counts") || "{}",
      );

      setDuaCounts(savedCounts);
    } catch {
      setDuaCounts({});
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("yadgar-dua-counts", JSON.stringify(duaCounts));
  }, [duaCounts]);

  // Get the current count for a Dua
  const getDuaCount = (dua) => duaCounts[dua.id] || 0;

  // Check whether this Dua is completed
  const isCompleted = (id) => {
    const timestamp = completedDuas[id];
    return timestamp && Date.now() - timestamp < COMPLETION_TIME;
  };

  // Count one reading
  const handleCount = (dua) => {
    if (isCompleted(dua.id)) return;

    const currentCount = getDuaCount(dua);

    if (currentCount >= dua.repeatCount) return;

    const nextCount = currentCount + 1;

    setDuaCounts((prev) => ({
      ...prev,
      [dua.id]: nextCount,
    }));

    if (nextCount === dua.repeatCount) {
      const updated = {
        ...completedDuas,
        [dua.id]: Date.now(),
      };

      saveCompletions(updated);
    }
  };

  // Undo one reading
  const undoCount = (dua) => {
    if (isCompleted(dua.id)) return;

    setDuaCounts((prev) => ({
      ...prev,
      [dua.id]: Math.max((prev[dua.id] || 0) - 1, 0),
    }));
  };

  // Reset this Dua's counter
  const resetCount = (dua) => {
    if (isCompleted(dua.id)) return;

    setDuaCounts((prev) => ({
      ...prev,
      [dua.id]: 0,
    }));
  };

  // Allow reading again
  const enableAgain = (dua) => {
    const updated = { ...completedDuas };
    delete updated[dua.id];

    saveCompletions(updated);

    setDuaCounts((prev) => ({
      ...prev,
      [dua.id]: 0,
    }));
  };

  // Copy an individual Dua
  const copyDua = async (dua) => {
    const text = `${dua.arabic}\n\n${dua.translation || ""}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(dua.id);
    } catch {
      setCopiedId(null);
    }
  };

  // Save completion status
  const saveCompletions = (updated) => {
    setCompletedDuas(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const categories = [
    "morning",
    "evening",
    "masnoon",
    "after Salat",
    "Quranic Duas",
  ];

  const filteredDuas = duas.filter((dua) => {
    const matchesCategory =
      activeCategory === "All" || dua.category.includes(activeCategory);

    const matchesSearch = [
      dua.title,
      dua.arabic,
      dua.transliteration,
      dua.translation,
      dua.reference,
      ...(Array.isArray(dua.category) ? dua.category : [dua.category]),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <section className="mx-auto w-full max-w-5xl px-3 py-6 sm:px-6">
      <div className="overflow-hidden rounded-2xl border border-[#c5a45e]/60 bg-gradient-to-br from-[#fffdf7] via-[#f8f3e8] to-[#fffdf7] shadow-[0_8px_25px_rgba(23,75,58,0.12)]">
        {/* Header */}
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
          {/* Search */}
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

          {/* Categories */}
          <div className="mb-6 flex flex-wrap justify-center gap-2.5">
  {categories.map((category) => {
    const isActive = activeCategory === category;

    return (
      <button
        key={category}
        type="button"
        onClick={() => setActiveCategory(category)}
        className={`relative rounded-full border px-5 py-2 text-xs font-semibold capitalize tracking-wide transition-all duration-300 ${
          isActive
            ? "border-[#b9954e] bg-gradient-to-b from-[#205c46] to-[#123e30] text-[#f5e3b5] shadow-[0_4px_12px_rgba(23,75,58,0.22)] ring-1 ring-[#d6b76e]/30"
            : "border-[#c5a45e]/60 bg-gradient-to-b from-[#fffdf7] to-[#f8f0df] text-[#24523e] shadow-[0_2px_5px_rgba(120,91,42,0.06)] hover:-translate-y-0.5 hover:border-[#b9954e] hover:from-[#f8efd9] hover:to-[#efe1bf] hover:shadow-md"
        }`}
      >
        {category}
      </button>
    );
  })}
</div>

          {/* Morning and Evening Adhkar */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Morning Adhkar */}
            <button
              type="button"
              onClick={() => setActiveCategory("morning")}
              className="group relative isolate min-h-[190px] overflow-hidden rounded-2xl border border-[#c9a45c] bg-gradient-to-br from-[#174b3b] via-[#1c6049] to-[#0d382d] p-5 text-left shadow-[0_7px_22px_rgba(20,65,48,0.22)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_13px_30px_rgba(20,65,48,0.32)] active:scale-[0.98]"
            >
              {/* Subtle Islamic geometric texture */}
              <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.12] [background-image:repeating-linear-gradient(45deg,transparent_0px,transparent_15px,#e5c77e_16px,transparent_17px),repeating-linear-gradient(-45deg,transparent_0px,transparent_15px,#e5c77e_16px,transparent_17px)]" />

              {/* Decorative arch */}
              <div className="pointer-events-none absolute -right-5 -top-16 z-0 h-64 w-48 rounded-t-full border border-[#d8b66d]/40 opacity-60" />
              <div className="pointer-events-none absolute -right-1 -top-12 z-0 h-56 w-40 rounded-t-full border border-[#d8b66d]/30 opacity-60" />

              {/* Inner gold frame */}
              <div className="pointer-events-none absolute inset-2 z-0 rounded-xl border border-[#e5c77e]/25" />

              {/* Decorative corner diamonds */}
              <div className="pointer-events-none absolute left-4 top-4 z-10 h-2 w-2 rotate-45 border border-[#e7ca85]" />
              <div className="pointer-events-none absolute right-4 top-4 z-10 h-2 w-2 rotate-45 border border-[#e7ca85]" />
              <div className="pointer-events-none absolute bottom-4 left-4 z-10 h-2 w-2 rotate-45 border border-[#e7ca85]" />
              <div className="pointer-events-none absolute bottom-4 right-4 z-10 h-2 w-2 rotate-45 border border-[#e7ca85]" />

              {/* Golden glow */}
              <div className="pointer-events-none absolute -right-12 -top-12 z-0 h-40 w-40 rounded-full bg-[#d8b66d]/15 blur-3xl transition-all duration-700 group-hover:scale-150" />

              {/* Content */}
              <div className="relative z-20 flex min-h-[150px] flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#d8b66d]/60 bg-[#0b392d]/60 text-[#e8cc8c] shadow-inner transition-all duration-500 group-hover:scale-110 group-hover:border-[#f0d99e]">
                    <Sunrise size={26} strokeWidth={1.5} />
                  </div>

                  <span className="rounded-full border border-[#d8b66d]/60 bg-[#0b392d]/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f0d99e]">
                    Morning
                  </span>
                </div>

                <div className="mt-5 flex items-end justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-xl font-bold tracking-wide text-[#f5e6bd] drop-shadow-sm">
                      Morning Adhkar
                    </h3>
                    <p className="mt-1 text-xs text-[#e5d9b9]">
                      Begin your day with the remembrance of Allah
                    </p>
                    <p className="mt-3 text-[11px] font-semibold text-[#e8cc8c]">
                      {
                        duas.filter(
                          (dua) =>
                            Array.isArray(dua.schedule) &&
                            dua.schedule.includes("morning"),
                        ).length
                      }{" "}
                      Duas in this routine
                    </p>
                  </div>

                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d8b66d]/60 bg-[#0b392d]/50 text-[#f0d99e] transition-all duration-300 group-hover:translate-x-1 group-hover:bg-[#d8b66d]/20">
                    <ArrowRight size={18} />
                  </span>
                </div>
              </div>
            </button>

            {/* Evening Adhkar */}
            <button
              type="button"
              onClick={() => setActiveCategory("evening")}
              className="group relative isolate min-h-[190px] overflow-hidden rounded-2xl border border-[#b9a16c] bg-gradient-to-br from-[#182c49] via-[#243c60] to-[#101d34] p-5 text-left shadow-[0_7px_22px_rgba(20,35,65,0.25)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_13px_30px_rgba(20,35,65,0.35)] active:scale-[0.98]"
            >
              {/* Subtle Islamic geometric texture */}
              <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.12] [background-image:repeating-linear-gradient(45deg,transparent_0px,transparent_15px,#d8bd80_16px,transparent_17px),repeating-linear-gradient(-45deg,transparent_0px,transparent_15px,#d8bd80_16px,transparent_17px)]" />

              {/* Decorative arch */}
              <div className="pointer-events-none absolute -right-5 -top-16 z-0 h-64 w-48 rounded-t-full border border-[#d8bd80]/40 opacity-60" />
              <div className="pointer-events-none absolute -right-1 -top-12 z-0 h-56 w-40 rounded-t-full border border-[#d8bd80]/30 opacity-60" />

              {/* Inner gold frame */}
              <div className="pointer-events-none absolute inset-2 z-0 rounded-xl border border-[#d8bd80]/25" />

              {/* Decorative corner diamonds */}
              <div className="pointer-events-none absolute left-4 top-4 z-10 h-2 w-2 rotate-45 border border-[#e4cf9d]" />
              <div className="pointer-events-none absolute right-4 top-4 z-10 h-2 w-2 rotate-45 border border-[#e4cf9d]" />
              <div className="pointer-events-none absolute bottom-4 left-4 z-10 h-2 w-2 rotate-45 border border-[#e4cf9d]" />
              <div className="pointer-events-none absolute bottom-4 right-4 z-10 h-2 w-2 rotate-45 border border-[#e4cf9d]" />

              {/* Moonlight glow */}
              <div className="pointer-events-none absolute -right-12 -top-12 z-0 h-40 w-40 rounded-full bg-[#c6d4e9]/15 blur-3xl transition-all duration-700 group-hover:scale-150" />

              {/* Content */}
              <div className="relative z-20 flex min-h-[150px] flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#d8bd80]/60 bg-[#101d34]/60 text-[#ead7a8] shadow-inner transition-all duration-500 group-hover:scale-110 group-hover:border-[#f0dfb5]">
                    <MoonStar size={26} strokeWidth={1.5} />
                  </div>

                  <span className="rounded-full border border-[#d8bd80]/60 bg-[#101d34]/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#ead7a8]">
                    Evening
                  </span>
                </div>

                <div className="mt-5 flex items-end justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-xl font-bold tracking-wide text-[#f0e6d0] drop-shadow-sm">
                      Evening Adhkar
                    </h3>
                    <p className="mt-1 text-xs text-[#d1d9e7]">
                      End your day with peace and remembrance
                    </p>
                    <p className="mt-3 text-[11px] font-semibold text-[#ead7a8]">
                      {
                        duas.filter(
                          (dua) =>
                            Array.isArray(dua.schedule) &&
                            dua.schedule.includes("evening"),
                        ).length
                      }{" "}
                      Duas in this routine
                    </p>
                  </div>

                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d8bd80]/60 bg-[#101d34]/50 text-[#ead7a8] transition-all duration-300 group-hover:translate-x-1 group-hover:bg-[#d8bd80]/20">
                    <ArrowRight size={18} />
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Dua List with Individual Tasbeeh Counters */}
          <div className="space-y-5">
            {filteredDuas.map((dua) => {
              const count = getDuaCount(dua);
              const completed = isCompleted(dua.id);
              const progress = Math.min((count / dua.repeatCount) * 100, 100);

              return (
                <article
                  key={dua.id}
                  className={`group relative overflow-hidden rounded-2xl border-[1.5px] border-[#c5a45e] transition-all duration-300 p-5 ${
                    completed
                      ? "bg-[#f5fbf7] shadow-[0_5px_20px_rgba(16,185,129,0.08)]"
                      : "bg-white shadow-[0_3px_12px_rgba(80,60,25,0.05)] hover:shadow-[0_8px_24px_rgba(80,60,25,0.09)]"
                  }`}
                >
                  {/* Subtle Islamic manuscript frame */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-[5px] z-0 rounded-[13px] border border-[#d8c69d]/60"
                  />

                  {/* Elegant Islamic corner decoration */}
                  <div
                    className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-2xl"
                    aria-hidden="true"
                  >
                    {[
                      "top-0 left-0",
                      "top-0 right-0 -scale-x-100",
                      "bottom-0 left-0 -scale-y-100",
                      "bottom-0 right-0 -scale-100",
                    ].map((position) => (
                      <svg
                        key={position}
                        viewBox="0 0 90 90"
                        className={`absolute h-12 w-12 sm:h-16 sm:w-16 ${position}`}
                        fill="none"
                      >
                        <path
                          d="M3 65 V25 Q3 3 25 3 H65"
                          stroke="#c5a45e"
                          strokeWidth="1.2"
                        />
                        <path
                          d="M8 48 Q8 8 48 8"
                          stroke="#c5a45e"
                          strokeWidth="1"
                        />
                        <path
                          d="M8 68 Q28 68 28 48 Q48 48 48 28 Q68 28 68 8"
                          stroke="#b18b45"
                          strokeWidth="1.2"
                        />
                        <path
                          d="M18 28 L28 18 L38 28 L28 38 Z"
                          stroke="#b18b45"
                          strokeWidth="1"
                        />
                        <circle cx="28" cy="28" r="2.5" fill="#c5a45e" />
                      </svg>
                    ))}
                  </div>

                  <div className="p-4 sm:p-5">
                    {/* Header */}
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f5eedc] text-[#987638]">
                          <BookOpen size={16} />
                        </div>

                        <div>
                          <h3 className="font-serif text-base font-bold tracking-wide text-[#174b3a]">
                            {dua.title || `Dua ${dua.id}`}
                          </h3>

                          <p className="mt-0.5 text-[11px] text-[#9a8050]">
                            {dua.category.join(", ")}
                            <span className="mx-1.5">·</span>
                            {dua.repeatCount} readings
                          </p>
                        </div>
                      </div>

                      {completed && (
                        <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold tracking-wide text-emerald-700">
                          <CheckCircle2 size={13} />
                          Completed
                        </span>
                      )}
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_125px] sm:items-center">
                      {/* Arabic and Translation */}
                      <div className="min-w-0">
                        {/* Arabic Dua */}
                        <div className="rounded-xl border border-[#eee4cf] bg-gradient-to-br from-[#fcfaf5] to-[#f8f3e8] px-4 py-5 sm:px-5 sm:py-6">
                          <p
                            dir="rtl"
                            lang="ar"
                            className="text-right font-serif text-[23px] leading-[2.15] text-[#174b3a] sm:text-[27px] sm:leading-[2.1]"
                          >
                            {dua.arabic}
                          </p>
                        </div>

                        {/* Translation */}
                        {dua.translation && (
                          <div className="mt-3 rounded-lg border-l-[3px] border-[#c5a45e] bg-[#fbf9f3] px-3.5 py-3">
                            <p className="text-sm leading-7 text-[#625947]">
                              {dua.translation}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Tasbeeh Counter */}
                      <div className="flex flex-row items-center justify-center gap-4 rounded-xl border border-[#eee4cf] bg-[#f8f5ed] p-3 sm:flex-col sm:gap-2.5 sm:py-5">
                        <div className="text-center">
                          <span className="block text-[10px] font-bold tracking-[0.2em] text-[#987638]">
                            TASBEEH
                          </span>

                          <span className="mt-1 block text-[10px] text-[#a38b5e]">
                            Tap to count
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCount(dua)}
                          disabled={completed}
                          aria-label={`Count reading ${count} of ${dua.repeatCount} for ${dua.title || `Dua ${dua.id}`}`}
                          className={`relative flex h-[82px] w-[82px] shrink-0 flex-col items-center justify-center rounded-full border-[4px] border-[#d8b65d] shadow-[0_5px_16px_rgba(23,75,58,0.16)] transition-all duration-200 active:scale-95 sm:h-[96px] sm:w-[96px] ${
                            completed
                              ? "cursor-not-allowed bg-emerald-700 text-white"
                              : "bg-gradient-to-br from-[#087a55] to-[#063b2e] text-white hover:scale-105 hover:shadow-[0_7px_20px_rgba(23,75,58,0.25)]"
                          }`}
                        >
                          {completed ? (
                            <CheckCircle2 size={30} />
                          ) : (
                            <span className="text-3xl font-bold tabular-nums">
                              {count.toString().padStart(2, "0")}
                            </span>
                          )}

                          <span className="mt-0.5 text-[9px] font-bold tracking-widest">
                            {completed ? "DONE" : "TAP"}
                          </span>
                        </button>

                        <span className="text-xs font-bold tabular-nums text-[#8b6b32]">
                          {count} / {dua.repeatCount}
                        </span>
                      </div>
                    </div>

                    {/* Progress Section */}
                    <div className="mt-5 border-t border-[#eee6d5] pt-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-[#174b3a]">
                          <Activity size={14} className="text-[#987638]" />
                          Reading Progress
                        </span>

                        <span className="text-xs font-bold tabular-nums text-[#987638]">
                          {count} / {dua.repeatCount}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-[#eee6d5]">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            completed
                              ? "bg-emerald-600"
                              : "bg-gradient-to-r from-[#b18b45] to-[#d8b65d]"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => copyDua(dua)}
                          className="flex items-center gap-1.5 rounded-lg border border-[#c5a45e] bg-white px-3 py-2 text-xs font-semibold text-[#174b3a] transition hover:bg-[#f5eedc]"
                        >
                          {copiedId === dua.id ? (
                            <Check size={14} />
                          ) : (
                            <Copy size={14} />
                          )}
                          {copiedId === dua.id ? "Copied" : "Copy Dua"}
                        </button>

                        {!completed ? (
                          <>
                            <button
                              type="button"
                              onClick={() => undoCount(dua)}
                              disabled={count === 0}
                              className="flex items-center gap-1.5 rounded-lg border border-[#dfcfad] bg-white px-3 py-2 text-xs font-semibold text-[#587367] transition hover:bg-[#f5eedc] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <RotateCcw size={13} />
                              Undo
                            </button>

                            <button
                              type="button"
                              onClick={() => resetCount(dua)}
                              disabled={count === 0}
                              className="rounded-lg border border-[#dfcfad] bg-white px-3 py-2 text-xs font-semibold text-[#587367] transition hover:bg-[#f5eedc] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Reset
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => enableAgain(dua)}
                            className="flex items-center gap-1.5 rounded-lg bg-[#174b3a] px-3 py-2 text-xs font-semibold text-[#f4dfa9] transition hover:bg-[#063b2e]"
                          >
                            <RotateCcw size={13} />
                            Enable Again
                          </button>
                        )}
                      </div>

                      {completed && (
                        <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                          <CheckCircle2 size={14} />
                          Alhamdulillah! Completed. Highlight remains for one
                          hour.
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}

            {filteredDuas.length === 0 && (
              <p className="rounded-xl border border-[#dfcfad] bg-white py-10 text-center text-sm text-[#8b7955]">
                No duas found. Try another search.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
