import React from 'react'
import { Map, Marker, Popup, TileLayer, Polyline } from 'react-leaflet'


class MyMap extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      center: {"lat": 40.7128, "lng": -74.0060},
      zoom: 13,
      polyLine: []
    }
  }

  render () {
   
    let position = [this.state.center.lat, this.state.center.lng]
    if(this.props.polyline) {
        let idx = this.props.polyline.length/2
        position = [this.props.polyline[idx].lat, this.props.polyline[idx].lng]
        
    }
   console.log(this.props.zoom)
    return (
        <Map center={position} zoom={this.props.zoom || this.state.zoom} dragging={false} boxZoom={false} touchZoom={false} scrollWheelZoom={false} doubleClickZoom = {false}>
            <TileLayer
            url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
        {this.props.polyline && this.props.polyline.length>0? 
            (
                
            <Polyline color={'red'} 
            positions={this.props.polyline}/>
            )
          :(<div></div>)
          }
          <Marker position={position}>
            <Popup>
              <span>A pretty CSS3 popup.<br/>Easily customizable.</span>
            </Popup>
          </Marker>
        </Map>
      )
  }
}

export default MyMap