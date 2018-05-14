import React, { Component } from 'react'
import {Map, Marker, GoogleApiWrapper} from 'google-maps-react'
import PropTypes from 'prop-types'
import './App.css'
import VenueContents from "./VenueContents";
import SearchField from './SearchField';
import VenueList from './VenueList';

const mobileBoundary = 600;

export class MapContainer extends Component {

    static propTypes ={
        styles: PropTypes.array
    }

    state = {
        center: {},
        showingInfoWindow: false,
        activeMarker: {},
        selectedPlace: null,
        places: [],
        venueDetails: {},
        filterQuery: '',
        VenueIdFromList: '',
        mapHeight: '100%',
        initialQuery: 'cafe'
    }

    componentDidMount = () => {
        console.log("Map container loaded")
        if (!navigator.onLine) {
            this.setState({places: JSON.parse.localStorage.getItem('places')})
        }
    }
    
    checkIfMobile = () => {
        if(window.innerWidth <= mobileBoundary) {
            this.setState({mapHeight: '40%'})
            
        }
    }

    onMarkerClick = (props, marker, e, mapProps,map) => {
        this.checkIfMobile()
        window.google.maps.event.trigger(this.props.map, 'resize')
        this.setState({
            showingInfoWindow: true,
            activeMarker: marker,
            selectedPlace: props
            //center: {lat: props.position.lat, lng: props.position.lng }
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
        if(window.innerWidth <= mobileBoundary) {
            this.setState({mapHeight: '100%'})
        }
    }
    
    fetchFourSquarePlaces = (lat,lng) => {
        const clientId = "GWE2ERPO4BDMDPVYSZJIQMS5FPHJ4VNKS0R5XIBDWSPWSOM0"
        const clientSecret = "EVSK2NXVQ0MQ3BRGURR1F3GB0IKRD4MCGED11PH0C1BOK42V"
        const version = 20180502
        let query
        if(!this.state.filterQuery) {
            query = this.state.initialQuery
        } else {
            query = this.state.filterQuery
        }

       if(!this.state.filterQuery) return //makes sure nothing loads at first when map is loaded

        fetch(`https://api.foursquare.com/v2/venues/explore?ll=${lat || 55.677271},${lng || 12.573833}&radius=1000&venuePhotos=1&query="${this.state.filterQuery}"&client_id=${clientId}&client_secret=${clientSecret}&v=${version}`)
            .then( (response) => {
                return response.json()
            }).then((json) =>{
                this.setState({
                    places: json.response.groups["0"].items
                })
                localStorage.setItem('places',JSON.stringify(json.response.groups["0"].items))
            })
        }

    filterPlaces = (query) => {
        console.log("Current query: " + query)
        this.setState({filterQuery: query, showingInfoWindow: false})
        this.fetchFourSquarePlaces()
    }

    getVenueIdFromList = (event) => {
        console.log(event.target.innerHTML)
        let listItem = event.target.innerHTML.replace('&amp;','&')
        let arrayIndex = this.state.places.findIndex((place)=>{
            return place.venue.name === listItem
        })
        let venueId = this.state.places[arrayIndex].venue.id;
        this.setState({VenueIdFromList: venueId, showingInfoWindow: true})

        this.checkIfMobile()

        return venueId;
    }

    centerMoved = (mapProps, map) => {
        if(!this.state.showingInfoWindow) {
            let newCenter = map.getCenter()
            map.setCenter(newCenter)
            this.setState({center: newCenter})
            this.fetchFourSquarePlaces(newCenter.lat(), newCenter.lng())
        }
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
            <div className="map-container" role='application' aria-label='Google Maps'>
                <Map 
                    onReady={this.fetchFourSquarePlaces}
                    google={this.props.google}
                    style={{width: '100%', height: this.state.mapHeight, position: 'relative'}}
                    styles={this.props.styles}
                    initialCenter={{
                        lat: 55.677271,
                        lng:  12.573833
                    }}
                    center={this.state.center}
                    zoom={16}
                    onDragend={this.centerMoved}
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

                    {this.state.filterQuery.length > 0 && !this.state.showingInfoWindow && 
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
