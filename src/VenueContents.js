import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './App.css'


class VenueContents extends Component {

    static propTypes = {
        venueId: PropTypes.string.isRequired,
    }

    state = {
        venueDetails: {},
        loading: true,
        errorOccurred: false,
        errorMessage: {}
    }

    fetchDetails = (venueId) => {
        const clientId = "GWE2ERPO4BDMDPVYSZJIQMS5FPHJ4VNKS0R5XIBDWSPWSOM0"
        const clientSecret = "EVSK2NXVQ0MQ3BRGURR1F3GB0IKRD4MCGED11PH0C1BOK42V"
        const version = 20180502
        const url = `https://api.foursquare.com/v2/venues/${venueId}?&client_id=${clientId}&client_secret=${clientSecret}&v=${version}`

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    this.setState({ errorOccurred: true })
                }
                return response.json()
            })
            .then((json) => {
                this.setState({ venueDetails: json.response })
                console.log(this.state.venueDetails)
            })
            .then(()=> this.setState({loading: false}))
            .catch(error => console.log(error))
    }

    componentDidCatch(error) {
        // Display fallback UI
        this.setState({ errorOccurred: true, errorMessage: error });
        // You can also log the error to an error reporting service
        console.log(error);
    }

    componentDidMount = () => {
        console.log('Received venueId in VenueContents: ' + this.props.venueId)
        this.fetchDetails(this.props.venueId)
    }

    componentWillReceiveProps = (prevProps) => {
        if(prevProps !== this.props) {
            this.fetchDetails(this.props.venueId)
        }
    }
    
    isOpen = () => {
        let color
        this.state.venueDetails.venue.hours.isOpen ?  color = '#30b54f' : color = 'red'
        return color
    }

    render() {
        const { venueDetails } = this.state

        if(this.state.errorOccurred) {
            return (
                    <div className='error-container'>
                        <h2>There was an error in fetching details from Frousquare :(</h2>
                    </div>
            )
        }

        return (
                <div aria-label='venue-details'>
                    {!this.state.loading &&
                        <div className="venue-contents">
                        {venueDetails.venue.bestPhoto ? <img className='venue-photo' alt={venueDetails.venue.name} src={venueDetails.venue.bestPhoto.prefix+'300x300'+venueDetails.venue.bestPhoto.suffix} /> : <span>No Image available</span> }
                                
                                <div className="venue-info-wrapper">
                                    <h2 className='venue-name'>{venueDetails.venue.name}</h2>
                                    <span className='venue-address'>{venueDetails.venue.location.address}, {venueDetails.venue.location.city}</span>
                                    <h3 className='venue-likes'>{venueDetails.venue.likes.summary} </h3>
                                    <h3 className='venue-rating'style={{backgroundColor: `#${venueDetails.venue.ratingColor}`}}>{venueDetails.venue.rating} </h3>
                                   
                                    {venueDetails.venue.hours &&
                                        <span className='venue-open-status'style={{color: `${this.isOpen()}`}}>{venueDetails.venue.hours.isOpen ? 'Open' : 'Closed' }</span>
                                    }
                                    <h3>What is?</h3>
                                    <hr/>
                                    <p className='venue-description'>{venueDetails.venue.description || "No description available."}</p>
                                    <h3>Tips</h3>
                                    <hr/>
                                    <ol className='venue-tips'>
                                        {venueDetails.venue.tips && 
                                            venueDetails.venue.tips.groups[0].items.map( tip =>
                                                <li key={tip.id}> <span className='tip-giver-name'> {tip.user.firstName} {tip.user.lastName}: </span>"{tip.text}"</li>
                                            )
                                        }
                                    </ol>
                                </div>
                        </div>
                    } 
                </div>               
        )
    }
}

export default VenueContents