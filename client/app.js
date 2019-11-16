import React, {Component} from 'react';
import axios from 'axios'
import MyMap from './map.js'
const strava = require('strava-v3')
const rp = require('request-promise')
const decodePolyline = require('decode-google-map-polyline');
require('../secrets')


class App extends Component {
  constructor(){
    super()
    this.state = {
      segmentDirection: '',
      windDirection: '',
      zoom: ''
      
    }
    this.toRadians = toRadians.bind(this)
    this.toDegrees = toDegrees.bind(this)
    this.bearing = bearing.bind(this)
    this.compassDirection = compassDirection.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.calculateZoom = calculateZoom.bind(this)
  
  }

async handleSubmit(e){
  e.preventDefault()

  const segment = await strava.segments.get({
    id: e.target.segmentId.value,
    access_token: 'd30028e96f751c3bcba1e9175a52fdc23cdcd8f5'
  })
  const {
    start_latitude,
    start_longitude,
    end_latitude,
    end_longitude,
    distance
  } = segment
  const polyline = decodePolyline(segment.map.polyline)
  
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
    uri: JSON.parse(grid).forecastHourly
  }
  const weather = await rp(optionsWeather)

  const direction = bearing(
    start_latitude,
    start_longitude,
    end_latitude,
    end_longitude
  )
  const zoomOut = this.calculateZoom(distance)
  const windDir = JSON.parse(weather).periods[1].windDirection
  this.setState({segmentDirection:direction, windDirection: windDir, polyLine: polyline, zoom: zoomOut})
 
}
render(){
  return (
    <div className="App">
        <a href="http://www.strava.com/oauth/authorize?client_id=40777&response_type=code&redirect_uri=http://localhost/exchange_token&approval_prompt=force&scope=read_all">Connect with strava</a>
        
        <form onSubmit = {this.handleSubmit}>
          <input type="text" name="segmentId"/>
          <input type="submit" value="submit"/>
        </form>
        <div>
          Segment Direction: {this.state.segmentDirection}
          Wind Direction: {this.state.windDirection}
        </div>
        {/* <div id="mapid">
        <SimpleExample/></div> */}
        <MyMap polyline = {this.state.polyLine} zoom = {this.state.zoom}/>
    </div>
  );
  }
}

export default App;
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

  let y = Math.sin(destLng - startLng) * Math.cos(destLat)
  let x =
    Math.cos(startLat) * Math.sin(destLat) -
    Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng)
  let brng = Math.atan2(y, x)
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

function calculateZoom(meters){
  //let ratio = miles*1609.34/500
  let count = 0;
  let wholeworld = 156000
  while(wholeworld>(meters/400)){
    wholeworld/=2
    count++
  }
  return count-1
}