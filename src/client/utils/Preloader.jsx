
const loadStates = {
  idle: 'idle',
  loading: 'loading',
  loaded: 'loaded',
  errored: 'errored'
};

class Loader {
  constructor() {
    this.state = loadStates.idle;
    this.error = null;
    this.callback = null;
  }
  load() {}
}

class ImgLoader extends Loader {
  constructor(src, callback) {
    super();
    this.src = src;
    this.callback = callback || null;
    this.img = new Image();
    this.img.addEventListener('load', () => {
      this.state = loadStates.loaded;
      if (!this.callback) return;
      this.callback(this, null);
    }, false);
    this.img.addEventListener('error', e => {
      this.state = loadStates.errored;
      this.error = e;
      if (!this.callback) return;
      this.callback(this, e);
    }, false);
  }
  load() {
    this.img.src = this.src;
    this.state = loadStates.loading;
  }
}

class Preloader extends Loader {
  constructor() {
    super();
    this.loaders = [];
    this.loaderCallback = this.loaderCallback.bind(this);
  }
  loaderCallback(loader, error) {
    if (error) {
      console.error(error);
      return;
    }
    this.checkForAllLoaded();
  }
  checkForAllLoaded() {
    let loaded = 0;
    let done = 0;
    const erroredLoaders = [];
    this.loaders.forEach(loader => {
      if (loader.state === loadStates.loaded) {
        loaded += 1;
        done += 1;
      } else if (loader.state === loadStates.errored) {
        erroredLoaders.push(loader);
        done += 1;
      }
    });
    if (done < this.loaders.length) {
      return;
    }
    if (erroredLoaders.length > 0) {
      const message = erroredLoaders.map(loader => loader.error.message).join('; ');
      this.error = new Error(message);
      this.state = loadStates.errored;
      if (this.callback) {
        this.callback(this, this.error);
      }
      return;
    }
    if (loaded >= this.loaders.length) {
      this.state = loadStates.loaded;
      if (this.callback) {
        this.callback(this, null);
      }
      return;
    }

    this.state = loadStates.errored;
    this.error = new Error('Preloader: Unknown error (mismatched loader count)');
    if (this.callback) {
      this.callback(this, this.error);
    }
  }
  addLoader(loader) {
    loader.callback = this.loaderCallback;
    this.loaders.push(loader);
  }
  addImgLoader(src) {
    this.addLoader(new ImgLoader(src));
  }
  load() {
    this.state = loadStates.loading;
    this.loaders.forEach(loader => loader.load());
  }
}

export default Preloader;
export { loadStates };
