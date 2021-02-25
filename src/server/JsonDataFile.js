const fs = require('fs-extra');
const logger = require('./utils/logger');

class JsonDataFile {
  constructor(path) {
    this.path = path;
    this.data = null;
  }
  async load(force = false) {
    if (!force && this.data) {
      return;
    }
    if (await fs.pathExists(this.path)) {
      try {
        this.data = await fs.readJSON(this.path, 'UTF-8');
        logger(`JsonDataFile.load: "${this.path}" loaded`);
      } catch (e) {
        logger(`JsonDataFile.load: Error occurred while loading "${this.path}": ${e.message}`);
      }
    } else {
      logger(`JsonDataFile.load: "${this.path}" does not exist`);
      this.data = {};
    }
    return this.data;
  }
  async save() {
    await fs.writeJSON(this.path, this.data, 'UTF-8');
    logger(`JsonDataFile.save: "${this.path}" saved`);
  }
}

module.exports = JsonDataFile;
