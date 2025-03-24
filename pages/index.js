// pages/index.js
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    console.log('Welcome to Budget App Js 4.0!');
  }, []);

  return (
    <div>
      <h1>Budget App Js 4.0</h1>
      <p>Loading soon...</p>
    </div>
  );
}