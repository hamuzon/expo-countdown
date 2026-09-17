<template>
  <div class="error-page">
    <div class="container">
      <h1>{{ error?.statusCode || 404 }}</h1>
      <p v-if="isCountdownPath" class="message">
        指定年は存在しません<br>
        <span>The specified year does not exist.</span>
      </p>
      <p v-else class="message">
        ページが見つかりません<br>
        <span>Sorry, Not Found.</span>
      </p>

      <a
        id="backLink"
        class="back-btn"
        :href="homeURL"
        @click.prevent="handleError"
      >
        トップページへ戻る
      </a>

      <div class="footer" v-html="footerHTML"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  error: {
    type: Object,
    default: () => ({})
  }
});

const config = useRuntimeConfig();
const requestUrl = useRequestURL();
const route = useRoute();

const isCountdownPath = computed(() => {
  const path = props.error?.url || (process.client ? window.location.pathname : (route.path || requestUrl.pathname || ''));
  const baseURL = String(config.app?.baseURL || '/');
  const normalizedBase = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
  let relativePath = path;
  if (normalizedBase && normalizedBase !== '/' && path.startsWith(normalizedBase)) {
    relativePath = path.slice(normalizedBase.length);
  }
  const pathParts = relativePath.split('/').filter(Boolean);
  return pathParts.length > 0 && ['count', 'c', 'days', 'd'].includes(pathParts[0].toLowerCase());
});

const isGitHubPages = computed(() => {
  const hostname = process.client ? window.location.hostname : requestUrl.hostname;
  return hostname === 'hamuzon.github.io';
});

const homeURL = computed(() => {
  if (isGitHubPages.value) {
    return 'https://hamuzon.github.io/expo-countdown/';
  }
  return config.app?.baseURL || '/';
});

const assetBase = computed(() => {
  if (isGitHubPages.value) {
    return '/expo-countdown/';
  }
  const base = config.app?.baseURL || '/';
  return base.endsWith('/') ? base : `${base}/`;
});

useHead({
  title: '404 - Not Found',
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: () => `${assetBase.value}icon.svg` },
    { rel: 'icon', sizes: 'any', href: () => `${assetBase.value}favicon.ico` },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Roboto:wght@400;500;700&display=swap' }
  ]
});

const footerHTML = ref('');

const handleError = () => {
  const target = homeURL.value;
  if (process.client && isGitHubPages.value) {
    clearError();
    window.location.href = target;
  } else {
    clearError({ redirect: target });
  }
};

onMounted(() => {
  const baseYear = 2025;
  const currentYear = new Date().getFullYear();
  const hostname = window.location.hostname;
  
  let yearStr = baseYear.toString();
  if (currentYear > baseYear) {
    yearStr = `${baseYear} ~ ${currentYear}`;
  } else if (currentYear < baseYear) {
    yearStr = `${currentYear} ~ ${baseYear}`;
  }
  
  if (hostname === "hamuzon.github.io") {
    footerHTML.value = `&copy; ${yearStr} <a href="https://hamuzon.github.io" target="_blank" rel="noopener noreferrer">@hamuzon</a>`;
  } else if (hostname.includes("hamuzon-jp.f5.si")) {
    footerHTML.value = `&copy; ${yearStr} <a href="https://hamuzon-jp.f5.si" target="_blank" rel="noopener noreferrer">@hamuzon</a>`;
  } else if (hostname.includes("hamusata.f5.si")) {
    footerHTML.value = `&copy; ${yearStr} <a href="https://hamusata.f5.si" target="_blank" rel="noopener noreferrer">@hamusata</a>`;
  } else {
    footerHTML.value = `&copy; ${yearStr} Expo Countdown`;
  }
});
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(0.75rem, 4vw, 2rem);
  box-sizing: border-box;
}

.container {
  background: rgba(255, 255, 255, 0.08);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 2.5rem 2rem;
  max-width: 480px;
  min-width: 0;
  width: 100%;
  box-shadow: 0 0 40px rgba(0, 229, 255, 0.3);
  text-align: center;
  position: relative;
  box-sizing: border-box;
}

h1 {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(2.5rem, 14vw, 5rem);
  font-weight: 700;
  background: linear-gradient(90deg, #ff0000, #ffcc00, #0066ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.3), 0 0 20px rgba(255, 255, 255, 0.2);
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
}

p.message {
  font-size: clamp(0.95rem, 3.5vw, 1.2rem);
  color: #a0e0ff;
  margin: 0 0 2rem 0;
  font-weight: 500;
  line-height: 1.6;
}

p.message span {
  font-size: 0.9em;
  opacity: 0.8;
}

.back-btn {
  display: inline-block;
  background: rgba(0, 229, 255, 0.15);
  border: none;
  border-radius: 20px;
  color: #00e5ff;
  font-weight: 600;
  padding: clamp(8px, 2.5vw, 10px) clamp(16px, 5vw, 24px);
  cursor: pointer;
  font-family: 'Roboto', sans-serif;
  transition: all 0.3s ease;
  font-size: clamp(0.875rem, 3vw, 1rem);
  text-decoration: none;
  white-space: nowrap;
}

.back-btn:hover {
  background: rgba(0, 229, 255, 0.3);
  transform: translateY(-1px);
  color: #fff;
  box-shadow: 0 0 15px rgba(0, 229, 255, 0.4);
}

.footer {
  font-size: clamp(0.7rem, 2.5vw, 0.8rem);
  color: #4dd0e1;
  margin-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1rem;
  opacity: 0.8;
  word-break: break-word;
}

:deep(.footer a) {
  color: #4ac8e0;
  text-decoration: none;
  transition: color 0.2s;
}

:deep(.footer a:hover) {
  color: #fff;
  text-decoration: underline;
}

@media (max-width: 320px) {
  .container {
    padding: 1.25rem 0.75rem;
  }

  h1 {
    font-size: 2.25rem;
    margin-bottom: 0.25rem;
  }

  p.message {
    font-size: 0.9rem;
    margin-bottom: 1.25rem;
  }

  .back-btn {
    padding: 8px 16px;
    font-size: 0.85rem;
  }

  .footer {
    margin-top: 1.25rem;
    font-size: 0.7rem;
  }
}

@media (min-width: 321px) and (max-width: 480px) {
  .container {
    padding: 1.5rem 1rem;
  }

  p.message {
    margin-bottom: 1.5rem;
  }
}

@media (min-width: 481px) and (max-width: 768px) {
  .container {
    max-width: 480px;
    padding: 2.5rem 2rem;
  }
}

@media (min-width: 769px) {
  .container {
    max-width: 520px;
    padding: 3rem 2.5rem;
  }

  h1 {
    font-size: 5rem;
  }

  p.message {
    font-size: 1.2rem;
  }
}

@media (min-width: 1025px) {
  .container {
    max-width: 560px;
    padding: 3.5rem 3rem;
  }
}
</style>
