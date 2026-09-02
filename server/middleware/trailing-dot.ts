// @ts-nocheck
import { defineEventHandler, getRequestURL, sendRedirect } from "h3";

export default defineEventHandler((event) => {
  const url = getRequestURL(event);

  if (url.hostname.endsWith(".")) {
    url.hostname = url.hostname.slice(0, -1);
    return sendRedirect(event, url.toString(), 301);
  }
});
