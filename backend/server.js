const express = require('express')
const cors = require('cors')
const path = require('path')
const dotenv = require('dotenv')

dotenv.config({
  path: path.join(__dirname, '.env')
})

const propertyRoutes = require('./routes/properties')
const chatRoutes = require('./routes/chat')
const homedataRoutes = require('./routes/homedata')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'HomeAI backend is running'
  })
})

app.get('/api/env-check', (req, res) => {
  res.json({
    homedataConfigured: Boolean(process.env.HOMEDATA_API_KEY),
    databaseConfigured: Boolean(process.env.DATABASE_URL),
    openRouterConfigured: Boolean(process.env.OPENROUTER_API_KEY)
  })
})

app.use('/api/properties', propertyRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/homedata', homedataRoutes)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`HomeAI backend running on http://localhost:${PORT}`)

  console.log(
    'Homedata API:',
    process.env.HOMEDATA_API_KEY
      ? 'CONFIGURED'
      : 'MISSING'
  )
})
