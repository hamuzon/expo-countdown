export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (url.hostname.endsWith(".")) {
    url.hostname = url.hostname.slice(0, -1);
    return Response.redirect(url.toString(), 308);
  }

  if (url.pathname === "/" && (url.searchParams.has("year") || url.searchParams.has("lang"))) {
    const expoYears = [
      ["2025", "2025-10-13T20:00:00+09:00"],
      ["2027", "2027-09-26T00:00:00+09:00"],
      ["2030", "2031-03-31T00:00:00+03:00"],
    ];
    const requestedYear = url.searchParams.get("year");
    const year = expoYears.find(([value]) => value === requestedYear)?.[0]
      || expoYears.find(([, end]) => Date.parse(end) > Date.now())?.[0]
      || "2030";
    const lang = url.searchParams.get("lang") === "en" ? "en" : "ja";

    url.pathname = `/${year}/${lang}/`;
    url.searchParams.delete("year");
    url.searchParams.delete("lang");
    return Response.redirect(url.toString(), 308);
  }

  return context.next();
}
