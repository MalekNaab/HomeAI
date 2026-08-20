<script setup>
import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref
} from 'vue'

import axios from 'axios'

const props =
  defineProps({

    properties: {
      type: Array,
      default: () => []
    }

  })

const emit =
  defineEmits([
    'search-properties',
    'open-property'
  ])

const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api'

const isOpen =
  ref(true)

const message =
  ref('')

const loading =
  ref(false)

const messagesContainer =
  ref(null)

const messages =
  ref([
    {
      id: 1,

      role:
        'assistant',

      text:
        "Hi! I'm your AI property assistant. Search for an area first, then ask me about the live properties."
    }
  ])

// ==========================================
// SCROLL CHAT
// ==========================================

async function scrollToBottom() {

  await nextTick()

  if (
    messagesContainer.value
  ) {

    messagesContainer.value.scrollTop =
      messagesContainer.value.scrollHeight
  }
}

// ==========================================
// DETECT SEARCH-LIKE REQUEST
// ==========================================

function looksLikePropertySearch(
  text
) {

  const lower =
    text.toLowerCase()

  return (
    lower.includes('find me') ||
    lower.includes('show me') ||
    lower.includes('search for') ||
    lower.includes('looking for') ||
    lower.includes('bedroom') ||
    lower.includes('flat in') ||
    lower.includes('apartment in')
  )
}

// ==========================================
// LOCAL EMPTY-STATE RESPONSE
// ==========================================

function noPropertiesLoaded() {

  messages.value.push({
    id:
      Date.now() + 1,

    role:
      'assistant',

    text:
      "Search for an area first so I can compare the live listings for you. For example, try Islington, Camden or Hackney."
  })
}

// ==========================================
// SEND MESSAGE
// ==========================================

async function sendMessage() {

  const query =
    message.value.trim()

  if (
    !query ||
    loading.value
  ) {
    return
  }

  messages.value.push({
    id:
      Date.now(),

    role:
      'user',

    text:
      query
  })

  message.value = ''

  await scrollToBottom()

  // --------------------------------------
  // If user is making a search request,
  // update the main property page first.
  // --------------------------------------

  if (
    looksLikePropertySearch(
      query
    )
  ) {

    emit(
      'search-properties',
      query
    )

    // Give the search a moment before
    // continuing.
    await new Promise(
      resolve =>
        setTimeout(resolve, 500)
    )
  }

  // --------------------------------------
  // DO NOT CALL OPENROUTER
  // WITHOUT PROPERTY RESULTS
  // --------------------------------------

  if (
    !props.properties ||
    props.properties.length === 0
  ) {

    noPropertiesLoaded()

    await scrollToBottom()

    return
  }

  loading.value =
    true

  try {

    const response =
      await axios.post(
        `${API_URL}/chat`,

        {
          message:
            query,

          properties:
            props.properties
        }
      )

    messages.value.push({
      id:
        Date.now() + 1,

      role:
        'assistant',

      text:
        response.data.reply
    })

  } catch (error) {

    console.error(
      error
    )

    messages.value.push({
      id:
        Date.now() + 1,

      role:
        'assistant',

      text:
        "I couldn't reach the AI service just now. Your property search still works, so try again in a moment."
    })

  } finally {

    loading.value =
      false

    await scrollToBottom()
  }
}

// ==========================================
// QUICK QUESTIONS
// ==========================================

function quickQuestion(
  text
) {

  message.value =
    text

  sendMessage()
}
</script>

<template>

  <button
    v-if="!isOpen"
    class="chat-launcher"
    @click="isOpen = true"
  >

    <i class="bi bi-stars"></i>

  </button>

  <aside
    v-else
    class="chatbot-panel"
  >

    <div class="chatbot-header">

      <div>

        <span class="chatbot-logo">

          <i class="bi bi-stars"></i>

        </span>

        <span>

          <strong>
            AI Property Assistant
          </strong>

          <small>

            <span class="online-dot"></span>

            AI online

          </small>

        </span>

      </div>

      <button
        @click="isOpen = false"
      >

        <i class="bi bi-dash-lg"></i>

      </button>

    </div>

    <div
      ref="messagesContainer"
      class="chatbot-messages"
    >

      <div
        v-for="chat in messages"
        :key="chat.id"
        class="chat-message-wrapper"
        :class="chat.role"
      >

        <div class="chat-message">

          {{ chat.text }}

        </div>

      </div>

      <div
        v-if="loading"
        class="chat-message-wrapper assistant"
      >

        <div class="ai-thinking">

          <span></span>
          <span></span>
          <span></span>

        </div>

      </div>

    </div>

    <div
      v-if="
        properties.length &&
        !loading
      "
      class="chat-quick-actions"
    >

      <button
        @click="
          quickQuestion(
            'Which are the best value properties here?'
          )
        "
      >
        Best value
      </button>

      <button
        @click="
          quickQuestion(
            'Which property would you recommend and why?'
          )
        "
      >
        Recommend one
      </button>

      <button
        @click="
          quickQuestion(
            'Compare the cheapest properties.'
          )
        "
      >
        Compare cheapest
      </button>

    </div>

    <form
      class="chatbot-input"
      @submit.prevent="
        sendMessage
      "
    >

      <input
        v-model="message"
        type="text"
        placeholder="Ask HomeAI..."
        :disabled="loading"
      >

      <button
        type="submit"
        :disabled="loading"
      >

        <i
          v-if="!loading"
          class="bi bi-send-fill"
        ></i>

        <span
          v-else
          class="spinner-border spinner-border-sm"
        ></span>

      </button>

    </form>

    <div class="chatbot-footer">

      <i class="bi bi-stars"></i>

      Powered by AI + live property data

    </div>

  </aside>

</template>

