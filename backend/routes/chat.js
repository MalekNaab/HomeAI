const express = require('express')
const axios = require('axios')

const router = express.Router()

const OPENROUTER_URL =
  'https://openrouter.ai/api/v1/chat/completions'

function extractText(message) {
  if (!message) {
    return ''
  }

  if (
    typeof message.content === 'string' &&
    message.content.trim()
  ) {
    return message.content.trim()
  }

  if (Array.isArray(message.content)) {
    const text = message.content
      .map((part) => {
        if (typeof part === 'string') {
          return part
        }

        return part?.text || ''
      })
      .join('\n')
      .trim()

    if (text) {
      return text
    }
  }

  return ''
}

function cleanReply(reply) {
  return String(reply)
    .replace(/here'?s a thinking process:?/gi, '')
    .replace(/\*\*analy[sz]e user input:?\*\*/gi, '')
    .replace(/\*\*examine the data:?\*\*/gi, '')
    .replace(/\*\*thinking process:?\*\*/gi, '')
    .trim()
}

async function callOpenRouter({
  apiKey,
  model,
  messages
}) {
  const response = await axios.post(
    OPENROUTER_URL,
    {
      model,

      messages,

      temperature: 0.2,

      max_tokens: 450,

      reasoning: {
        exclude: true
      }
    },
    {
      headers: {
        Authorization:
          `Bearer ${apiKey}`,

        'Content-Type':
          'application/json',

        'HTTP-Referer':
          'http://localhost:5173',

        'X-Title':
          'HomeAI'
      },

      timeout: 45000
    }
  )

  const message =
    response.data
      ?.choices
      ?.[0]
      ?.message

  return {
    response,
    reply: extractText(message)
  }
}

router.post('/', async (req, res) => {
  try {
    const {
      message,
      properties = []
    } = req.body

    if (
      !message ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'A message is required'
      })
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({
        success: false,
        message:
          'OPENROUTER_API_KEY is not configured'
      })
    }

    if (
      !Array.isArray(properties) ||
      properties.length === 0
    ) {
      return res.json({
        success: true,

        reply:
          'Search for an area first so I can compare the live listings for you.',

        model:
          'local'
      })
    }

    const propertyContext =
      properties
        .slice(0, 15)
        .map(
          (property, index) => ({
            number: index + 1,

            id:
              property.id,

            title:
              property.title,

            location:
              property.location,

            postcode:
              property.postcode,

            price:
              property.price,

            bedrooms:
              property.bedrooms,

            bathrooms:
              property.bathrooms,

            type:
              property.type,

            parking:
              property.parking,

            garden:
              property.garden,

            daysOnMarket:
              property.daysOnMarket,

            agent:
              property.agentName
          })
        )

    const systemPrompt = `
You are HomeAI, a concise AI assistant for a UK rental property website.

You are given REAL property listings currently displayed to the user.

Your job is to help the user compare and understand those properties.

Rules:

- Give only the final useful answer.
- Never reveal hidden reasoning, chain-of-thought or internal analysis.
- Never invent properties.
- Only discuss properties in the provided data.
- Prices are monthly rent in GBP.
- Never invent features.
- If a feature is missing, do not guess.
- If recommending properties, recommend no more than 3.
- Mention the property/address, monthly rent and bedrooms where useful.
- Keep answers concise and conversational.
- When asked for best value, consider rent, bedrooms, bathrooms, location and confirmed features.
- Do not provide legal, mortgage or financial advice.

Current properties:

${JSON.stringify(propertyContext)}
`

    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: message
      }
    ]

    // First try the automatic free router.
    let result = await callOpenRouter({
      apiKey:
        process.env.OPENROUTER_API_KEY,

      model:
        'openrouter/free',

      messages
    })

    // Some free-router models occasionally return
    // no normal content. Retry once with a fixed
    // free model instead of failing the chatbot.
    if (!result.reply) {
      console.log(
        'Free router returned empty content. Retrying...'
      )

      result = await callOpenRouter({
        apiKey:
          process.env.OPENROUTER_API_KEY,

        model:
          'openai/gpt-oss-20b:free',

        messages
      })
    }

    if (!result.reply) {
      return res.status(503).json({
        success: false,

        message:
          'The free AI service returned an empty response. Please try again.'
      })
    }

    const reply =
      cleanReply(result.reply)

    res.json({
      success: true,

      reply,

      model:
        result.response.data.model ||
        'OpenRouter'
    })

  } catch (error) {
    console.error(
      'OpenRouter AI error:',
      error.response?.data ||
      error.message
    )

    res
      .status(
        error.response?.status ||
        500
      )
      .json({
        success: false,

        message:
          'The AI assistant could not respond. Please try again.',

        error:
          error.response?.data ||
          error.message
      })
  }
})

module.exports = router