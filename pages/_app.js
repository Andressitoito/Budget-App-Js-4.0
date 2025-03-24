// pages/_app.js
import { useEffect } from 'react';
import io from 'socket.io-client';

let socket;

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Initialize Socket.io client
    socket = io('http://localhost:3000'); // Update to your deployed URL later
    socket.on('connect', () => console.log('Socket connected'));

    return () => {
      socket.disconnect();
    };
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;