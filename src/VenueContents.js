import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './App.css'


class VenueContents extends Component {

    static propTypes = {
        name: PropTypes.string,
        photo: PropTypes.string,
        venueId: PropTypes.string,
        //details: PropTypes.object.isRequired
    }

    render() {
        const { name, photo, venueId, details } = this.props
        return (
            <div className="venue-contents">
                <img className='venue-photo' alt='place zero' src={photo} />
                <h2 className='venue-name'>{name}</h2>
                <h3 className='venue-rating'>Rating:</h3>
                <div className='venue-info-wrapper'>
                    <p className='venue-description'>Some info here...</p>
                    <span className='venue-address'>Address</span>
                    <span className='venue-open-status'>Open: yes/not</span>
                </div>
                <ol className='venue-tips'>
                    <li>Tip...</li>
                </ol>
            </div>
        )
    }
}

export default VenueContents