const express = require('express')
const axios = require('axios')

const router = express.Router()

router.get('/test', async (req, res) => {
  try {
    if (!process.env.HOMEDATA_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'HOMEDATA_API_KEY is missing from backend/.env'
      })
    }

    const response = await axios.get(
      'https://api.homedata.co.uk/live-listings/search/',
      {
        headers: {
          Authorization: `Api-Key ${process.env.HOMEDATA_API_KEY}`
        },
        params: {
          transaction_type: 'Rental',
          bedrooms: 2,
          max_price: 2000,
          page: 1,
          page_size: 10
        }
      }
    )

    res.json({
      success: true,
      totalFound: response.data.count,
      page: response.data.page,
      results: response.data.results
    })

  } catch (error) {

    console.error(
      'Homedata error:',
      error.response?.data || error.message
    )

    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Homedata request failed',
      error: error.response?.data || error.message
    })
  }
})

module.exports = router

