import { useEffect, useState } from 'react';

function App() {
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetch('/api/users/test') // Matches the proxy '/api'
            .then((response) => response.json())
            .then((data) => setMessage(data.message))
            .catch((error) => console.error('Error:', error));
    }, []);

    return <div>{message ? message : 'Loading...'}</div>;
}

export default App;
