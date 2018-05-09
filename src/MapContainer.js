import React, { Component } from 'react'
import {Map, Marker, GoogleApiWrapper} from 'google-maps-react'
import PropTypes from 'prop-types'
import './App.css'
import VenueContents from "./VenueContents";
import SearchField from './SearchField';
import VenueList from './VenueList';


export class MapContainer extends Component {

    static propTypes ={
        styles: PropTypes.array
    }

    state = {
        showingInfoWindow: false,
        activeMarker: {},
        selectedPlace: null,
        places: [],
        venueDetails: {},
        filterQuery: '',
        VenueIdFromList: ''
    }
    
    onMarkerClick = (props, marker, e) => {
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
                activeMarker: null,
                selectedPlace: null
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
                //console.log("Query printing from fetc: " + this.state.filterQuery)
                this.setState({
                    places: json.response.groups["0"].items
                })
            })
        }

    filterPlaces = (query) => {
       /* console.log("Query is " +  query)
        let match = new RegExp(query,'i')
        let filteredPlaces = this.state.places.filter( place => match.test(place.venue.name))
        this.setState({places: filteredPlaces})
        console.log(filteredPlaces)*/
        console.log("Current query: " + query)
        this.setState({filterQuery: query, showingInfoWindow: false})
        this.fetchFourSquarePlaces()
    }

    getVenueIdFromList = (event) => {
        console.log(event.target.innerHTML)
        let listItem = event.target.innerHTML.replace('&amp;','&')
        console.log('Trimmed list ime string ' + listItem)
        let arrayIndex = this.state.places.findIndex((place)=>{
            return place.venue.name === listItem
        })
        let venueId = this.state.places[arrayIndex].venue.id;
        this.setState({VenueIdFromList: venueId, showingInfoWindow: true})
        console.log('Found array index: ' + arrayIndex)
        console.log('Fetched venueId is ' + venueId)
        console.log('State VenueIdFromList: ' + this.state.VenueIdFromList)
        return venueId;
    }

    render() {
        let props = {} //store selected props to a variable and use spread to pass it to VenueContents component
        if(this.state.selectedPlace) {
            props.venueId = this.state.selectedPlace.venueId  
        } else {
            props.venueId = this.state.VenueIdFromList
        }
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
        
                </Map>
            </div>
                <SearchField
                    clickHandler={this.onMarkerClick}
                    filterPlaces={this.filterPlaces}/>

                    {this.state.filterQuery.length > 0 &&
                        <VenueList
                            places={this.state.places} 
                            clickHandler={this.getVenueIdFromList}/> 
                    }
                    
                    {this.state.showingInfoWindow &&
                        <VenueContents
                            {...props}
                        />
                    }
        </div>
    );
    }
}

export default GoogleApiWrapper({
    apiKey: "AIzaSyDlJUajSz51W9QvRPzD3wXUcWCmIauTZ1c"
})(MapContainer)
