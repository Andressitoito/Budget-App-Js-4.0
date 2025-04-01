// src/app/layout.js
import QueryClientWrapper from '../components/QueryClientWrapper/QueryClientWrapper';
import Layout from '../components/layout/Layout';
import '../app/globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-blue-500">
      <body>
        <QueryClientWrapper>
          <Layout>{children}</Layout>
        </QueryClientWrapper>
      </body>
    </html>
  );
}