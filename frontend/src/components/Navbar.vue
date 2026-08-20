<script setup>
defineProps({
  savedCount: {
    type: Number,
    default: 0
  }
})

defineEmits([
  'show-saved'
])
</script>

<template>

  <header class="site-header">

    <div class="container-fluid homeai-container site-header-inner">

      <a
        href="#"
        class="site-logo"
      >

        <span class="site-logo-mark">
          H
        </span>

        <span class="site-logo-text">
          HomeAI
        </span>

      </a>

      <nav class="site-nav">

        <a
          href="#"
          class="active"
        >
          Rent
        </a>

        <button
          @click="$emit('show-saved')"
        >
          Saved

          <span
            v-if="savedCount"
            class="nav-saved-count"
          >
            {{ savedCount }}
          </span>
        </button>

        <a href="#about">
          About
        </a>

      </nav>

      <div class="site-header-actions">

        <button class="header-icon-button">
          <i class="bi bi-moon"></i>
        </button>

        <div class="user-chip">
          <i class="bi bi-person"></i>
          Guest
        </div>

      </div>

    </div>

  </header>

</template>
