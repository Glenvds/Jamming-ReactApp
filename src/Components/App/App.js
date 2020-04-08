import React from 'react';
import './App.css';
import { SearchResults } from '../SearchResults/SearchResults';
import { SearchBar } from '../SearchBar/SearchBar'
import { Playlist } from '../Playlist/Playlist';
import Spotify from '../../util/Spotify';

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            searchResults: [],
            playlistName: '',
            playlistTracks: []
        };

        this.addTrack = this.addTrack.bind(this);
        this.removeTrack = this.removeTrack.bind(this);
        this.updatePlaylistName = this.updatePlaylistName.bind(this);
        this.savePlaylist = this.savePlaylist.bind(this);
        this.search = this.search.bind(this);
    }

    async search(term) {
        const sRes = await Spotify.search(term);
        this.setState({ searchResults: sRes });
    }

    savePlaylist() {
        const trackURIs = [];
        this.state.playlistTracks.forEach(t => trackURIs.push(t.id));
        Spotify.savePlaylist(this.state.playlistName, trackURIs)
            .then(this.setState({ playlistName: "New Playlist", playlistTracks: [] }));
    }

    updatePlaylistName(name) {
        this.setState({ playlistName: name });
    }

    removeTrack(track) {
        const nList = this.state.playlistTracks.filter(t => t.id !== track.id);
        this.setState({ playlistTracks: nList })
    }

    addTrack(track) {
        if (!this.state.playlistTracks.some(t => t.id === track.id)) {
            let tracks = this.state.playlistTracks;
            tracks.push(track);
            this.setState({ playlistTracks: tracks });
        } else { alert("Song already in playlist!"); }
    }

    render() {
        return (
            <div>
                <h1>Ja<span className="highlight">mmm</span>ing</h1>
                <div className="App">
                    <SearchBar onSearch={this.search} />
                    <div className="App-playlist">
                        <SearchResults searchResults={this.state.searchResults} onAdd={this.addTrack} />
                        <Playlist name={this.state.playlistName} tracks={this.state.playlistTracks} onSave={this.savePlaylist} onRemove={this.removeTrack} onNameChange={this.updatePlaylistName} />
                    </div>
                </div>
            </div>);
    }
}

export default App;