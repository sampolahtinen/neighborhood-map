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
        mapWidth: '100%',
        map: {}
    }

    componentDidMount = () => {
        console.log("Map container loaded")
        if (!navigator.onLine) {
            this.setState({places: JSON.parse.localStorage.getItem('places')})
        }
        window.addEventListener('keydown', (event)=>{
            if(event.keyCode === 8) {
                console.log("backspace was pressed")
                this.setState({showingInfoWindow: false})
            }
        })
    }
    
    checkIfMobile = (height) => {
        if(window.innerWidth <= mobileBoundary) {
            this.setState({mapHeight: height || '40%'})
        }
        
    }

    onMarkerClick = (props, marker, e) => {
        this.checkIfMobile()
        const match = new RegExp(marker.name,'i')
        let filteredPlaces = this.state.places.filter(place => match.test(place.venue.name))
        this.setState({
            showingInfoWindow: true,
            mapWidth: '75%',
            activeMarker: marker,
            selectedPlace: props,
            places: filteredPlaces,
            center: marker.position
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
        if (window.innerWidth <= mobileBoundary) {
            this.setState({ mapHeight: '60%' })
        }
        //
        this.fetchFourSquarePlaces()
    }
    
    fetchFourSquarePlaces = () => {
        const clientId = "GWE2ERPO4BDMDPVYSZJIQMS5FPHJ4VNKS0R5XIBDWSPWSOM0"
        const clientSecret = "EVSK2NXVQ0MQ3BRGURR1F3GB0IKRD4MCGED11PH0C1BOK42V"
        const version = 20180502
        let lat = this.state.center.lat ? this.state.center.lat() : 55.677271
        let lng = this.state.center.lng ? this.state.center.lng() : 12.57383

        if(!this.state.filterQuery) return //makes sure nothing loads at first when map is loaded

        fetch(`https://api.foursquare.com/v2/venues/explore?ll=${lat},${lng}&radius=1000&venuePhotos=1&query="${this.state.filterQuery}"&client_id=${clientId}&client_secret=${clientSecret}&v=${version}`)
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
            this.setState({ filterQuery: query, showingInfoWindow: false, mapHeight: '100%', mapWidth: '75%'})
            this.fetchFourSquarePlaces()
            if(query.length === 0) {
                this.checkIfMobile('100%')
                this.setState({mapWidth: '100%'})
            } else {
                this.checkIfMobile('60%')
            }
    }

    getVenueIdFromList = (event) => {
        console.log(event.target.innerHTML)
        let listItem = event.target.innerHTML.replace('&amp;','&')
        let arrayIndex = this.state.places.findIndex((place)=>{
            return place.venue.name === listItem
        })
        let venueId = this.state.places[arrayIndex].venue.id
        console.log(this.state.places[arrayIndex].venue.position)
        let match = new RegExp(venueId,'i')
        let filteredPlaces = this.state.places.filter(place => match.test(place.venue.id))

        this.setState({
            VenueIdFromList: venueId,
            showingInfoWindow: true, 
            places: filteredPlaces, 
            center: { lat: this.state.places[arrayIndex].venue.location.lat, lng: this.state.places[arrayIndex].venue.location.lng }})
        this.checkIfMobile()
        return venueId;
    }

    centerMoved = (mapProps, map) => {
        if(!this.state.showingInfoWindow) {
            let newCenter = map.getCenter()
            map.setCenter(newCenter)
            this.setState({center: newCenter})
            this.fetchFourSquarePlaces()
            console.log("Map moved. New center is: " + newCenter)
        }
        
    }

    render() {
        let props = {} //store selected props to a variable and use spread to pass it to VenueContents component
        let mapContainerStyles = {
            width: this.state.mapWidth
        }
        if(this.state.selectedPlace) {
            props.venueId = this.state.selectedPlace.venueId  
        } else {
            props.venueId = this.state.VenueIdFromList
        }
        return (
            
        <div className='main-content'>
            <div className="map-container" role='application' aria-label='Google Maps' style={mapContainerStyles}>
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
