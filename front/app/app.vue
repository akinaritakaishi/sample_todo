<template>
  <div class="app-shell">
    <nav class="app-nav">
      <NuxtLink to="/" class="app-nav-link" active-class="active">Tasks</NuxtLink>
      <NuxtLink to="/chat" class="app-nav-link" active-class="active">Chat</NuxtLink>
    </nav>
    <NuxtPage />
  </div>
</template>
