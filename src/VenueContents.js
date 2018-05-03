import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './App.css'


class VenueContents extends Component {

    static propTypes = {
        name: PropTypes.string,
        photo: PropTypes.string,
        venueId: PropTypes.string,
        details: PropTypes.object.isRequired
    }

    render() {
        const { name, photo, venueId } = this.props
        return (
            <div>
                <img className='venue-photo' alt='place zero' src={photo} />
                <h1 className='venue-name'>{name}</h1>
                <div className='venue-info-wrapper'>
                    <p className='venue-description'>Some info here...</p>
                </div>
            </div>
        )
    }
}

export default VenueContents