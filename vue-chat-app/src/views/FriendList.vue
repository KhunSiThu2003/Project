<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-3xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Friends
      </h1>
      
      <FriendRequestList />
    </div>
  </div>
</template>

<script setup>
import FriendRequestList from '@/components/FriendRequestList.vue'
</script> 