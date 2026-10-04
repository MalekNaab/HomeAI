<script setup>
import {
  computed,
  onMounted,
  ref,
  watch
} from 'vue'

import axios from 'axios'

import Navbar from './components/Navbar.vue'
import HeroSearch from './components/HeroSearch.vue'
import PropertyFilters from './components/PropertyFilters.vue'
import PropertyGrid from './components/PropertyGrid.vue'
import PropertyModal from './components/PropertyModal.vue'
import SavedProperties from './components/SavedProperties.vue'
import AIChatbot from './components/AIChatbot.vue'

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.VITE_API_URL || 'http://localhost:5000/api')

const properties = ref([])
const loading = ref(false)
const apiError = ref('')
const currentArea = ref(null)
const totalFound = ref(0)
const demoMode = ref(false)

const searchText = ref('')

const filters = ref({
  location: '',
  minPrice: '',
  maxPrice: '',
  bedrooms: '',
  type: ''
})

const selectedProperty = ref(null)

const sortBy = ref('newest')

// ==========================================
// SORTING
// ==========================================

const sortedProperties = computed(() => {
  const list = [...properties.value]

  switch (sortBy.value) {
    case 'price-low':
      return list.sort(
        (a, b) =>
          Number(a.price || 0) -
          Number(b.price || 0)
      )

    case 'price-high':
      return list.sort(
        (a, b) =>
          Number(b.price || 0) -
          Number(a.price || 0)
      )

    case 'bedrooms':
      return list.sort(
        (a, b) =>
          Number(b.bedrooms || 0) -
          Number(a.bedrooms || 0)
      )

    case 'newest':
    default:
      return list.sort(
        (a, b) =>
          Number(a.daysOnMarket ?? 999) -
          Number(b.daysOnMarket ?? 999)
      )
  }
})

// ==========================================
// SAVED PROPERTIES
// ==========================================

const SAVED_STORAGE_KEY =
  'homeai_saved_properties'

const savedPropertiesData = ref([])

const savedIds = computed(() =>
  savedPropertiesData.value.map(
    property => property.id
  )
)

const savedProperties = computed(() =>
  savedPropertiesData.value
)

function loadSavedProperties() {
  try {
    const saved =
      localStorage.getItem(
        SAVED_STORAGE_KEY
      )

    if (!saved) return

    const parsed =
      JSON.parse(saved)

    if (Array.isArray(parsed)) {
      savedPropertiesData.value =
        parsed
    }
  } catch (error) {
    console.warn(
      'Could not load saved properties:',
      error
    )
  }
}

watch(
  savedPropertiesData,
  value => {
    localStorage.setItem(
      SAVED_STORAGE_KEY,
      JSON.stringify(value)
    )
  },
  {
    deep: true
  }
)

// ==========================================
// FETCH PROPERTIES
// ==========================================

async function fetchProperties() {
  loading.value = true
  apiError.value = ''

  try {
    const params = {}

    if (filters.value.location) {
      params.location =
        filters.value.location
    }

    if (filters.value.minPrice) {
      params.minPrice =
        filters.value.minPrice
    }

    if (filters.value.maxPrice) {
      params.maxPrice =
        filters.value.maxPrice
    }

    if (filters.value.bedrooms) {
      params.bedrooms =
        filters.value.bedrooms
    }

    if (filters.value.type) {
      params.type =
        filters.value.type
    }

    const response =
      await axios.get(
        `${API_URL}/properties`,
        {
          params
        }
      )

    properties.value =
      response.data.properties ||
      []

    currentArea.value =
      response.data.area ||
      null

    totalFound.value =
      response.data.totalFound ||
      properties.value.length

  } catch (error) {
    console.error(error)

    apiError.value =
      error.response?.data?.message ||
      'Could not retrieve live listings.'

  } finally {
    loading.value = false
  }
}

// ==========================================
// NATURAL LANGUAGE SEARCH
// ==========================================

function handleAISearch(query) {
  searchText.value = query

  const lower =
    query.toLowerCase()

  const next = {
    location: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    type: ''
  }

  const priceMatch =
    lower.match(
      /(?:under|max|below|up to|less than)\s*£?\s*([\d,]+)/
    )

  const minPriceMatch =
    lower.match(
      /(?:over|min|above|at least)\s*£?\s*([\d,]+)/
    )

  const bedMatch =
    lower.match(
      /(\d+)\s*(?:bed|beds|bedroom|bedrooms)/
    )

  if (priceMatch) {
    next.maxPrice =
      priceMatch[1]
        .replace(',', '')
  }

  if (minPriceMatch) {
    next.minPrice =
      minPriceMatch[1]
        .replace(',', '')
  }

  if (bedMatch) {
    next.bedrooms =
      bedMatch[1]
  }

  if (lower.includes('studio')) {
    next.type = 'Studio'
  } else if (lower.includes('flat')) {
    next.type = 'Flat'
  } else if (lower.includes('apartment')) {
    next.type = 'Apartment'
  } else if (lower.includes('terraced')) {
    next.type = 'Terraced'
  }

  const locationMatch =
    query.match(
      /\b(?:in|near|around)\s+([A-Za-z][A-Za-z\s'-]{2,40}?)(?=\s+(?:under|below|over|above|max|min|with|for|£|\d+\s*bed)|$)/i
    )

  if (locationMatch) {
    next.location =
      locationMatch[1].trim()
  }

  filters.value = next

  fetchProperties()
}

function applyFilters() {
  searchText.value = ''
  fetchProperties()
}

function clearFilters() {
  searchText.value = ''

  filters.value = {
    location: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    type: ''
  }

  currentArea.value = null
  sortBy.value = 'newest'

  fetchProperties()
}

// ==========================================
// PROPERTY MODAL
// ==========================================

function openProperty(property) {
  selectedProperty.value = property
}

function closeProperty() {
  selectedProperty.value = null
}

// ==========================================
// SAVE / UNSAVE
// ==========================================

function toggleSaved(propertyOrId) {
  let property = null

  if (
    typeof propertyOrId === 'object'
  ) {
    property = propertyOrId
  } else {
    property =
      properties.value.find(
        item =>
          String(item.id) ===
          String(propertyOrId)
      )

    if (!property) {
      property =
        savedPropertiesData.value.find(
          item =>
            String(item.id) ===
            String(propertyOrId)
        )
    }
  }

  if (!property) return

  const exists =
    savedPropertiesData.value.some(
      item =>
        String(item.id) ===
        String(property.id)
    )

  if (exists) {
    savedPropertiesData.value =
      savedPropertiesData.value.filter(
        item =>
          String(item.id) !==
          String(property.id)
      )
  } else {
    savedPropertiesData.value.push(
      property
    )
  }
}

// ==========================================
// ASK AI
// ==========================================

function askAIAboutProperty(property) {
  if (!property) return

  selectedProperty.value = null

  window.dispatchEvent(
    new CustomEvent(
      'homeai-ask-property',
      {
        detail: {
          property
        }
      }
    )
  )
}

function scrollToSaved() {
  document
    .getElementById(
      'saved-properties'
    )
    ?.scrollIntoView({
      behavior: 'smooth'
    })
}

onMounted(() => {
  loadSavedProperties()
  fetchProperties()
})
</script>

<template>
  <div class="app-shell">

    <Navbar
      :saved-count="savedIds.length"
      @show-saved="scrollToSaved"
    />

    <main>

      <HeroSearch
        v-model="searchText"
        @search="handleAISearch"
      />

      <section
        class="container-fluid homeai-container"
      >

        <PropertyFilters
          v-model="filters"
          @search="applyFilters"
          @clear="clearFilters"
        />

        <div
          v-if="currentArea"
          class="active-area-bar"
        >
          <i class="bi bi-geo-alt"></i>

          Rentals in

          <strong>
            {{ currentArea.name }}
          </strong>
        </div>


        <div
          v-if="demoMode"
          class="demo-data-notice"
        >
          <i class="bi bi-info-circle"></i>

          <div>
            <strong>
              Demo property data
            </strong>

            <span>
              Live property data is currently unavailable, so HomeAI is showing representative demo listings.
            </span>
          </div>
        </div>
        <div class="results-toolbar">

          <div class="results-heading">

            <div>
              <h2>
                Properties to rent
              </h2>

              <span v-if="loading">
                Searching...
              </span>

              <span v-else>
                {{ properties.length }} shown

                <template v-if="totalFound">
                  from
                  {{
                    totalFound.toLocaleString()
                  }}
                  matches
                </template>
              </span>
            </div>

          </div>

          <div class="results-actions">

            <label>
              Sort by
            </label>

            <select v-model="sortBy">
              <option value="newest">
                Newest listed
              </option>

              <option value="price-low">
                Price: low to high
              </option>

              <option value="price-high">
                Price: high to low
              </option>

              <option value="bedrooms">
                Most bedrooms
              </option>
            </select>

            <button
              class="reset-search-button"
              @click="clearFilters"
            >
              Reset
            </button>

          </div>

        </div>

        <div
          v-if="apiError"
          class="api-error"
        >
          <i class="bi bi-exclamation-circle"></i>

          <div>
            <strong>
              Couldn't load properties
            </strong>

            <p>
              {{ apiError }}
            </p>
          </div>
        </div>

        <div
          v-else-if="loading"
          class="property-loading"
        >
          <div
            class="spinner-border"
            role="status"
          ></div>

          <span>
            Loading current listings...
          </span>
        </div>

        <PropertyGrid
          v-else
          :properties="sortedProperties"
          :saved-ids="savedIds"
          @open-property="openProperty"
          @toggle-saved="toggleSaved"
        />

        <SavedProperties
          :properties="savedProperties"
          @open-property="openProperty"
          @remove-saved="toggleSaved"
        />

      </section>

    </main>

    <PropertyModal
      :property="selectedProperty"
      :saved="
        selectedProperty
          ? savedIds.includes(
              selectedProperty.id
            )
          : false
      "
      @close="closeProperty"
      @toggle-saved="toggleSaved"
      @ask-ai="askAIAboutProperty"
    />

    <AIChatbot
      :properties="sortedProperties"
      @search-properties="handleAISearch"
      @open-property="openProperty"
    />

  </div>
</template>



