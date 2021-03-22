require('dotenv').config()
let SpotifyWebApi = require('spotify-web-api-node');

let scopes =   ['playlist-modify-private',
                'playlist-read-private',
                'playlist-modify-public',
                'playlist-read-collaborative',
                'user-read-playback-state',
                'user-modify-playback-state',
                'user-read-currently-playing',
                'user-library-modify',
                'user-library-read',
                'user-read-playback-position',
                'user-read-recently-played',
                'user-top-read',
                'streaming',
                'user-follow-modify',
                'user-follow-read'
                ];

let redirectUri = process.env.SPOTIFY_REDIRECT_URI;
let clientId = process.env.SPOTIFY_CLIENT_ID;
let state = 'login';

let credentials = {
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI
};

function getSpotifyLoginURL() {
    let spotifyApi = new SpotifyWebApi({
        redirectUri: redirectUri,
        clientId: clientId
    });

    // Create the authorization URL
    let authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);

    return authorizeURL;
}

module.exports = {
    credentials,
    getSpotifyLoginURL
}