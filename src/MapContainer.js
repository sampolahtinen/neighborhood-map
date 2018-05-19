import React, { Component } from 'react'
import {Map, Marker, GoogleApiWrapper} from 'google-maps-react'
import PropTypes from 'prop-types'
import './App.css'
import VenueContents from "./VenueContents"
import SearchField from './SearchField'
import VenueList from './VenueList'

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
        filterQuery: '', //'café', //Instead of displaying empty map, café will be used as first query
        VenueIdFromList: '',
        mapHeight: '100%',
        mapWidth: '100%', //change back to 100% after passing
        errorOccurred: false,
        errorMessage: {},
        fourSquareError: false,
        map: {}
    }

    componentDidMount = () => {
        console.log("Map container loaded")
        window.addEventListener('keydown', (event)=>{
            if(event.keyCode === 8) {
                console.log("backspace was pressed")
                this.setState({showingInfoWindow: false})
            }
        })
        this.isMobile() ? this.reSizeMap('100%', '60%') : this.reSizeMap('100%', '100%')
    }

    componentDidCatch(error, info) {
        this.setState({ errorOccurred: true, errorMessage: error });
        console.log(error);
    }

    //checks if viewport is in the mobile range and return true
    isMobile = () => {
        if(window.innerWidth <= mobileBoundary) return true;
    }
    //Resizes the map based on given values
    reSizeMap = (width, height) => {
        this.setState({mapWidth: width || '100%', mapHeight: height || '100%'})
    }
    onMapLoad = () => {
        this.isMobile() ? this.reSizeMap('100%','100%') : this.reSizeMap('100%','100%')
    }

    onMarkerClick = (props, marker, e) => {
        if( this.isMobile() ) {
            this.reSizeMap('100%','40%')
        } else {
            this.reSizeMap('75%','100%')
        }
        console.log(props)
        console.log(this.props)
        let bounds = new props.google.maps.LatLngBounds(marker.position);
        props.map.panTo(marker.position)

        //on marker click filters requested places to only show the corresponding marker
        const match = new RegExp(marker.name,'i')
        let filteredPlaces = this.state.places.filter(place => match.test(place.venue.name))
        
        console.log(marker)
        this.setState({
            showingInfoWindow: true,
            activeMarker: marker,
            selectedPlace: props,
            places: filteredPlaces
        })        
    }

    onMapClicked = (props) => {
        if (this.state.showingInfoWindow) {
            this.setState({
                showingInfoWindow: false,
                activeMarker: null,
                selectedPlace: null,
                markerIcon: ''
            })
        }
        if(this.isMobile()) {
            this.reSizeMap('100%','60%')
            if(this.state.filterQuery.length === 0) this.reSizeMap('100%','100%')
        } else {
            if(this.state.filterQuery.length !== 0) this.reSizeMap('75%','100%')
            this.reSizeMap('100%','100%')
        }

        this.fetchFourSquarePlaces()
    }
    
    fetchFourSquarePlaces = () => {
        const clientId = "GWE2ERPO4BDMDPVYSZJIQMS5FPHJ4VNKS0R5XIBDWSPWSOM0"
        const clientSecret = "EVSK2NXVQ0MQ3BRGURR1F3GB0IKRD4MCGED11PH0C1BOK42V"
        const version = 20180502
        let query =  this.state.filterQuery
        let lat = this.state.center.lat || 55.677271
        let lng = this.state.center.lng || 12.57383
        if(this.state.filterQuery.length === 0 ) {
            this.setState({places: []})
            return;
        }
        fetch(`https://api.foursquare.com/v2/venues/explore?ll=${lat},${lng}&radius=1000&venuePhotos=1&query="${query}"&client_id=${clientId}&client_secret=${clientSecret}&v=${version}`)
            .then( (response) => {
                return response.json()
            })
            .then((json) =>{
                this.setState({
                    places: json.response.groups["0"].items,
                    originalPlaces: json.response.groups["0"].items
                })
            })
            .catch(error => {
                this.setState({ errorOccurred: true, fourSquareError: true, errorMessage: error })
            })
        }

    // This function is passed as a prop to SearchField. When user types the typed text
    // will be passed to fetchFourSquarePlaces to search for new places
    filterPlaces = (query) => {
        if( this.isMobile() ) {
            this.reSizeMap('100%','60%')
        } else {
            this.reSizeMap('75%','100%')
        }
        this.setState({ filterQuery: query, showingInfoWindow: false})

        if(query.length === 0) {
            this.setState({places: []})
        } else {
            this.fetchFourSquarePlaces()
        }
        
        //if query length is 0 resizes the map and hides the venuelist
        if(query.length === 0) {
            if( this.isMobile() ) {
                this.reSizeMap('100%','100%')
            }
            this.reSizeMap('100%','100%')
            }   
        }

    // This func is passed as a prop to VenueList component and assigned to each list item.
    // Once a venue list item is clicked, it takes the list item name and finds the corresponding name from this.state.places
    // and returns the index of that place. That index is used to find venueId. That venueId is stored to this.state.VenueIdFromList.
    // When rendering VenueContents component, there is a conditional check that checks if this.state.VenueIdFromList is avaialable.
    // If yes, that id is passed as a prop to VenueContents. If not, selected marker is passed as a prop to VenueContents.
    getVenueIdFromList = (event) => {
        if(this.isMobile()) this.reSizeMap('100%','40%')
    
        let listItem = event.target.innerHTML.replace('&amp;','&')
        let arrayIndex = this.state.places.findIndex((place)=>{
            return place.venue.name === listItem
        })

        let venueId = this.state.places[arrayIndex].venue.id

        //Filter places so that only one Marker is rendered on the map when venuelist item is clicked
        let match = new RegExp(venueId,'i')
        let filteredPlaces = this.state.places.filter(place => match.test(place.venue.id))

        this.setState({
            VenueIdFromList: venueId,
            showingInfoWindow: true, 
            places: filteredPlaces,
            markerIcon: this.createMarkerIcon(this.props.google),
            center: { lat: this.state.places[arrayIndex].venue.location.lat, lng: this.state.places[arrayIndex].venue.location.lng }
        })
        return venueId;
    }

    centerMoved = (mapProps, map) => {
        if(!this.state.showingInfoWindow) {
            let newCenter = map.getCenter()
            map.setCenter(newCenter)
            this.setState({center: {lat: newCenter.lat(), lng: newCenter.lng()}})
            this.fetchFourSquarePlaces()
            console.log("Map moved. New center is: " + newCenter)
        }
    }

    render() {
        //store selected props to a variable and use spread to pass it to VenueContents component.
        let props = {} 
        let mapContainerStyles = {
            width: this.state.mapWidth
        }

        if(this.state.selectedPlace) {
            // If a marker was clicked, pass the corresponding venueId of the marker as a prop to VenueContents
            props.venueId = this.state.selectedPlace.venueId  
        } else {
            // Else it must be the VenueList what was clicked. Thus, pass the VenueIdFromList as a prop to VenueContents
            props.venueId = this.state.VenueIdFromList
        }

        if(this.state.errorOccurred) {
               return (
                   <div className='error-container'>
                       <h2>{this.state.fourSquareError ? 'FourSquare API' : 'Google Maps API'} couldn't be loaded :(</h2>
                       <p>Reason: {this.state.errorMessage.message}</p>
                   </div>
               ) 
        }

        return (
        <div className='main-content'>
            <div className="map-container" role='application' aria-label='Google Maps' style={mapContainerStyles}>
                <Map 
                    onReady={this.onMapLoad}
                    google={this.props.google}
                    style={{width: '100%', height: this.state.mapHeight, position: 'relative'}}
                    styles={this.props.styles}
                    initialCenter={{
                        lat: 55.677271,
                        lng:  12.573833
                    }}
                    center={this.state.center}
                    zoom={15}
                    onDragend={this.centerMoved}
                    onClick={this.onMapClicked}>
                        {this.state.places.map((place) =>
                            <Marker
                                onClick={this.onMarkerClick}
                                key={place.venue.id}
                                venueId={place.venue.id}
                                name={place.venue.name}
                                position={{ lat: place.venue.location.lat, lng: place.venue.location.lng}}
                                icon={this.state.markerIcon} />
                        )
                    }
                </Map>
            </div>
                <SearchField
                    clickHandler={this.onMarkerClick}
                    filterPlaces={this.filterPlaces}/>
                    {/*Add this below after the project has been appproved by udacity.. this.state.filterQuery.length > 0 &&*/}
                    { this.state.filterQuery.length > 0 && !this.state.showingInfoWindow &&
                        <VenueList
                            places={this.state.places} 
                            clickHandler={this.getVenueIdFromList}/> 
                    }
                    
                    {this.state.showingInfoWindow &&
                        <VenueContents
                            {...props} // props contains either venueId from clicked marker or clicked venueList item
                        />
                    }
        </div>
    );
    }
}

export default GoogleApiWrapper({
    apiKey: "AIzaSyDlJUajSz51W9QvRPzD3wXUcWCmIauTZ1c"
})(MapContainer)
