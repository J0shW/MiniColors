import React from 'react';
import axios from 'axios';
import * as firebase from 'firebase/app';
import 'firebase/analytics';
import { getDeltaE } from '../helpers/calcDeltas';
import { Dimmer, Loader, Icon } from 'semantic-ui-react';

import SearchBar from './SearchBar';
import FilterList from './FilterList';
import CurrentColor from './CurrentColor';
import SimilarColors from './SimilarColors';
import {
    getFilters,
    getRandomColor,
    getSimilarColors,
    resetMatchesScroll,
    resetResultsScroll,
} from '../helpers/generalHelper';

import '../styles/App.css';

// Initialize Firebase and Analytics
require('dotenv').config();
const firebaseConfig = {
    apiKey: process.env.REACT_APP_API_KEY!,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN!,
    databaseURL: process.env.REACT_APP_DATABASE_URL!,
    projectId: process.env.REACT_APP_PROJECT_ID!,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET!,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID!,
    appId: process.env.REACT_APP_APP_ID!,
    measurementId: process.env.REACT_APP_MEASUREMENT_ID!,
};
firebase.initializeApp(firebaseConfig);
const analytics = firebase.analytics();

const InitialState: AppState = {
    currentColor: null,
    similarColors: null,
    colors: [],
    filters: [],
};

const colorDataVersion: number = 1;

class App extends React.Component<{}, AppState> {
    // Retrieve the last state from localStorage
    state: AppState = localStorage.getItem(`appState${colorDataVersion}`)
        ? JSON.parse(localStorage.getItem(`appState${colorDataVersion}`) + '')
        : InitialState;

    async componentDidMount() {
        if (this.state.colors.length === 0) {
            // Track New User
            if (process.env.NODE_ENV === 'production') {
                analytics.logEvent('new_user');
            }

            // Load JSON color data
            axios
                .get('./colorsMatched.json')
                .then(response => {
                    // Load Color List
                    this.setState({ colors: response.data }, () => {
                        // Load Filter List
                        this.setState({ filters: getFilters(this.state.colors) }, () => {
                            // Set a random color
                            this.setCurrentColor(getRandomColor(this.state.colors));
                        });
                    });
                })
                .catch(function(error) {
                    console.log(error);
                });
        }
    }

    componentDidUpdate() {
        // Remember state for the next mount
        if (this.state.currentColor != null) {
            localStorage.clear();
            localStorage.setItem(`appState${colorDataVersion}`, JSON.stringify(this.state));
        }
    }

    setCurrentColor: SetCurrentColor = color => {
        this.setState({ currentColor: color }, () => {
            // Set Similar Colors
            this.setState({
                similarColors: getSimilarColors(this.state.currentColor, this.state.colors, this.state.filters),
            });
        });

        // Reset scroll position of Similar Colors
        resetMatchesScroll();
        resetResultsScroll();
    };

    onSearchSubmit: SearchSubmit = color => {
        // Track Search Submit
        if (process.env.NODE_ENV === 'production') {
            analytics.logEvent('search_submit', { colorid: color.id, colorname: color.name });
        }

        this.setCurrentColor(color);
    };

    setFilters: SetFilters = filters => {
        this.setState({ filters }, () => {
            if (this.state.currentColor != null) {
                this.setCurrentColor(this.state.currentColor);
            }
        });
    };

    renderHeader() {
        return (
            <header>
                <nav>
                    <button onClick={() => this.setCurrentColor(getRandomColor(this.state.colors))}>
                        <Icon name="random" />
                    </button>
                    <SearchBar onSubmit={this.onSearchSubmit} colors={this.state.colors} />
                    <FilterList filters={this.state.filters} setfilters={this.setFilters} />
                </nav>
            </header>
        );
    }

    renderMain() {
        var deltaWhite = this.state.currentColor ? getDeltaE(this.state.currentColor.hex, '#FFFFFF') : 100;
        if (
            this.state.currentColor !== null &&
            this.state.currentColor !== undefined &&
            this.state.similarColors !== null
        ) {
            return (
                <main className={deltaWhite < 33 ? 'dark' : ''}>
                    <CurrentColor color={this.state.currentColor} />
                    <SimilarColors similarColors={this.state.similarColors} />
                </main>
            );
        } else {
            return (
                <main>
                    <Dimmer active inverted>
                        <Loader inverted>Loading</Loader>
                    </Dimmer>
                </main>
            );
        }
    }

    renderFooter() {
        return (
            <footer>
                <div>
                    <h4>Best Match</h4>
                </div>
                <div id="footerline"></div>
                <div>
                    <h4>Good Match</h4>
                </div>
            </footer>
        );
    }

    render() {
        return (
            <div className="wrapper">
                {this.renderHeader()}
                {this.renderMain()}
                {this.renderFooter()}
                <div id="snackbar">
                    <div>
                        The Delta (Δ) value indicates the difference between two colors. The lower the number, the
                        better the match!
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
