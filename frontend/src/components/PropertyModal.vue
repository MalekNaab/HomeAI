<script setup>
import {
  computed
} from 'vue'

const props =
  defineProps({
    property: {
      type: Object,
      default: null
    },

    saved: {
      type: Boolean,
      default: false
    }
  })

defineEmits([
  'close',
  'toggle-saved',
  'ask-ai'
])

const addedLabel =
  computed(() => {

    const days =
      props.property?.daysOnMarket

    if (
      days === null ||
      days === undefined
    ) {
      return 'Recently listed'
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

  <div
    v-if="property"
    class="property-modal-backdrop"
    @click.self="$emit('close')"
  >

    <div class="property-modal listing-detail-modal">

      <button
        class="modal-close"
        @click="$emit('close')"
      >
        <i class="bi bi-x-lg"></i>
      </button>

      <div class="listing-detail-image">

        <img
          :src="property.image"
          :alt="property.title"
        >

        <span
          v-if="property.reduced"
          class="detail-reduced-tag"
        >
          Price reduced
        </span>

      </div>

      <div class="listing-detail-content">

        <div class="listing-detail-top">

          <div>
            <div class="listing-detail-added">
              {{ addedLabel }}
            </div>

            <h2>
              {{ property.title }}
            </h2>

            <p>
              {{ property.location }}
            </p>
          </div>

          <div class="listing-detail-price">
            £{{ property.price.toLocaleString() }}

            <span>
              pcm
            </span>
          </div>

        </div>

        <div class="listing-detail-facts">

          <div>
            <strong>
              {{ property.bedrooms || '-' }}
            </strong>

            <span>
              Bedrooms
            </span>
          </div>

          <div>
            <strong>
              {{ property.bathrooms || '-' }}
            </strong>

            <span>
              Bathrooms
            </span>
          </div>

          <div>
            <strong>
              {{ property.type }}
            </strong>

            <span>
              Property type
            </span>
          </div>

        </div>

        <section class="listing-detail-section">

          <h3>
            Property description
          </h3>

          <p>
            {{ property.description }}
          </p>

        </section>

        <section class="listing-detail-section">

          <h3>
            Property information
          </h3>

          <div class="listing-info-table">

            <div>
              <span>
                Postcode
              </span>

              <strong>
                {{
                  property.postcode ||
                  'Not provided'
                }}
              </strong>
            </div>

            <div>
              <span>
                Status
              </span>

              <strong>
                {{
                  property.status ||
                  'Available'
                }}
              </strong>
            </div>

            <div>
              <span>
                Parking
              </span>

              <strong>
                {{
                  property.parking
                    ? 'Yes'
                    : 'Not specified'
                }}
              </strong>
            </div>

            <div>
              <span>
                Garden
              </span>

              <strong>
                {{
                  property.garden
                    ? 'Yes'
                    : 'Not specified'
                }}
              </strong>
            </div>

          </div>

        </section>

        <div class="detail-agent">

          <div>
            <small>
              Marketed by
            </small>

            <strong>
              {{
                property.agentName ||
                'Local estate agent'
              }}
            </strong>
          </div>

          <span>
            Live listing
          </span>

        </div>

        <div class="modal-actions">

          <button
            class="save-property-button"
            :class="{ saved }"
            @click="
              $emit(
                'toggle-saved',
                property.id
              )
            "
          >
            <i
              :class="
                saved
                  ? 'bi bi-heart-fill'
                  : 'bi bi-heart'
              "
            ></i>

            {{
              saved
                ? 'Saved'
                : 'Save property'
            }}
          </button>

          <button
            class="primary-property-button"
            @click="$emit('ask-ai', property)"
          >
            <i class="bi bi-chat-left-text"></i>

            Ask HomeAI
          </button>

        </div>

      </div>

    </div>

  </div>

</template>
