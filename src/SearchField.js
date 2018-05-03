import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './App.css'

class SearchField extends Component {
    render() {
        return(
            <div className='search-field'>
                <input 
                    className='input-field' 
                    type='text' 
                    placeholder="Filter Venues.."
                    onChange={ event => this.props.filterPlaces(event.target.value)}/>
                <div className='venue-list'>
                    <ol>
                        {this.props.places.map( (place) => 
                            <li className='venue-list-item' key={place.venue.id}>{place.venue.name}</li>
                        )}
                    </ol>
                </div>
            </div>
        )
    }
}

export default SearchField