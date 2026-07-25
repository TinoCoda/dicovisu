async function testApi() {
    try {
        console.log('Testing API endpoint: http://localhost:5000/api/words');
        const response = await fetch('http://localhost:5000/api/words');

        if (!response.ok) {
            console.log('Error:', response.status, response.statusText);
            const text = await response.text();
            console.log('Response:', text);
            return;
        }

        const data = await response.json();
        console.log('Success:', data.success);
        console.log('Total words:', data.size);

        const wordsWithAudio = data.data.filter(w => w.audio);
        console.log('Words with audio:', wordsWithAudio.length);

        if (wordsWithAudio.length > 0) {
            console.log('\nSample word with audio:');
            console.log('  Word:', wordsWithAudio[0].word);
            console.log('  Audio URL:', wordsWithAudio[0].audio.url);
        }
    } catch (error) {
        console.error('Error testing API:', error.message);
    }
}

testApi();
