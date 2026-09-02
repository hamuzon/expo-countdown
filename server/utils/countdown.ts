// @ts-nocheck
// Expo countdown calculation helper
const expoDates: Record<string, { start: string; end: string }> = {
  "1970": { start: "1970-03-15T00:00:00+09:00", end: "1970-09-13T00:00:00+09:00" }, // 大阪万博
  "1990": { start: "1990-04-01T00:00:00+09:00", end: "1990-09-30T00:00:00+09:00" }, // 大阪・花の万博
  "2005": { start: "2005-03-25T00:00:00+09:00", end: "2005-09-25T00:00:00+09:00" }, // 愛知万博
  "2025": { start: "2025-04-13T00:00:00+09:00", end: "2025-10-13T00:00:00+09:00" }, // 大阪・関西
  "2027": { start: "2027-03-19T00:00:00+09:00", end: "2027-09-26T00:00:00+09:00" }, // 横浜
  "2030": { start: "2030-10-01T00:00:00+03:00", end: "2031-03-31T00:00:00+03:00" }  // リヤド
};

function normalizeLang(rawLang?: string | null): "en" | "jp" | null {
  if (!rawLang) return null;
  const lowered = rawLang.toLowerCase();
  if (lowered === "en") return "en";
  if (lowered === "ja" || lowered === "jp") return "jp";
  return null;
}

export interface CountdownResult {
  status: number;
  body: string;
}

export function handleCountdownRequest(
  url: URL,
  headers: Record<string, string | string[] | undefined> | Headers = {}
): CountdownResult | null {
  const validKeywords = ["count", "c", "days", "d"];
  const pathSegments = url.pathname.split("/").filter(Boolean);

  const matchIndex = pathSegments.findIndex((seg) => validKeywords.includes(seg.toLowerCase()));
  if (matchIndex === -1) {
    return null;
  }

  const yearFromPath = pathSegments[matchIndex + 1];
  const yearFromQuery = url.searchParams.getAll("year");
  const langFromQuery = url.searchParams.get("lang");

  const langHeader =
    (typeof (headers as Headers).get === "function"
      ? (headers as Headers).get("accept-language")
      : (headers as Record<string, string | undefined>)["accept-language"]) || "en";
  const isJapanese = /^ja\b/i.test(String(langHeader));
  const lang = normalizeLang(langFromQuery) || (isJapanese ? "jp" : "en");

  let targetYears: string[] = [];
  if (yearFromPath && expoDates[yearFromPath]) {
    targetYears = [yearFromPath];
  } else if (yearFromQuery.length) {
    targetYears = yearFromQuery.filter((y) => expoDates[y]);
  } else if (yearFromPath && !expoDates[yearFromPath]) {
    return {
      status: 404,
      body: lang === "jp" ? "指定年は存在しません" : "No valid year specified"
    };
  } else {
    targetYears = Object.keys(expoDates);
  }

  if (!targetYears.length) {
    return {
      status: 404,
      body: lang === "jp" ? "指定年は存在しません" : "No valid year specified"
    };
  }

  const now = new Date();
  const lines = targetYears.map((y) => {
    const startDate = new Date(expoDates[y].start);
    const endDate = new Date(expoDates[y].end);

    let text = "";
    if (now >= startDate && now <= endDate) {
      const dayNum = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      text = lang === "jp"
        ? `${y}: 今日は万博の ${dayNum} 日目`
        : `${y}: Today is day ${dayNum} of the Expo`;
    } else if (now < startDate) {
      const daysUntil = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      text = lang === "jp"
        ? `${y}: 開催まで: ${daysUntil} 日`
        : `${y}: Starts in: ${daysUntil} days`;
    } else {
      const daysSince = Math.floor((now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));
      text = lang === "jp"
        ? `${y}: 終了から: ${daysSince} 日`
        : `${y}: Since closing: ${daysSince} days`;
    }

    if (parseInt(y, 10) >= 2027) {
      text += lang === "jp" ? "（予定は変更される場合があります）" : " (Schedule may change)";
    }

    return text;
  });

  const title = targetYears.length === 1
    ? (lang === "jp" ? `${targetYears[0]} 万博カウント` : `${targetYears[0]} Expo Countdown`)
    : (lang === "jp" ? "万博カウント一覧" : "Expo Countdown List");

  return {
    status: 200,
    body: [title, ...lines].join("\n")
  };
}
