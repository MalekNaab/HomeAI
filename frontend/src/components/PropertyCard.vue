<script setup>
import {
  computed
} from 'vue'

const props =
  defineProps({
    property: {
      type: Object,
      required: true
    },

    saved: {
      type: Boolean,
      default: false
    }
  })

defineEmits([
  'open',
  'toggle-saved'
])

const addedLabel =
  computed(() => {

    const days =
      props.property.daysOnMarket

    if (
      days === null ||
      days === undefined
    ) {
      return 'Recently added'
    }

    if (days === 0) {
      return 'Added today'
    }

    if (days === 1) {
      return 'Added yesterday'
    }

    return `Added ${days} days ago`
  })
</script>

<template>

  <article class="listing-card">

    <div
      class="listing-card-image"
      @click="$emit('open', property)"
    >

      <img
        :src="property.image"
        :alt="property.title"
      >

      <span
        v-if="property.reduced"
        class="listing-reduced-tag"
      >
        Reduced
      </span>

      <button
        class="listing-save-button"
        :class="{ saved }"
        @click.stop="
          $emit(
            'toggle-saved',
            property.id
          )
        "
        :title="
          saved
            ? 'Remove from saved'
            : 'Save property'
        "
      >
        <i
          :class="
            saved
              ? 'bi bi-heart-fill'
              : 'bi bi-heart'
          "
        ></i>
      </button>

    </div>

    <div class="listing-card-content">

      <div class="listing-added">
        {{ addedLabel }}
      </div>

      <div class="listing-card-price">

        £{{ property.price.toLocaleString() }}

        <span>
          pcm
        </span>

      </div>

      <h3>
        {{ property.title }}
      </h3>

      <p class="listing-address">
        {{ property.location }}
      </p>

      <div class="listing-meta">

        <span v-if="property.bedrooms">
          <i class="bi bi-door-open"></i>
          {{ property.bedrooms }} bed
        </span>

        <span v-if="property.bathrooms">
          <i class="bi bi-droplet"></i>
          {{ property.bathrooms }} bath
        </span>

        <span v-if="property.type">
          {{ property.type }}
        </span>

      </div>

      <div class="listing-card-footer">

        <div class="listing-agent">
          <small>
            Listed by
          </small>

          <span>
            {{
              property.agentName ||
              'Local agent'
            }}
          </span>
        </div>

        <button
          @click="$emit('open', property)"
        >
          View details
          <i class="bi bi-chevron-right"></i>
        </button>

      </div>

    </div>

  </article>

</template>
