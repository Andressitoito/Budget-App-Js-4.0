// server.js (root of project)
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const initSocket = require('./lib/socket');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = initSocket(server);
  global.io = io; // Make io accessible globally for API routes

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});