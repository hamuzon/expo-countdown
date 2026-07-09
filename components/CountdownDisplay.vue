<script setup>
defineProps({
  mainText: String,
  subText: String
});
</script>

<template>
  <div class="countdown-box">
    <p id="dayDisplay">{{ mainText }}</p>
    <p id="remainDisplay" v-if="subText">{{ subText }}</p>
  </div>
</template>

<style scoped>
#dayDisplay {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(90deg,#ffcc00,#ff6600,#ffcc00);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 0 10px rgba(255,255,255,0.3);
  margin-bottom: 1.2rem;
}

#remainDisplay {
  font-size: 1.2rem;
  font-weight: 500;
  background: linear-gradient(90deg,#00ffff,#00aaff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 3rem;
  letter-spacing: 0.05em;
}

@media(max-width:480px){
  #dayDisplay{font-size:2rem;margin-bottom:1rem;}
  #remainDisplay{font-size:1rem;margin-bottom:1rem;}
}
</style>
