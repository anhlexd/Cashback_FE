<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const authStore = useAuthStore()

onMounted(async () => {
  authStore.initFromStorage()
  if (authStore.isAuthenticated && !authStore.user) {
    await authStore.fetchProfile()
  }
})
</script>
