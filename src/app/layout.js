// src/app/layout.js
import Layout from '../components/layout/Layout';
import '../app/globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-blue-500">
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}

