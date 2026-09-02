// @ts-nocheck
import { defineEventHandler, getRequestURL, getRequestHeaders, setResponseStatus, setHeader } from "h3";
import { handleCountdownRequest } from "../utils/countdown";

export default defineEventHandler((event) => {
  const url = getRequestURL(event);
  const headers = getRequestHeaders(event);

  const result = handleCountdownRequest(url, headers);
  if (!result) {
    return;
  }

  setResponseStatus(event, result.status);
  setHeader(event, "Content-Type", "text/plain; charset=utf-8");
  setHeader(event, "Cache-Control", "public, max-age=60");
  return result.body;
});
