import React, { Component } from 'react'
import {Map, InfoWindow, Marker, GoogleApiWrapper} from 'google-maps-react'
import PropTypes from 'prop-types'
import './App.css'
import VenueContents from "./VenueContents";
import SearchField from './SearchField';


export class MapContainer extends Component {

    static propTypes ={
        styles: PropTypes.array
    }

    state = {
        showingInfoWindow: false,
        activeMarker: {},
        selectedPlace: {},
        places: [],
        venueDetails: {},
        photo: '',
        filterQuery: 'bar'
    }
    
    onMarkerClick = (props, marker, e) => {
        const photoUrl = this.fetchPhoto(props.venueId)
        //const venueDetails = this.fetchDetails(props.venueId)
        this.setState({
            showingInfoWindow: true,
            activeMarker: marker,
            selectedPlace: props,
        })
    }

    onMapClicked = (props) => {
        if (this.state.showingInfoWindow) {
            this.setState({
                showingInfoWindow: false,
                activeMarker: null
            })
        }
    }

    fetchFourSquarePlaces = () => {
        const clientId = "GWE2ERPO4BDMDPVYSZJIQMS5FPHJ4VNKS0R5XIBDWSPWSOM0"
        const clientSecret = "EVSK2NXVQ0MQ3BRGURR1F3GB0IKRD4MCGED11PH0C1BOK42V"
        const version = 20180502
        const lat = 55.677271
        const len = 12.573833

       if(!this.state.filterQuery) return

        fetch(`https://api.foursquare.com/v2/venues/explore?ll=${lat},${len}&radius=1000&venuePhotos=1&query="${this.state.filterQuery}"&client_id=${clientId}&client_secret=${clientSecret}&v=${version}`)
            .then( (response) => {
                return response.json()
            }).then((json) =>{
                console.log(json)
                console.log("Query printing from fetc: " + this.state.filterQuery)
                this.setState({
                    places: json.response.groups["0"].items
                })
            })
        }

    fetchPhoto = (venueId) => {
        const clientId = "GWE2ERPO4BDMDPVYSZJIQMS5FPHJ4VNKS0R5XIBDWSPWSOM0"
        const clientSecret = "EVSK2NXVQ0MQ3BRGURR1F3GB0IKRD4MCGED11PH0C1BOK42V"
        const version = 20180502
        const url = `https://api.foursquare.com/v2/venues/${venueId}/photos?&client_id=${clientId}&client_secret=${clientSecret}&v=${version}`

        fetch(url)
            .then(response => response.json())
                .then( (json) => {
                    const size = '150x150'
                    let imageUrl = json.response.photos.items["0"].prefix + size + json.response.photos.items["0"].suffix
                    this.setState({photo: imageUrl})
                })
    }

    filterPlaces = (query) => {
       /* console.log("Query is " +  query)
        let match = new RegExp(query,'i')
        let filteredPlaces = this.state.places.filter( place => match.test(place.venue.name))
        this.setState({places: filteredPlaces})
        console.log(filteredPlaces)*/
        console.log("Current query: " + query)
        this.setState({filterQuery: query})
        this.fetchFourSquarePlaces()
    }

    render() {
        return (
            
        <div className='main-content'>
            <div className="map-container">
                <Map 
                    onReady={this.fetchFourSquarePlaces}
                    google={this.props.google}
                    style={{width: '100%', height: '100%', position: 'relative'}}
                    styles={this.props.styles}
                    initialCenter={{
                        lat: 55.677271,
                        lng:  12.573833
                    }}
                    zoom={16}
                    onClick={this.onMapClicked}>
                        {this.state.places.map((place) =>
                            <Marker
                                onClick={this.onMarkerClick}
                                key={place.venue.id}
                                venueId={place.venue.id}
                                name={place.venue.name}
                                position={{ lat: place.venue.location.lat, lng: place.venue.location.lng}} />
                        )
                    }
                    {this.state.showingInfoWindow && this.state.venueDetails && 
                        <VenueContents
                            name={this.state.selectedPlace.name}
                            photo={this.state.photo}
                            venueId={this.state.selectedPlace.venueId}
                        />
                    } 
                </Map>
            </div>
                <SearchField
                    places={this.state.places}
                    filterPlaces={this.filterPlaces}/>
            
        </div>
    );
    }
}

export default GoogleApiWrapper({
    apiKey: "AIzaSyDlJUajSz51W9QvRPzD3wXUcWCmIauTZ1c"
})(MapContainer)
