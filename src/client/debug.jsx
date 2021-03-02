import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React from 'react';
import ReactDOM from 'react-dom';
import Preloader from './utils/Preloader';
import Deferred from './utils/Deferred';
import DebugSpritePage from './debug/DebugSpritePage';

import spritesheet0img from './assets/spritesheets-0.png';
import spritesheet0 from './assets/spritesheets-0.json';
import spritesheet1img from './assets/spritesheets-1.png';
import spritesheet1 from './assets/spritesheets-1.json';


const LoadingPage = (props) => {
  return (
    <p>Loading... ({props.text})</p>
  );
};

class Website extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      preloaded: false
    };

    this.preloader = new Preloader();
    this.preloader.addImgLoader(spritesheet0img);
    this.preloader.addImgLoader(spritesheet1img);
  }
  componentDidMount() {
    this.init();
  }

  async init() {
    console.log('init called');
    await this.preload();
  }

  async preload() {

    console.log('meow');
    const deferred = new Deferred();

    this.preloader.callback = (loader, error) => {
      if (error) {
        deferred.reject(error);
        return;
      }
      deferred.resolve();
    };
    this.preloader.load();

    console.log('rawr');

    window.preloader = this.preloader;

    await deferred.promise;

    spritesheet0.frames.forEach(frame => frame.src = spritesheet0img);
    spritesheet1.frames.forEach(frame => frame.src = spritesheet1img);

    this.setState({
      preloaded: true
    });
  }

  render() {
    return (
      !this.state.preloaded ? <LoadingPage text="preloading images" /> :
      <DebugSpritePage />
    );
  }
}

ReactDOM.render(<Website />, document.getElementById('main'));
