const axios = require('axios');

async function testAPI() {
    try {
        // Test the users/all endpoint
        const response = await axios.get('http://localhost:3001/api/users/all?showSent=true', {
            withCredentials: true,
            headers: {
                'Cookie': 'connect.sid=test'
            }
        });

        console.log('Response status:', response.status);
        console.log('Number of users:', response.data.length);
        console.log('\nUsers returned:');
        response.data.forEach(user => {
            console.log(`- ID ${user.id}: ${user.name} (${user.email})`);
            console.log(`  Picture: ${user.picture_url || 'NONE'}`);
            console.log(`  Word: ${user.word || 'NONE'}`);
            console.log(`  Card sent: ${user.card_sent_this_season}`);
        });
    } catch (error) {
        console.error('Error:', error.response?.status, error.response?.data || error.message);
    }
}

testAPI();
