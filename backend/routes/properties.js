const express = require('express')
const axios = require('axios')

const router = express.Router()

const HOMEDATA_BASE =
  'https://api.homedata.co.uk'

const CACHE_TIME =
  60 * 60 * 1000

// ==========================================
// FALLBACK IMAGES
// ==========================================

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=900&q=80'
]

// ==========================================
// DEMO FALLBACK PROPERTIES
// ==========================================

const DEMO_PROPERTIES = [
  {
    id: 'demo-1',
    title: '2 Bed Flat',
    location: 'Holloway Road, Islington',
    postcode: 'N7',
    price: 1900,
    bedrooms: 2,
    bathrooms: 1,
    type: 'Flat',
    parking: false,
    garden: false,
    daysOnMarket: 2,
    image: FALLBACK_IMAGES[0],
    images: [FALLBACK_IMAGES[0]],
    description:
      'A two-bedroom rental property in Islington, shown as demo data while live property listings are unavailable.',
    features: [
      '2 Bedrooms',
      '1 Bathroom',
      'Demo Listing'
    ],
    transactionType: 'Rental',
    status: 'Available',
    source: 'HomeAI Demo',
    agentName: 'North London Lettings',
    reduced: false,
    isDemo: true
  },

  {
    id: 'demo-2',
    title: '1 Bed Apartment',
    location: 'Camden Road, Camden',
    postcode: 'NW1',
    price: 1650,
    bedrooms: 1,
    bathrooms: 1,
    type: 'Apartment',
    parking: false,
    garden: false,
    daysOnMarket: 1,
    image: FALLBACK_IMAGES[1],
    images: [FALLBACK_IMAGES[1]],
    description:
      'A one-bedroom apartment in Camden, shown as demo data while live property listings are unavailable.',
    features: [
      '1 Bedroom',
      '1 Bathroom',
      'Demo Listing'
    ],
    transactionType: 'Rental',
    status: 'Available',
    source: 'HomeAI Demo',
    agentName: 'Camden Property Co.',
    reduced: false,
    isDemo: true
  },

  {
    id: 'demo-3',
    title: '2 Bed Flat',
    location: 'Hackney Central, Hackney',
    postcode: 'E8',
    price: 1800,
    bedrooms: 2,
    bathrooms: 1,
    type: 'Flat',
    parking: false,
    garden: false,
    daysOnMarket: 4,
    image: FALLBACK_IMAGES[2],
    images: [FALLBACK_IMAGES[2]],
    description:
      'A two-bedroom flat in Hackney, shown as demo data while live property listings are unavailable.',
    features: [
      '2 Bedrooms',
      '1 Bathroom',
      'Demo Listing'
    ],
    transactionType: 'Rental',
    status: 'Available',
    source: 'HomeAI Demo',
    agentName: 'Hackney Homes',
    reduced: false,
    isDemo: true
  },

  {
    id: 'demo-4',
    title: 'Studio Apartment',
    location: 'Shoreditch High Street',
    postcode: 'E1',
    price: 1450,
    bedrooms: 1,
    bathrooms: 1,
    type: 'Studio',
    parking: false,
    garden: false,
    daysOnMarket: 0,
    image: FALLBACK_IMAGES[3],
    images: [FALLBACK_IMAGES[3]],
    description:
      'A studio apartment in Shoreditch, shown as demo data while live property listings are unavailable.',
    features: [
      'Studio',
      '1 Bathroom',
      'Demo Listing'
    ],
    transactionType: 'Rental',
    status: 'Available',
    source: 'HomeAI Demo',
    agentName: 'East London Rentals',
    reduced: false,
    isDemo: true
  },

  {
    id: 'demo-5',
    title: '3 Bed Apartment',
    location: 'Caledonian Road, Islington',
    postcode: 'N1',
    price: 2450,
    bedrooms: 3,
    bathrooms: 2,
    type: 'Apartment',
    parking: false,
    garden: false,
    daysOnMarket: 5,
    image: FALLBACK_IMAGES[4],
    images: [FALLBACK_IMAGES[4]],
    description:
      'A three-bedroom apartment in Islington, shown as demo data while live property listings are unavailable.',
    features: [
      '3 Bedrooms',
      '2 Bathrooms',
      'Demo Listing'
    ],
    transactionType: 'Rental',
    status: 'Available',
    source: 'HomeAI Demo',
    agentName: 'Islington Residential',
    reduced: false,
    isDemo: true
  },

  {
    id: 'demo-6',
    title: '2 Bed Terraced',
    location: 'Finsbury Park',
    postcode: 'N4',
    price: 2100,
    bedrooms: 2,
    bathrooms: 1,
    type: 'Terraced',
    parking: false,
    garden: true,
    daysOnMarket: 3,
    image: FALLBACK_IMAGES[5],
    images: [FALLBACK_IMAGES[5]],
    description:
      'A two-bedroom terraced property near Finsbury Park, shown as demo data while live listings are unavailable.',
    features: [
      '2 Bedrooms',
      'Garden',
      'Demo Listing'
    ],
    transactionType: 'Rental',
    status: 'Available',
    source: 'HomeAI Demo',
    agentName: 'Northside Estates',
    reduced: false,
    isDemo: true
  }
]

// ==========================================
// SEARCH CACHE
// ==========================================

const searchCache =
  new Map()

// ==========================================
// HELPERS
// ==========================================

function formatType(type) {

  if (!type) {
    return 'Property'
  }

  return String(type)
    .replaceAll('_', ' ')
    .split(' ')
    .map(
      word =>
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase()
    )
    .join(' ')
}

function normaliseListing(
  listing,
  index
) {

  const rawType =
    listing.listing_property_type ||
    listing.property_type ||
    'Property'

  const type =
    formatType(rawType)

  const address =
    listing.display_address ||
    listing.street ||
    listing.postcode ||
    'UK Property'

  const postcode =
    listing.postcode || ''

  const images =
    Array.isArray(listing.images)
      ? listing.images.filter(Boolean)
      : []

  const fallbackImage =
    FALLBACK_IMAGES[
      index %
      FALLBACK_IMAGES.length
    ]

  const image =
    images[0] ||
    fallbackImage

  const bedrooms =
    Number(listing.bedrooms) || 0

  const bathrooms =
    Number(listing.bathrooms) || 0

  const features = []

  if (
    listing.has_parking === true
  ) {
    features.push('Parking')
  }

  if (
    listing.has_garden === true
  ) {
    features.push('Garden')
  }

  if (
    listing.is_new_build === true
  ) {
    features.push('New Build')
  }

  if (
    listing.is_reduced === true
  ) {
    features.push('Price Reduced')
  }

  if (listing.ownership) {
    features.push(
      formatType(
        listing.ownership
      )
    )
  }

  if (
    listing.days_on_market !== null &&
    listing.days_on_market !== undefined
  ) {
    features.push(
      `${listing.days_on_market} days on market`
    )
  }

  return {
    id:
      listing.id ||
      listing.listing_id ||
      `listing-${index}`,

    homedataId:
      listing.id || null,

    uprn:
      listing.property_uprn || null,

    title:
      bedrooms
        ? `${bedrooms} Bed ${type}`
        : type,

    location:
      address,

    address,

    postcode,

    price:
      Number(
        listing.latest_price
      ) || 0,

    bedrooms,

    bathrooms,

    size:
      listing.floor_area
        ? Number(
            listing.floor_area
          )
        : null,

    type,

    parking:
      listing.has_parking === true,

    garden:
      listing.has_garden === true,

    image,

    images:
      images.length
        ? images
        : [fallbackImage],

    description:
      listing.description ||
      `A live ${type.toLowerCase()} currently available at ${address}.`,

    features:
      features.length
        ? features
        : [
            type,
            'Live UK Listing'
          ],

    transactionType:
      listing.transaction_type ||
      'Rental',

    status:
      listing.latest_status ||
      'Available',

    source:
      listing.source ||
      'Homedata',

    agentName:
      listing.agent_name ||
      null,

    addedDate:
      listing.added_date ||
      null,

    daysOnMarket:
      listing.days_on_market ??
      null,

    reduced:
      listing.is_reduced === true,

    timesReduced:
      listing.times_reduced || 0,

    latitude:
      listing.geopoint?.lat ||
      null,

    longitude:
      listing.geopoint?.lon ||
      null,

    isDemo:
      false
  }
}

// ==========================================
// DEMO FILTERING
// ==========================================

function filterDemoProperties(
  filters
) {

  let results =
    [...DEMO_PROPERTIES]

  if (filters.location) {

    const location =
      filters.location
        .toLowerCase()

    const locationMatches =
      results.filter(
        property =>
          property.location
            .toLowerCase()
            .includes(location) ||
          property.postcode
            .toLowerCase()
            .includes(location)
      )

    // If no demo listing exists for that
    // exact area, still show demo data.
    if (
      locationMatches.length
    ) {
      results =
        locationMatches
    }
  }

  if (filters.minPrice) {
    results =
      results.filter(
        property =>
          property.price >=
          Number(
            filters.minPrice
          )
      )
  }

  if (filters.maxPrice) {
    results =
      results.filter(
        property =>
          property.price <=
          Number(
            filters.maxPrice
          )
      )
  }

  if (filters.bedrooms) {
    results =
      results.filter(
        property =>
          property.bedrooms >=
          Number(
            filters.bedrooms
          )
      )
  }

  if (filters.type) {

    results =
      results.filter(
        property =>
          property.type
            .toLowerCase()
            .includes(
              filters.type
                .toLowerCase()
            )
      )
  }

  return results
}

// ==========================================
// BOUNDARY LOOKUP
// ==========================================

async function getBoundary(
  location
) {

  if (!location) {
    return null
  }

  const response =
    await axios.get(
      `${HOMEDATA_BASE}/boundaries/autocomplete/`,
      {
        headers: {
          Authorization:
            `Api-Key ${process.env.HOMEDATA_API_KEY}`
        },

        params: {
          q: location
        },

        timeout: 10000
      }
    )

  const results =
    response.data.results ||
    []

  if (!results.length) {
    return null
  }

  return results[0]
}

// ==========================================
// CACHE KEY
// ==========================================

function getCacheKey(
  filters
) {

  return JSON.stringify({
    location:
      filters.location || '',

    minPrice:
      filters.minPrice || '',

    maxPrice:
      filters.maxPrice || '',

    bedrooms:
      filters.bedrooms || '',

    type:
      filters.type || ''
  })
}

// ==========================================
// GET /api/properties
// ==========================================

router.get('/', async (req, res) => {

  const filters = {
    location:
      req.query.location
        ?.trim() || '',

    minPrice:
      req.query.minPrice || '',

    maxPrice:
      req.query.maxPrice || '',

    bedrooms:
      req.query.bedrooms || '',

    type:
      req.query.type
        ?.trim() || ''
  }

  const cacheKey =
    getCacheKey(filters)

  const cached =
    searchCache.get(
      cacheKey
    )

  // ========================================
  // RETURN CACHE FIRST
  // ========================================

  if (
    cached &&
    cached.expiresAt >
      Date.now()
  ) {

    return res.json({
      success: true,

      cached: true,

      demoMode:
        cached.demoMode ||
        false,

      area:
        cached.area,

      count:
        cached.properties.length,

      totalFound:
        cached.totalFound,

      properties:
        cached.properties
    })
  }

  try {

    if (
      !process.env.HOMEDATA_API_KEY
    ) {
      throw new Error(
        'Homedata API key missing'
      )
    }

    const params = {
      transaction_type:
        'Rental',

      page:
        1,

      page_size:
        30,

      sort:
        '-added_date'
    }

    let area =
      null

    if (
      filters.location
    ) {

      area =
        await getBoundary(
          filters.location
        )

      if (area?.id) {
        params.boundary_id =
          area.id
      }
    }

    if (
      filters.minPrice
    ) {
      params.min_price =
        Number(
          filters.minPrice
        )
    }

    if (
      filters.maxPrice
    ) {
      params.max_price =
        Number(
          filters.maxPrice
        )
    }

    if (
      filters.bedrooms
    ) {
      params.bedrooms =
        Number(
          filters.bedrooms
        )
    }

    console.log(
      'Fresh Homedata search:',
      {
        area:
          area?.name ||
          'UK-wide',

        bedrooms:
          params.bedrooms,

        minPrice:
          params.min_price,

        maxPrice:
          params.max_price
      }
    )

    const response =
      await axios.get(
        `${HOMEDATA_BASE}/live-listings/search/`,
        {
          headers: {
            Authorization:
              `Api-Key ${process.env.HOMEDATA_API_KEY}`
          },

          params,

          timeout: 15000
        }
      )

    let rawListings =
      response.data.results ||
      []

    if (filters.type) {

      const wanted =
        filters.type
          .toLowerCase()

      rawListings =
        rawListings.filter(
          listing => {

            const listingType =
              String(
                listing.listing_property_type ||
                listing.property_type ||
                ''
              )
                .toLowerCase()

            return listingType
              .includes(
                wanted
              )
          }
        )
    }

    const properties =
      rawListings.map(
        normaliseListing
      )

    const result = {
      area:
        area
          ? {
              id:
                area.id,

              name:
                area.name
            }
          : null,

      properties,

      totalFound:
        response.data.count ||
        properties.length,

      expiresAt:
        Date.now() +
        CACHE_TIME,

      demoMode:
        false
    }

    searchCache.set(
      cacheKey,
      result
    )

    return res.json({
      success: true,

      cached: false,

      demoMode: false,

      area:
        result.area,

      count:
        properties.length,

      totalFound:
        result.totalFound,

      properties
    })

  } catch (error) {

    // ======================================
    // HOMEDATA FAILED -> DEMO MODE
    // ======================================

    console.error(
      'Homedata unavailable, using demo mode:',
      error.response?.data ||
      error.message
    )

    const demoProperties =
      filterDemoProperties(
        filters
      )

    const demoArea =
      filters.location
        ? {
            id: 'demo',
            name:
              filters.location
          }
        : null

    const fallbackResult = {
      area:
        demoArea,

      properties:
        demoProperties,

      totalFound:
        demoProperties.length,

      expiresAt:
        Date.now() +
        CACHE_TIME,

      demoMode:
        true
    }

    searchCache.set(
      cacheKey,
      fallbackResult
    )

    return res.json({
      success: true,

      cached: false,

      demoMode: true,

      message:
        'Live listing data is temporarily unavailable. Showing demo property data.',

      area:
        demoArea,

      count:
        demoProperties.length,

      totalFound:
        demoProperties.length,

      properties:
        demoProperties
    })
  }
})

// ==========================================
// CACHE STATUS
// ==========================================

router.get(
  '/cache/status',
  (req, res) => {

    const searches = []

    for (
      const [key, value]
      of searchCache.entries()
    ) {

      if (
        value.expiresAt >
        Date.now()
      ) {

        searches.push({
          search:
            JSON.parse(key),

          listingCount:
            value.properties.length,

          area:
            value.area,

          demoMode:
            value.demoMode ||
            false,

          expiresAt:
            new Date(
              value.expiresAt
            ).toISOString()
        })
      }
    }

    res.json({
      success: true,

      activeCaches:
        searches.length,

      searches
    })
  }
)

module.exports = router
