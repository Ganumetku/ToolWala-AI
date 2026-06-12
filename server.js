const fs = require('fs');
const path = require('path');
const debugFile = path.resolve(__dirname, 'public', 'node_debug.txt');

function logDebug(msg) {
  console.log(msg);
  try {
    fs.appendFileSync(debugFile, msg + '\n');
  } catch (e) {}
}

try {
  if (fs.existsSync(debugFile)) {
    fs.unlinkSync(debugFile);
  }
} catch (e) {}

logDebug('=== NODE.JS INITIALIZATION DEBUG ===');
logDebug('Timestamp: ' + new Date().toISOString());
logDebug('__dirname: ' + __dirname);
logDebug('cwd: ' + process.cwd());

// Push local node_modules path so LiteSpeed finds next/etc.
module.paths.push(path.resolve(__dirname, 'node_modules'));
logDebug('module.paths: ' + JSON.stringify(module.paths, null, 2));

let nextResolved = 'Not resolved';
try {
  nextResolved = require.resolve('next');
  logDebug('next resolved to: ' + nextResolved);
} catch (e) {
  logDebug('next resolve error: ' + e.message);
  if (e.stack) {
    logDebug('next resolve stack: ' + e.stack);
  }
}

let nextLoaded = false;
let next = null;
try {
  next = require('next');
  logDebug('Successfully required next!');
  nextLoaded = true;
} catch (e) {
  logDebug('next load error: ' + e.message);
  if (e.stack) {
    logDebug('next load stack: ' + e.stack);
  }
}

if (nextLoaded) {
  const { createServer } = require('http');
  const { parse } = require('url');

  const dev = false;
  const hostname = 'localhost';
  const port = process.env.PORT || 3000;

  const app = next({ dev, hostname, port });
  const handle = app.getRequestHandler();

  app.prepare().then(() => {
    createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        logDebug('Error handling req: ' + err.message);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    })
      .once('error', (err) => {
        logDebug('Server error: ' + err.message);
        process.exit(1);
      })
      .listen(port, () => {
        logDebug(`> Next.js Server ready on http://${hostname}:${port}`);
      });
  }).catch(err => {
    logDebug('App prepare error: ' + err.message);
    if (err.stack) logDebug(err.stack);
  });
} else {
  logDebug('Next failed to load. Server not started.');
}
