export async function onRequest(context) {
  // version: v1.1.1
  const validPaths = ["/count", "/c", "/days", "/d"];
  const url = new URL(context.request.url);
  const pathSegments = url.pathname.split("/").filter(Boolean);
  const basePath = "/" + (pathSegments[0] || "");
  const yearFromPath = pathSegments[1]; // /count/2025 の場合
  const yearFromQuery = url.searchParams.getAll("year"); // ?year=2025&year=2027 など
  const langFromQuery = url.searchParams.get("lang");

  if (!validPaths.includes(basePath)) {
    return new Response("Not Found", {status: 404, headers: {"Content-Type":"text/plain; charset=utf-8"}});
  }

  // 万博データ（主要・小規模含む、2025以降は予定）
  const expoDates = {
    "1970": {start:"1970-03-15T00:00:00+09:00", end:"1970-09-13T00:00:00+09:00"}, // 大阪万博
    "1990": {start:"1990-04-01T00:00:00+09:00", end:"1990-09-30T00:00:00+09:00"}, // 大阪・花の万博
    "2005": {start:"2005-03-25T00:00:00+09:00", end:"2005-09-25T00:00:00+09:00"}, // 愛知万博
    "2025": {start:"2025-04-13T00:00:00+09:00", end:"2025-10-13T00:00:00+09:00"}, // 大阪・関西
    "2027": {start:"2027-03-19T00:00:00+09:00", end:"2027-09-26T00:00:00+09:00"}, // 横浜
    "2030": {start:"2030-10-01T00:00:00+03:00", end:"2031-03-31T00:00:00+03:00"}  // リヤド
  };

  const now = new Date();
  function normalizeLang(rawLang) {
    if (!rawLang) return null;
    const lowered = rawLang.toLowerCase();
    if (lowered === "en") return "en";
    if (lowered === "ja" || lowered === "jp") return "jp";
    return null;
  }

  const langHeader = context.request.headers.get("Accept-Language") || "en";
  const isJapanese = /^ja\b/.test(langHeader);
  const lang = normalizeLang(langFromQuery) || (isJapanese ? "jp" : "en");

  // 対象年リスト決定
  let targetYears = [];
  if (yearFromPath && expoDates[yearFromPath]) {
    targetYears = [yearFromPath];
  } else if (yearFromQuery.length) {
    targetYears = yearFromQuery.filter(y => expoDates[y]);
  } else {
    targetYears = Object.keys(expoDates);
  }

  if (!targetYears.length) {
    return new Response(lang==='jp' ? "指定年は存在しません" : "No valid year specified",
      {status:404, headers: {"Content-Type":"text/plain; charset=utf-8"}});
  }

  const lines = targetYears.map(y => {
    const startDate = new Date(expoDates[y].start);
    const endDate = new Date(expoDates[y].end);

    let text = "";
    if (now >= startDate && now <= endDate) {
      const dayNum = Math.floor((now - startDate)/(1000*60*60*24)) + 1;
      text = lang==='jp'
        ? `${y}: 今日は万博の ${dayNum} 日目`
        : `${y}: Today is day ${dayNum} of the Expo`;
    } else if (now < startDate) {
      const daysUntil = Math.ceil((startDate - now)/(1000*60*60*24));
      text = lang==='jp'
        ? `${y}: 開催まで: ${daysUntil} 日`
        : `${y}: Starts in: ${daysUntil} days`;
    } else {
      const daysSince = Math.floor((now - endDate)/(1000*60*60*24));
      text = lang==='jp'
        ? `${y}: 終了から: ${daysSince} 日`
        : `${y}: Since closing: ${daysSince} days`;
    }

    // 2027以降は予定変更の可能性あり注意文追加
    if (parseInt(y) >= 2027) {
      text += lang==='jp' ? "（予定は変更される場合があります）" : " (Schedule may change)";
    }

    return text;
  });

  const title = targetYears.length===1
    ? (lang==='jp' ? `${targetYears[0]} 万博カウント` : `${targetYears[0]} Expo Countdown`)
    : (lang==='jp' ? "万博カウント一覧" : "Expo Countdown List");

  return new Response([title, ...lines].join("\n"), {headers: {"Content-Type":"text/plain; charset=utf-8"}});
}
