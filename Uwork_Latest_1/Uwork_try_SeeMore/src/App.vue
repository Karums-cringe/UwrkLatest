<script setup>
import Header from './components/Header.vue'
</script>

<template>
  <div id="app" class="bg-white md:w-8/12 m-auto rounded-xl shadow-xl md:mt-14 mt-0 w-full p-4">
    <Header />
    <router-view />
  </div>
</template>

<style scoped></style>
