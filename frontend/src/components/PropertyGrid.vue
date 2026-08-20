<script setup>
import PropertyCard from './PropertyCard.vue'

defineProps({
  properties: {
    type: Array,
    default: () => []
  },

  savedIds: {
    type: Array,
    default: () => []
  }
})

defineEmits(['open-property', 'toggle-saved'])
</script>

<template>
  <section
    id="properties"
    class="property-grid"
  >
    <PropertyCard
      v-for="property in properties"
      :key="property.id"
      :property="property"
      :saved="savedIds.includes(property.id)"
      @open="$emit('open-property', property)"
      @toggle-saved="$emit('toggle-saved', $event)"
    />

    <div
      v-if="properties.length === 0"
      class="empty-results"
    >
      <div class="empty-icon">
        <i class="bi bi-house-x"></i>
      </div>

      <h3>No properties found</h3>

      <p>
        Try changing your filters or asking the AI assistant
        for something different.
      </p>
    </div>
  </section>
</template>

