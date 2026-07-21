<script setup>
/**
 * Expo Countdown – Root page [[lang]].vue
 * Handles: /, /ja, /en
 * Optimized for SSG/SEO with useSeoMeta.
 */
import { ref, onMounted, onUnmounted, computed } from "vue";
import { URL_SETTINGS } from "~/url-scheme.config.js";

// --- Composables ---
const route = useRoute();
const router = useRouter();

// --- Static Data ---
const expoDates = {
  2025: {
    title: { ja: "2025大阪・関西万博", en: "Expo 2025 Osaka, Kansai, Japan" },
    city: { ja: "大阪", en: "Osaka" },
    start: "2025-04-13T10:00:00+09:00",
    end: "2025-10-13T20:00:00+09:00",
  },
  2027: {
    title: { ja: "2027年国際園芸博覧会(横浜万博)", en: "International Horticultural Expo 2027, Yokohama" },
    city: { ja: "横浜", en: "Yokohama" },
    start: "2027-03-19T00:00:00+09:00",
    end: "2027-09-26T00:00:00+09:00",
  },
  2030: {
    title: { ja: "2030リヤド万博", en: "Expo 2030 Riyadh" },
    city: { ja: "リヤド", en: "Riyadh" },
    start: "2030-10-01T00:00:00+03:00",
    end: "2031-03-31T00:00:00+03:00",
  },
};

const texts = {
  ja: { subtitle: "開催からの経過日数カウント", notice: "※表示されているカウントダウンは目安であり、正確な開催時刻とは異なる場合があります。", loading: "読み込み中…" },
  en: { subtitle: "Days Since Opening", notice: "*The displayed countdown is approximate and may not reflect the exact event time.", loading: "Loading..." },
};

const CONFIG = { URL_SCHEME: URL_SETTINGS.urlScheme };

// --- Helpers ---
const getAllYears = () => Object.keys(expoDates).sort((a, b) => Number(a) - Number(b));

const findNearestFutureEvent = (now = Date.now()) =>
  getAllYears().find((yr) => new Date(expoDates[yr].end).getTime() > now) ||
  getAllYears().at(-1);

const parseCreatePath = (value) => {
  if (!value) return {};
  let decoded = value;
  try { decoded = decodeURIComponent(String(value)); } catch { decoded = String(value); }
  const parts = decoded.split("/").filter(Boolean);
  return {
    year: parts.find((p) => /^\d{4}$/.test(p)),
    lang: parts.find((p) => p === "ja" || p === "en"),
  };
};

const normalizeParam = (value) => {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === "string" ? raw.trim() : "";
};

// --- Initial State ---
const getInitialState = () => {
  const q = route.query;
  const createPathValue = q.createPath || q.createpath || q.clearPath || q.clearpath;
  const fromCreatePath = parseCreatePath(createPathValue);
  let resYear = normalizeParam(q.year) || fromCreatePath.year;
  let resLang = normalizeParam(q.lang) || fromCreatePath.lang || route.params.lang;

  if (process.client) {
    const reset = /^(1|on|true)$/i.test(String(q.reset || q.reboot || q.restart));
    if (!reset) {
      resLang = resLang || localStorage.getItem("expoCountdownLang");
      if (!resYear) {
        const sYear = localStorage.getItem("expoCountdownYear");
        if (sYear && expoDates[sYear]) resYear = sYear;
      }
    }
  }

  let defaultLang = "en";
  if (process.client) {
    if (navigator.language && navigator.language.toLowerCase().startsWith("ja")) {
      defaultLang = "ja";
    }
  }

  resLang = resLang === "en" || resLang === "ja" ? resLang : defaultLang;
  resYear = (resYear && expoDates[resYear]) ? resYear : findNearestFutureEvent();

  return { lang: resLang, year: resYear };
};

const initialState = getInitialState();

// --- Reactive State ---
const lang = ref(initialState.lang);
const currentYearKey = ref(initialState.year);
const showDay = ref(true);
const isOngoing = ref(false);

// --- Display Data ---
const mainText = ref(texts[initialState.lang].loading);
const subText = ref("");
let timerId = null;

// --- Calendar Diff ---
function formatYMDHMS(ms) {
  let sec = Math.floor(ms / 1000);
  const y = Math.floor(sec / (365 * 24 * 3600)); sec -= y * 365 * 24 * 3600;
  const mo = Math.floor(sec / (30 * 24 * 3600)); sec -= mo * 30 * 24 * 3600;
  const d = Math.floor(sec / (24 * 3600)); sec -= d * 24 * 3600;
  const h = Math.floor(sec / 3600); sec -= h * 3600;
  const m = Math.floor(sec / 60); sec -= m * 60;
  let str = "";
  if (y > 0) str += `${y}${lang.value === 'ja' ? '年' : 'y'} `;
  if (mo > 0) str += `${mo}${lang.value === 'ja' ? 'ヶ月' : 'mo'} `;
  if (d > 0) str += `${d}${lang.value === 'ja' ? '日' : 'd'} `;
  if (h > 0) str += `${h}${lang.value === 'ja' ? '時間' : 'h'} `;
  if (m > 0) str += `${m}${lang.value === 'ja' ? '分' : 'm'} `;
  if (sec > 0) str += `${sec}${lang.value === 'ja' ? '秒' : 's'}`;
  return str.trim();
}

// --- SEO ---
const requestUrl = useRequestURL();
const seoData = computed(() => {
  const event = expoDates[currentYearKey.value];
  if (!event) return null;

  const isJa = lang.value === "ja";
  const cityName = event.city?.[lang.value] || "";
  const eventTitle = event.title?.[lang.value] || "";
  const title = isJa
    ? `${eventTitle} カウントダウン`
    : `${eventTitle} – Countdown`;
  const description = isJa
    ? `${eventTitle}の開催まで、開催期間中、終了後の経過時間をリアルタイムで表示するカウントダウンタイマーです。`
    : `Real-time countdown timer for ${eventTitle}. Displays time before, during, and after the event.`;

  const resolveBaseUrl = (host) => {
    const hostname = (host || "").replace(/:\d+$/, "");
    if (hostname === "hamuzon.github.io") return "https://hamuzon.github.io/expo-countdown";
    if (hostname.includes("hamuzon-jp.f5.si")) return `https://${hostname}`;
    return `https://${hostname}`;
  };

  const host = requestUrl.host;
  const baseUrl = resolveBaseUrl(host);
  const prettyUrl = `${baseUrl}/${currentYearKey.value}/${lang.value}`;

  return { title, description, url: prettyUrl, locale: isJa ? "ja_JP" : "en_US", cityName };
});

useSeoMeta({
  title: () => seoData.value?.title,
  ogTitle: () => seoData.value?.title,
  description: () => seoData.value?.description,
  ogDescription: () => seoData.value?.description,
  ogUrl: () => seoData.value?.url,
  ogLocale: () => seoData.value?.locale,
  twitterTitle: () => seoData.value?.title,
  twitterDescription: () => seoData.value?.description,
  twitterCard: "summary",
});

// Canonical link removed as requested
// --- Actions ---
function toggleLang() {
  lang.value = lang.value === "ja" ? "en" : "ja";
  if (process.client) {
    localStorage.setItem("expoCountdownLang", lang.value);
  }
  updateRoute();
  updateCountdown();
}

function changeYear(y) {
  currentYearKey.value = y;
  if (process.client) {
    localStorage.setItem("expoCountdownYear", y);
  }
  updateRoute();
  updateCountdown();
}

function toggleView() {
  showDay.value = !showDay.value;
  updateCountdown();
}

function buildCanonicalPath(year, language) {
  return `/${year}/${language}/`;
}

function updateRoute() {
  if (!process.client) return;
  const targetYear = String(currentYearKey.value);
  const targetLang = lang.value;

  if (CONFIG.URL_SCHEME === "path") {
    const targetPath = buildCanonicalPath(targetYear, targetLang);
    const q = { ...route.query };
    delete q.year; delete q.lang;
    delete q.createPath; delete q.createpath;
    delete q.clearPath; delete q.clearpath;
    if (route.path === targetPath && !route.query.year && !route.query.lang) return;
    router.replace({ path: targetPath, query: q, hash: route.hash });
    return;
  }
  router.replace({ query: { year: targetYear, lang: targetLang }, hash: route.hash });
}

// --- Countdown ---
function updateCountdown() {
  if (!currentYearKey.value) return;
  const event = expoDates[currentYearKey.value];
  if (!event) return;

  const nowMs = Date.now();
  const startMs = new Date(event.start).getTime();
  const endMs = new Date(event.end).getTime();

  if (nowMs >= startMs && nowMs <= endMs) {
    isOngoing.value = true;
    const diffMsStart = nowMs - startMs;
    const diffMsEnd = endMs - nowMs;
    
    if (showDay.value) {
      const diffDays = Math.floor(diffMsStart / (1000 * 60 * 60 * 24)) + 1;
      mainText.value = lang.value === "ja" ? `今日は万博の ${diffDays} 日目` : `Today is day ${diffDays} of the Expo`;
    } else {
      mainText.value = formatYMDHMS(diffMsStart);
    }
    subText.value = lang.value === "ja" ? `残り: ${formatYMDHMS(diffMsEnd)}` : `Remaining: ${formatYMDHMS(diffMsEnd)}`;
  } else {
    isOngoing.value = false;
    subText.value = "";
    if (nowMs < startMs) {
      mainText.value = lang.value === "ja" ? `開催まで: ${formatYMDHMS(startMs - nowMs)}` : `Starts in: ${formatYMDHMS(startMs - nowMs)}`;
    } else {
      mainText.value = lang.value === "ja" ? `終了から: ${formatYMDHMS(nowMs - endMs)}` : `Since closing: ${formatYMDHMS(nowMs - endMs)}`;
    }
  }
}

// --- Computed ---
const availableYears = computed(() =>
  getAllYears().map((y) => ({
    value: y,
    label: y
  }))
);

const eventTitle = computed(() => {
  const event = expoDates[currentYearKey.value];
  if (!event) return "Loading...";
  return event.title[lang.value];
});

const subtitleText = computed(() => texts[lang.value].subtitle);
const noticeText = computed(() => texts[lang.value].notice);

// --- Lifecycle ---
onMounted(() => {
  if (process.client) {
    localStorage.setItem("expoCountdownLang", lang.value);
    localStorage.setItem("expoCountdownYear", currentYearKey.value);
    updateRoute();
  }
  updateCountdown();
  timerId = setInterval(updateCountdown, 1000);
});

onUnmounted(() => {
  if (timerId) clearInterval(timerId);
});
</script>

<template>
  <div class="container">
    <div class="year-links">
      <button
        v-for="y in availableYears"
        :key="y.value"
        class="year-link"
        :class="{ active: currentYearKey === y.value }"
        @click="changeYear(y.value)"
      >
        {{ y.label }}
      </button>
      <button class="lang-toggle" @click="toggleLang" aria-label="Toggle Language">
        {{ lang === "ja" ? "EN" : "JP" }}
      </button>
    </div>

    <button v-show="isOngoing" class="view-toggle" @click="toggleView">
      {{ lang === "ja" ? "日目／年月日切替" : "Day / YMD Toggle" }}
    </button>

    <h1 id="title">{{ eventTitle }}</h1>
    <h2 id="subtitle">{{ subtitleText }}</h2>

    <CountdownDisplay
      :mainText="mainText"
      :subText="subText"
    />

    <p class="notice" aria-live="polite">{{ noticeText }}</p>

    <AppFooter />
  </div>
</template>

<style scoped>
.container {
  background: rgba(255,255,255,0.07);
  border-radius: 24px;
  padding: 3rem 4rem;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 0 40px rgba(0,229,255,0.5);
  text-align: center;
  position: relative;
}

h1 {
  font-family: 'Orbitron', sans-serif;
  font-size: 2.8rem;
  background: linear-gradient(90deg,#ff0000,#ffcc00,#0066ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 8px rgba(255,255,255,0.3), 0 0 20px rgba(255,255,255,0.2);
  margin-bottom: 0.3rem;
}

h2 {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.1rem;
  background: linear-gradient(90deg,#00aaff,#00ffdd);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: 0.15em;
  margin-bottom: 2rem;
}

.year-links { margin-bottom: 1rem; }

.lang-toggle, .year-link, .view-toggle {
  background: rgba(0,229,255,0.15);
  border: none;
  border-radius: 20px;
  color: #00e5ff;
  font-weight: 600;
  padding: 6px 14px;
  cursor: pointer;
  font-family: 'Roboto', sans-serif;
  transition: 0.3s;
  margin: 0 4px;
}

.lang-toggle:hover, .year-link:hover, .view-toggle:hover {
  background: rgba(0,229,255,0.3);
}

.year-link.active {
  background: #00e5ff;
  color: #000;
  box-shadow: 0 0 15px rgba(0,229,255,0.4);
}

.notice {
  font-size: 0.85rem;
  color: #4dd0e1;
  opacity: 0.8;
  margin-top: 1rem;
  letter-spacing: 0.05em;
  line-height: 1.4;
}

@media(max-width:480px){
  .container{padding:2rem 2rem; max-width:320px;}
  h1{font-size:2rem;}
  h2{font-size:1rem;margin-bottom:1.5rem;}
}
</style>
