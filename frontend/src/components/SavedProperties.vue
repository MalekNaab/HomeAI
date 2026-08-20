<script setup>
defineProps({
  properties: {
    type: Array,
    default: () => []
  }
})

defineEmits([
  'open-property',
  'remove-saved'
])
</script>

<template>
  <section
    id="saved-properties"
    class="saved-section"
  >
    <div class="saved-section-header">
      <div>
        <span class="saved-heading-icon">
          <i class="bi bi-heart-fill"></i>
        </span>

        <div>
          <h2>Saved Properties</h2>

          <p>
            Your favourite homes in one place.
          </p>
        </div>
      </div>

      <span class="saved-total">
        {{ properties.length }}
        saved
      </span>
    </div>

    <div
      v-if="properties.length"
      class="saved-property-grid"
    >
      <article
        v-for="property in properties"
        :key="property.id"
        class="saved-property-card"
      >
        <img
          :src="property.image"
          :alt="property.title"
          @click="$emit('open-property', property)"
        >

        <div
          class="saved-property-info"
          @click="$emit('open-property', property)"
        >
          <strong>
            {{ property.title }}
          </strong>

          <small>
            {{ property.location }}
          </small>

          <span>
            £{{ property.price.toLocaleString() }}/month
          </span>
        </div>

        <button
          class="saved-remove-button"
          title="Remove saved property"
          @click="$emit('remove-saved', property.id)"
        >
          <i class="bi bi-x-lg"></i>
        </button>
      </article>
    </div>

    <div
      v-else
      class="saved-empty"
    >
      <div>
        <i class="bi bi-heart"></i>
      </div>

      <h3>No saved properties yet</h3>

      <p>
        Click the heart on a property and it will
        appear here.
      </p>
    </div>
  </section>
</template>

