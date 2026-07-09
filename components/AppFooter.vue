<script setup>
import { computed } from 'vue';

const footerHTML = computed(() => {
  if (typeof window === 'undefined') return '&copy; Expo Countdown';
  const baseYear = 2025;
  const currentYear = new Date().getFullYear();
  const yearStr = currentYear > baseYear ? `${baseYear}–${currentYear}` : String(baseYear);
  const hostname = window.location.hostname;
  if (hostname === 'hamuzon.github.io') {
    return `&copy; ${yearStr} <a href="https://hamuzon.github.io" target="_blank" rel="noopener noreferrer">@hamuzon</a>`;
  }
  if (hostname.includes('hamuzon-jp.f5.si')) {
    return `&copy; ${yearStr} <a href="https://hamuzon-jp.f5.si" target="_blank" rel="noopener noreferrer">@hamuzon</a>`;
  }
  if (hostname.includes('hamusata.f5.si')) {
    return `&copy; ${yearStr} <a href="https://hamusata.f5.si" target="_blank" rel="noopener noreferrer">@hamusata</a>`;
  }
  return `&copy; ${yearStr} Expo Countdown`;
});
</script>

<template>
  <div class="footer" v-html="footerHTML"></div>
</template>

<style scoped>
.footer {
  font-size: 0.8rem;
  color: #4dd0e1;
  margin-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1rem;
  opacity: 0.8;
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
</style>
