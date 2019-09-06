import React from 'react';
import SearchBar from './SearchBar';
import CurrentColor from './CurrentColor';
import SimilarColors from './SimilarColors';
import './App.css';
import faker from 'faker';
import axios from 'axios';
import SearchBar2 from './SearchBar2';

class App extends React.Component {
    state = {
        currentColor: { name: 'Turquoise', hex: '#03676f', brand: 'Vallejo', productline: 'Game Color' },
        similarColors: [
            { name: 'Sotek Green', hex: '#0c6a74', brand: 'Citadel', productline: 'Layer & Edge' },
            { name: 'HD Winter Blue', hex: '#1d6d74', brand: 'Reaper', productline: 'HD' },
            { name: 'Marine Teal', hex: '#005f6d', brand: 'Reaper', productline: 'MSP' },
            { name: 'Coal Black', hex: '#015960', brand: 'Formula P3', productline: '' },
            { name: 'Field Blue', hex: '#436872', brand: 'Vallejo', productline: 'Model Color' },
            { name: 'Incubi Darkness', hex: '#0b4849', brand: 'Citadel', productline: 'Base' },
            //{ name: faker.commerce.color(), hex: faker.internet.color() },
        ],
        colors: [],
    };

    async componentDidMount() {
        // Load JSON color data
        axios
            .get('./colors.json')
            .then((response) => {
                this.setState({
                    colors: response.data,
                });
                console.log(this.state.colors[0].name);
            })
            .catch(function(error) {
                console.log(error);
            });
    }

    onSearchSubmit = (term) => {
        this.setState({ currentColor: { name: term, hex: term } });
    };

    render() {
        return (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* <SearchBar onSubmit={this.onSearchSubmit} /> */}
                <SearchBar2 onSubmit={this.onSearchSubmit} />
                <div className="ui equal width center aligned padded grid" style={{ flexGrow: '1' }}>
                    <CurrentColor color={this.state.currentColor} />
                    <SimilarColors currentColor={this.state.currentColor} similarColors={this.state.similarColors} />
                </div>
            </div>
        );
    }
}

export default App;
