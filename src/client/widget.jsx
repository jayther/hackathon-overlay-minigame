import 'core-js/stable';
import 'regenerator-runtime/runtime';
import './css/widget.scss';

import React from 'react';
import ReactDOM from 'react-dom';
import { AppProvider, pageStates, withApp } from './utils/AppContext.jsx';
import WidgetPage from './WidgetPage';
import SocketBridge from './utils/SocketBridge';
import socketTypes from '../shared/SocketTypes';
import Deferred from './utils/Deferred';
import appActions from '../shared/AppActions';
import Preloader from './utils/Preloader';
import R from './Resources';

import spritesheet0img from './assets/spritesheets-0.png';
import spritesheet1img from './assets/spritesheets-1.png';
import arenaimg from './assets/arena.png';
import spritesheet0 from './assets/spritesheets-0.json';
import spritesheet1 from './assets/spritesheets-1.json';
import hpBar from './assets/hp-bar.png';

import * as sounds from './game/SoundAssets';
import soundSets, { resolveAllSets } from './game/SoundSets';

const IdlePage = () => {
  return (
    <p>Starting...</p>
  );
};

const LoadingPage = (props) => {
  return (
    <p>Loading... ({props.text})</p>
  );
};

const ErrorPage = (props) => {
  return (
    <p>Error: {props.text}</p>
  );
};

const SetupApp = () => {
  return (
    <p>Waiting for app setup...</p>
  );
};

const SetupUser = (props) => {
  return (
    <p>Waiting for {props.bot ? 'chat bot' : 'user'} login...</p>
  );
};

class Website extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      preloaded: false,
      loadedRatio: 0
    };
    this.howlLoaderMap = {};

    this.preloader = new Preloader();
    this.preloader.addImgLoader(spritesheet0img);
    this.preloader.addImgLoader(spritesheet1img);
    this.preloader.addImgLoader(arenaimg);
    this.preloader.addImgLoader(hpBar);
    for (const [key, src] of Object.entries(sounds)) {
      const loader = this.preloader.addHowlLoader(src, {
        loop: src === sounds.bossCastleHassle
      });
      this.howlLoaderMap[key] = loader;
    }
  }
  componentDidMount() {
    this.init();
  }

  async init() {
    console.log('init called');
    this.props.appDispatch({ type: appActions.updatePage, pageState: pageStates.loading });
    SocketBridge.init(socketTypes.overlay);
    SocketBridge.socket.onAny(this.onSocketAny.bind(this));
    if (!this.props.appState.appReady) {
      await this.waitForAppReadyData();
    }
    console.log('after app ready data');
    this.props.appDispatch({ type: appActions.updatePage, pageState: pageStates.ready });
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
    this.preloader.onProgress = (loader, loaded, total) => {
      this.setState({
        loadedRatio: loaded / total
      });
    };
    this.preloader.load();

    console.log('rawr');

    window.preloader = this.preloader;

    await deferred.promise;

    spritesheet0.frames.forEach(frame => R.frames[frame.filename] = {...frame, src: spritesheet0img });
    spritesheet1.frames.forEach(frame => R.frames[frame.filename] = {...frame, src: spritesheet1img });
    for (const [key, src] of Object.entries(sounds)) {
      R.sounds[src] = this.howlLoaderMap[key].howl;
    }

    resolveAllSets(soundSets);

    this.setState({
      preloaded: true
    });

    window.R = R;
  }

  onSocketAny(event, value) {
    // only care about events with the same appActions
    const appActionValues = Object.values(appActions);
    if (!appActionValues.includes(event)) {
      return;
    }

    // relay socket event to appAction
    this.props.appDispatch({ type: event, value });
  }

  waitForAppReadyData() {
    console.log('Waiting for app ready...');
    const deferred = new Deferred();

    SocketBridge.socket.once(appActions.updateApp, appReady => {
      this.props.appDispatch({ type: appActions.updateApp, value: appReady });
      console.log(`App ready received (${appReady})`);
      deferred.resolve();
    });

    return deferred.promise;
  }

  render() {
    return (
      !this.props.appState.pageState ? <ErrorPage text="Unknown pageState" /> :
      this.props.appState.pageState === pageStates.idle ? <IdlePage /> :
      this.props.appState.pageState === pageStates.loading ? <LoadingPage text="server" /> :
      !this.props.appState.appReady ? <SetupApp /> :
      !this.props.appState.user ? <SetupUser /> :
      !this.props.appState.botReady ? <SetupUser bot={true} /> :
      !this.props.appState.eventSubReady ? <LoadingPage text="eventSub" /> :
      !this.state.preloaded ? <LoadingPage text={`Preloading (${Math.floor(this.state.loadedRatio * 100)}%)`} /> :
      <WidgetPage />
    );
  }
}

const WrappedWebsite = withApp(Website);

const App = () => (
  <AppProvider>
    <WrappedWebsite />
  </AppProvider>
);

ReactDOM.render(<App/>, document.getElementById('main'));
