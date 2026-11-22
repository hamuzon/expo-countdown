/**
 * Cloudflare Rocket Loader rewrites every <script> tag (including Nuxt's
 * module entry) into a non-standard MIME type before the browser sees it.
 * The rewritten entry script is never executed, so the app stays on the
 * server-rendered markup and the countdown never updates in any browser.
 *
 * `data-cfasync="false"` is Cloudflare's documented opt-out: Rocket Loader
 * leaves those tags untouched.
 */
const CFASYNC_ATTRIBUTE = ' data-cfasync="false"';

function optOutOfRocketLoader(html: string): string {
  return html.replace(/<script(?![^>]*\sdata-cfasync=)/gi, `<script${CFASYNC_ATTRIBUTE}`);
}

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("render:html", (html) => {
    for (const key of ["head", "bodyPrepend", "body", "bodyAppend"] as const) {
      html[key] = html[key].map(optOutOfRocketLoader);
    }
  });
});
