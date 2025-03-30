// pages/_app.js
import { useEffect } from 'react';
import io from 'socket.io-client';
import '../styles/globals.css';

let socket;

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    socket = io();
    socket.on('connect', () => console.log('Socket connected'));
    return () => socket.disconnect();
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;