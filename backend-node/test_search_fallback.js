require('dotenv').config();
const axios = require('axios');

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

async function testSearchFallback() {
    try {
        const auth = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
        const tokenResp = await axios.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
            headers: { 
                'Authorization': `Basic ${auth}`, 
                'Content-Type': 'application/x-www-form-urlencoded' 
            }
        });
        const token = tokenResp.data.access_token;
        console.log('Token acquired.');

        // Test Search by Genre
        try {
            const searchResp = await axios.get('https://api.spotify.com/v1/search', {
                headers: { 'Authorization': `Bearer ${token}` },
                params: { 
                    q: 'genre:pop', 
                    type: 'track', 
                    limit: 5,
                    market: 'IN' // Using IN since user is in India
                }
            });
            console.log('Search Success! First track:', searchResp.data.tracks.items[0]?.name);
        } catch (e) {
            console.error('Search Failed:', e.response?.data || e.message);
        }
    } catch (err) {
        console.error('Top Level Failed:', err.response?.data || err.message);
    }
}

testSearchFallback();
