import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React from 'react';
import ReactDOM from 'react-dom';
import { AppProvider, useAppState, useAppDispatch, pageStates, appActions, withApp } from './utils/AppContext.jsx';
import SetupApp from './SetupApp';
import SetupUser from './SetupUser';
import Control from './Control';
import SocketBridge from './utils/SocketBridge';

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
    await SocketBridge.init(SocketBridge.types.control);
    this.props.appDispatch({ type: appActions.updatePage, pageState: pageStates.ready });
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
