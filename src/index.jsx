import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React from 'react';
import ReactDOM from 'react-dom';
import { AppProvider, useAppState, useAppDispatch, pageStates, appActions, withApp } from './utils/AppContext.jsx';
import SetupApp from './SetupApp';
import SetupUser from './SetupUser';
import Control from './Control';
import SocketBridge from './utils/SocketBridge';
import Deferred from './utils/Deferred';

const IdlePage = () => {
  return (
    <p>Starting...</p>
  );
};

const LoadingPage = () => {
  return (
    <p>Loading...</p>
  );
};

class Website extends React.Component {
  componentDidMount() {
    this.init();
  }

  async init() {
    this.props.appDispatch({ type: appActions.updatePage, pageState: pageStates.loading });
    SocketBridge.init(SocketBridge.types.control);
    SocketBridge.socket.on('userupdate', user => {
      this.props.appDispatch({ type: appActions.updateUser, user });
    });
    await this.waitForAppReadyData();
    this.props.appDispatch({ type: appActions.updatePage, pageState: pageStates.ready });
  }

  waitForAppReadyData() {
    console.log('Waiting for app ready...');
    const deferred = new Deferred();

    SocketBridge.socket.once('appready', appReady => {
      this.props.appDispatch({ type: appActions.updateApp, appReady });
      console.log(`App ready received (${appReady})`);
      deferred.resolve();
    });

    return deferred.promise;
  }

  render() {
    return (
      this.props.appState.pageState === pageStates.idle ? <IdlePage /> :
      this.props.appState.pageState === pageStates.loading ? <LoadingPage /> :
      !this.props.appState.appReady ? <SetupApp /> :
      !this.props.appState.user ? <SetupUser /> :
      <Control />
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
