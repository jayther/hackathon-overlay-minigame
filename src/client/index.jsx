import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React from 'react';
import ReactDOM from 'react-dom';
import { AppProvider, pageStates, withApp } from './utils/AppContext.jsx';
import SetupApp from './SetupApp';
import SetupUser from './SetupUser';
import ControlPage from './ControlPage';
import SocketBridge from './utils/SocketBridge';
import Deferred from './utils/Deferred';
import appActions from '../shared/AppActions';

const IdlePage = () => {
  return (
    <p>Starting...</p>
  );
};

const ErrorPage = (props) => {
  return (
    <p>Error: {props.text}</p>
  );
};

const LoadingPage = (props) => {
  return (
    <p>Loading... ({props.text})</p>
  );
};

class Website extends React.Component {
  componentDidMount() {
    this.init();
  }

  async init() {
    this.props.appDispatch({ type: appActions.updatePage, pageState: pageStates.loading });
    SocketBridge.init(SocketBridge.types.control);
    SocketBridge.socket.onAny(this.onSocketAny.bind(this));
    await this.waitForAppReadyData();
    this.props.appDispatch({ type: appActions.updatePage, pageState: pageStates.ready });
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
      !this.props.appState.pageState ? <ErrorPage text="Invalid pageState" /> :
      this.props.appState.pageState === pageStates.idle ? <IdlePage /> :
      this.props.appState.pageState === pageStates.loading ? <LoadingPage text="server" /> :
      !this.props.appState.appReady ? <SetupApp /> :
      !this.props.appState.user ? <SetupUser /> :
      !this.props.appState.eventSubReady ? <LoadingPage text="eventSub" /> :
      <ControlPage />
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
