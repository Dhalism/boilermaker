const router = require('express').Router()
const strava = require('strava-v3')
const rp = require('request-promise')

function toRadians(degrees) {
  return degrees * Math.PI / 180
}

// Converts from radians to degrees.
function toDegrees(radians) {
  return radians * 180 / Math.PI
}

function bearing(startLat, startLng, destLat, destLng) {
  startLat = toRadians(startLat)
  startLng = toRadians(startLng)
  destLat = toRadians(destLat)
  destLng = toRadians(destLng)

  y = Math.sin(destLng - startLng) * Math.cos(destLat)
  x =
    Math.cos(startLat) * Math.sin(destLat) -
    Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng)
  brng = Math.atan2(y, x)
  brng = Math.abs(toDegrees(brng))
  console.log(brng)
  return compassDirection((brng + 360) % 360)
}
function compassDirection(degrees) {
  switch (true) {
    case degrees >= 315:
      return 'NW'
    case degrees >= 270:
      return 'W'
    case degrees >= 225:
      return 'SW'
    case degrees >= 180:
      return 'S'
    case degrees >= 135:
      return 'SE'
    case degrees >= 90:
      return 'E'
    case degrees >= 45:
      return 'NE'
    default:
      return 'N'
  }
}

router.get('/segment', async (req, res, next) => {
  try {
    const segment = await strava.segments.get({
      id: 1567704,
      access_token: 'be0a46f7e95759d6096720eb72395063a8aef5e7'
    })
    const {
      start_latitude,
      start_longitude,
      end_latitude,
      end_longitude
    } = segment
    const optionsGrid = {
      headers: {
        'User-Agent': 'FullStack',
        accept: 'application/ld+json'
      },
      uri: `https://api.weather.gov/points/${end_latitude.toFixed(
        4
      )},${end_longitude.toFixed(4)}/`
    }
    const grid = await rp(optionsGrid)
    const optionsWeather = {
      headers: {
        'User-Agent': 'FullStack',
        accept: 'application/ld+json'
      },
      uri: JSON.parse(grid).forecast
    }
    const weather = await rp(optionsWeather)

    const direction = bearing(
      start_latitude,
      start_longitude,
      end_latitude,
      end_longitude
    )
    res.json(JSON.parse(weather).periods[1].windDirection)
  } catch (error) {
    next(error)
  }
})

module.exports = router
