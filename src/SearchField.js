import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './App.css'

class SearchField extends Component {
    static propTypes = {
        filterPlaces: PropTypes.func
    }
    render() {
        return(
            <div className='search-field'>
                <input 
                    aria-label='Search'
                    role='search'
                    className='input-field' 
                    type='text' 
                    placeholder="Search Places.."
                    onChange={ event => this.props.filterPlaces(event.target.value)}/>
            </div>
        )
    }
}

export default SearchField