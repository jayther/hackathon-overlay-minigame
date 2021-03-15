const globalEmitter = require('./utils/GlobalEmitter');
const appActions = require('../shared/AppActions');
const { applyKnownProps } = require('../shared/ObjectUtils');

const { socketEvents } = require('./consts');
const { bindAndLog } = require('./utils/LogUtils');

const defaultVolumes = {
  globalVolume: 1,
  music: 1,
  arena: 1,
  win: 1,
  spawn: 1,
  attacks: 1
};

const deferredSaveDelay = 3000; // ms

class SoundManager {
  constructor(settings, files, socketManager) {
    this.settings = settings;
    this.files = files;
    this.socketManager = socketManager;
    this.deferredSaveId = -1;

    this.bindedFileSave = bindAndLog(this.fileSave, this);

    globalEmitter.on(socketEvents.overlayAdded, this.onOverlayAdded, this);
    globalEmitter.on(socketEvents.controlAdded, this.onControlAdded, this);
  }

  async init() {
    // ensure missing volume keys
    this.files.soundSettings.data = {
      ...defaultVolumes,
      ...this.files.soundSettings.data
    };
  }

  onOverlayAdded(socket) {
    socket.emit(appActions.updateVolumes, this.files.soundSettings.data);
  }
  onControlAdded(socket) {
    socket.on(appActions.updateVolumes, bindAndLog(this.onSocketUpdateVolumes, this));
    socket.emit(appActions.updateVolumes, this.files.soundSettings.data);
  }

  async onSocketUpdateVolumes(volumes) {
    applyKnownProps(this.files.soundSettings.data, volumes);
    this.deferredSave();
    this.socketManager.overlayEmit(
      appActions.updateVolumes,
      this.files.soundSettings.data
    );
  }

  deferredSave() {
    if (this.deferredSaveId !== -1) {
      clearTimeout(this.deferredSaveId);
    }
    this.deferredSaveId = setTimeout(this.bindedFileSave, deferredSaveDelay);
  }

  async fileSave() {
    this.deferredSaveId = -1;
    return await this.files.soundSettings.save();
  }
}

module.exports = SoundManager;
