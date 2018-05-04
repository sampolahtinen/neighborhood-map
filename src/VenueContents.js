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

    state = {
        venueDetails: {}
    }

    componentDidMount = () => {
        this.fetchDetails(this.props.venueId)
    }

    fetchDetails = (venueId) => {
        console.log("I am fetchDetails")
        const clientId = "GWE2ERPO4BDMDPVYSZJIQMS5FPHJ4VNKS0R5XIBDWSPWSOM0"
        const clientSecret = "EVSK2NXVQ0MQ3BRGURR1F3GB0IKRD4MCGED11PH0C1BOK42V"
        const version = 20180502
        const url = `https://api.foursquare.com/v2/venues/${venueId}?&client_id=${clientId}&client_secret=${clientSecret}&v=${version}`

        fetch(url)
            .then(response => response.json())
            .then((json) => {
                this.setState({ venueDetails: json.response })
                console.log("Fetched venue details: " + this.state.venueDetails.venue.rating) //this proves that the details work.
            })
    }

    render() {
        const { name, photo, venueId } = this.props
        const { venueDetails } = this.state
        //console.log("Fetched venue details: " + this.state.venueDetails.venue.rating)

        return (
            <div className="venue-contents">
                <img className='venue-photo' alt='place zero' src={photo} />
                <h2 className='venue-name'>{name}</h2>
                <h3 className='venue-rating'>Rating:</h3>
                <div className='venue-info-wrapper'>
                    <span className='venue-address'>Address</span>
                    <span className='venue-open-status'>Open: yes/not</span>
                </div>
                <p className='venue-description'>Some info here...</p>
                
                <ol className='venue-tips'>
                    <li>Tip...</li>
                </ol>
            </div>
        )
    }
}

export default VenueContents