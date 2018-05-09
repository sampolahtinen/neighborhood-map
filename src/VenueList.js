import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './App.css'

class VenueList extends Component {

    static proptTypes = {
        places: PropTypes.array,
        clickHandler: PropTypes.function
    }

    render() {
        return (
                <div className='venue-list'>
                    {this.props.places.length === 0 &&
                        <ol className='empty-search'>
                            <li className='type-something'>You haven't search for anything :(</li>
                        </ol>
                    }
                    <ol>
                        {this.props.places.map((place) =>
                            <li className='venue-list-item' key={place.venue.id} onClick={this.props.clickHandler}>{place.venue.name}</li>
                        )}
                    </ol>
                </div>
        )
    }
}

export default VenueList