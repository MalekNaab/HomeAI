<script setup>
const props =
  defineProps({
    modelValue: {
      type: Object,
      required: true
    }
  })

const emit =
  defineEmits([
    'update:modelValue',
    'search',
    'clear'
  ])

function updateField(
  field,
  value
) {

  emit(
    'update:modelValue',
    {
      ...props.modelValue,
      [field]: value
    }
  )
}
</script>

<template>

  <section class="search-panel">

    <div class="search-panel-title">
      Search rentals
    </div>

    <div class="search-panel-grid">

      <div class="search-field search-field-location">

        <label>
          Location
        </label>

        <div class="search-field-control">

          <i class="bi bi-geo-alt"></i>

          <input
            type="text"
            :value="modelValue.location"
            placeholder="Town, area or postcode"
            @input="
              updateField(
                'location',
                $event.target.value
              )
            "
            @keyup.enter="$emit('search')"
          >

        </div>

      </div>

      <div class="search-field">

        <label>
          Min price
        </label>

        <div class="search-field-control">

          <span>£</span>

          <input
            type="number"
            :value="modelValue.minPrice"
            placeholder="No min"
            @input="
              updateField(
                'minPrice',
                $event.target.value
              )
            "
          >

        </div>

      </div>

      <div class="search-field">

        <label>
          Max price
        </label>

        <div class="search-field-control">

          <span>£</span>

          <input
            type="number"
            :value="modelValue.maxPrice"
            placeholder="No max"
            @input="
              updateField(
                'maxPrice',
                $event.target.value
              )
            "
          >

        </div>

      </div>

      <div class="search-field">

        <label>
          Bedrooms
        </label>

        <select
          :value="modelValue.bedrooms"
          @change="
            updateField(
              'bedrooms',
              $event.target.value
            )
          "
        >
          <option value="">Any</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
        </select>

      </div>

      <div class="search-field">

        <label>
          Property type
        </label>

        <select
          :value="modelValue.type"
          @change="
            updateField(
              'type',
              $event.target.value
            )
          "
        >
          <option value="">Any type</option>
          <option value="Flat">Flat</option>
          <option value="Apartment">Apartment</option>
          <option value="Terraced">Terraced</option>
          <option value="Semi Detached">Semi detached</option>
          <option value="Detached">Detached</option>
          <option value="Studio">Studio</option>
        </select>

      </div>

      <button
        class="main-search-button"
        @click="$emit('search')"
      >
        <i class="bi bi-search"></i>
        Search
      </button>

    </div>

  </section>

</template>
