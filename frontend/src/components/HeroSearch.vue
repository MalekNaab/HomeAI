<script setup>
import {
  ref,
  watch
} from 'vue'

const props =
  defineProps({
    modelValue: {
      type: String,
      default: ''
    }
  })

const emit =
  defineEmits([
    'update:modelValue',
    'search'
  ])

const localValue =
  ref(props.modelValue)

watch(
  () => props.modelValue,
  value => {
    localValue.value = value
  }
)

function submitSearch() {
  emit(
    'update:modelValue',
    localValue.value
  )

  emit(
    'search',
    localValue.value
  )
}
</script>

<template>

  <section class="property-hero">

    <div class="container-fluid homeai-container">

      <div class="property-hero-inner">

        <div class="property-hero-copy">

          <span class="property-kicker">
            UK rentals
          </span>

          <h1>
            Find a home to rent
          </h1>

          <p>
            Search live rental listings and compare
            properties in one place.
          </p>

        </div>

        <div class="natural-search-block">

          <div class="natural-search-label">
            Ask HomeAI
          </div>

          <form
            class="natural-search"
            @submit.prevent="submitSearch"
          >

            <i class="bi bi-chat-left-text"></i>

            <input
              v-model="localValue"
              type="text"
              placeholder="e.g. Find me a 2 bed flat in Islington under £2,000"
            >

            <button type="submit">
              Search
            </button>

          </form>

        </div>

      </div>

    </div>

  </section>

</template>
