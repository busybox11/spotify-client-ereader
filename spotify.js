require('dotenv').config()
let SpotifyWebApi = require('spotify-web-api-node');
let loginScript = require('./login');

let spotifyApi = new SpotifyWebApi(loginScript.credentials);

try {
    spotifyApi.setRefreshToken(process.env.SPOTIFY_REFRESH_TOKEN);
    refreshToken();
    console.log('Successfully logged in to Spotify');
} catch(e) { console.log('No access token in .env file\nPlease go to /login and login with your Spotify account, then follow the steps in the console.'); }

function callback(code) {
    spotifyApi.authorizationCodeGrant(code).then(
		function(data) {
			console.log('The token expires in ' + data.body['expires_in']);
			console.log('The access token is ' + data.body['access_token']);
            console.log('The refresh token is ' + data.body['refresh_token']);
            
            console.log()
		
			// Set the access token on the API object to use it in later calls
			spotifyApi.setAccessToken(data.body['access_token']);
			spotifyApi.setRefreshToken(data.body['refresh_token']);

            console.log(`
The app was successfully logged in to Spotify.\n
Please add the following string after SPOTIFY_REFRESH_TOKEN in your .env file:\n
${data.body['refresh_token']}\n\n
You can now go to the client.`)
		},
		function(err) {
			console.log('Something went wrong!', err);
		}
	);
}

function refreshToken() {
    spotifyApi.refreshAccessToken().then(
        function(data) {
            console.log('The access token has been refreshed!');
        
            // Save the access token so that it's used in future calls
            spotifyApi.setAccessToken(data.body['access_token']);
            return true;
        },
        function(err) {
            console.log('Could not refresh access token', err);
            return false;
        }
    );
}

function getPlayingState() {
    return new Promise((resolve, reject) => {
        spotifyApi.getMyCurrentPlaybackState()
            .then(function(data) {
            // Output items
            return resolve(data.body);
        }, function(err) {
            return reject('Something went wrong!', err);
            re
        });
    });
}

module.exports = {
    spotifyApi,
    callback,
    refreshToken,
    getPlayingState
}