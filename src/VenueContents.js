import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './App.css'


class VenueContents extends Component {

    static propTypes = {
        name: PropTypes.string,
        photo: PropTypes.string,
        venueId: PropTypes.string,
    }

    state = {
        venueDetails: {},
        loading: true
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
                console.log(this.state.venueDetails)
            }).then(()=> this.setState({loading: false}))
    }

    componentDidMount = () => {
        this.fetchDetails(this.props.venueId)
    }

    componentWillReceiveProps = (prevProps) => {
        if(prevProps !== this.props) {
            this.fetchDetails(this.props.venueId)
        }
    }
    
    render() {
        const { name, photo, venueId } = this.props
        const { venueDetails } = this.state
        
        return (
                <div>
                    {!this.state.loading &&
                        <div className="venue-contents">
                                <img className='venue-photo' alt='place zero' src={photo} />
                                <h2 className='venue-name'>{name}</h2>
                                <h3 className='venue-rating'>Rating: {venueDetails.venue.rating} </h3>
                                <div className='venue-info-wrapper'>
                                    <span className='venue-address'>{venueDetails.venue.location.address}</span>
                                    <span className='venue-open-status'>{venueDetails.venue.hours.isOpen ? 'Open' :'Closed'}</span>
                                </div>
                                <p className='venue-description'>{venueDetails.venue.description || "No description available."}</p>
                                
                                <ol className='venue-tips'>
                                    <li>"{venueDetails.venue.tips.groups[0].items[0].text}" - {venueDetails.venue.tips.groups[0].items[0].user.firstName} {venueDetails.venue.tips.groups[0].items[0].user.lastName}</li>
                                </ol>
                        </div>
                    } 
                </div>               
        )
    }
}

export default VenueContents