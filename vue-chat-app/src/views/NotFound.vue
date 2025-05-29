<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 text-center">
      <div>
        <h1 class="text-9xl font-bold text-primary-600">404</h1>
        <h2 class="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
          {{ $t('notFound.title') }}
        </h2>
        <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {{ $t('notFound.message') }}
        </p>
      </div>
      <div class="mt-8">
        <router-link
          to="/"
          class="btn btn-primary"
        >
          {{ $t('notFound.goHome') }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script> 