const path = require('path');
const fs = require('fs-extra');
const express = require('express');
const { createServer } = require('http');
const logger = require('./src/server/utils/logger');

const assetsPath = './src/client/assets';
const assetsBackupPath = './src/client/assets/backup';

async function updateSpritesheets(req, resp) {
  const filename = req.params.filename;
  if (!filename) {
    logger('Missing filename in request');
    resp.status(400).send('Missing filename in request');
    return;
  }
  const fullPath = path.join(assetsPath, filename);
  if (!(await fs.pathExists(fullPath))) {
    logger(`File does not exist: ${fullPath}`);
    resp.status(400).send('File does not exist');
    return;
  }
  const date = new Date();
  const backupFullPath = path.join(assetsBackupPath, `${filename}.${date.getTime()}.bak`);

  try {
    await fs.move(fullPath, backupFullPath)
  } catch (e) {
    logger('Error occurred while moving:', e.stack);
    resp.status(500).send('Error occurred while moving');
    return;
  }

  try {
    await fs.writeJSON(fullPath, req.body, { spaces: 2 });
  } catch (e) {
    logger('Error occurred while writing:', e.stack);
    resp.status(500).send('Error occurred while writing');
    return;
  }

  logger('Written to', fullPath);

  resp.send('ok');
}

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.static('dist-debug'));
app.post('/spritesheets/:filename', updateSpritesheets);

const server = createServer(app);
server.listen(8080);
logger('Server Debug ready');
