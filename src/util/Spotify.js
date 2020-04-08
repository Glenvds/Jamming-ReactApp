let userAccessToken;
const authEndpoint = "https://accounts.spotify.com/authorize";
const apiEndPoint = "https://api.spotify.com/v1/";
const {clientId} = require('../../config.json');
const scope = "playlist-modify-private";
const redirectUri = "http://localhost:3000/";
//const redirectUri = "http://jamming.glenvandesteen.be"


const Spotify = {
    getAccessToken() {
        if (userAccessToken) { return userAccessToken; }

        const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
        const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);
        if (accessTokenMatch && expiresInMatch) {
            userAccessToken = accessTokenMatch[1];
            const expires_in = Number(expiresInMatch[1]);
            window.setTimeout(() => userAccessToken = '', expires_in * 1000);
            window.history.pushState('Access Token', null, '/');
            return userAccessToken;
        } else {
            const accessUrl = `${authEndpoint}?client_id=${clientId}&response_type=token&scope=${scope}&redirect_uri=${redirectUri}`;
            window.location = accessUrl;
        }
    },

    async search(term) {
        const userAccessToken = this.getAccessToken();
        const response = await fetch(`${apiEndPoint}search?q=${term}&type=track`, { headers: { Authorization: `Bearer ${userAccessToken}` } });
        const jsonResponse = await response.json();
        let tracks = [];
        tracks = await jsonResponse.tracks.items.map(track => {
            return {
                id: track.id,
                name: track.name,
                artist: track.artists[0].name,
                album: track.album.name,
                uri: track.uri
            }
        });
        return tracks;
    },

    async savePlaylist(name, trackURIS) {
        const userAccessToken = this.getAccessToken()
        if (!name || !trackURIS.length) { return; }
        const currentUserId = await this.getCurrentUserId();

        const createHeader = { "Content-type": "application/json", Authorization: `Bearer ${userAccessToken}` }
        const createBody = { name: name, description: "This playlist is created by the app 'jamming'", public: false };

        const createResponse = await fetch(`${apiEndPoint}users/${currentUserId}/playlists`, { method: "POST", headers: createHeader, body: JSON.stringify(createBody) });
        const jsonResponse = await createResponse.json();
        const createdPlaylistId = jsonResponse.id;

        const spotURIS = trackURIS.map(uri => "spotify:track:" + uri);
        const addBody = { uris: spotURIS };
        await fetch(`${apiEndPoint}playlists/${createdPlaylistId}/tracks`, { method: "POST", headers: createHeader, body: JSON.stringify(addBody) });
    },

    async getCurrentUserId() {
        const userAccessToken = this.getAccessToken()
        const respone = await fetch(`${apiEndPoint}me`, { headers: { Authorization: `Bearer ${userAccessToken}` } });
        const jsonResponse = await respone.json();
        return jsonResponse.id;
    }
}

export default Spotify;