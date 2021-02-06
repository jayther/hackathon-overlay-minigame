import React from 'react';
import ReactDOM from 'react-dom';
import { AppProvider, useAppState, useAppDispatch, pageStates, appActions } from './utils/AppContext.jsx';
import SetupApp from './SetupApp';
import SetupUser from './SetupUser';
import Control from './Control';

const IdlePage = () => {
  const dispatch = useAppDispatch();
  return (
    <p onClick={() => dispatch({ type: appActions.updatePage, pageState: pageStates.loading })}>Starting...</p>
  );
};

const LoadingPage = () => {
  const dispatch = useAppDispatch();
  return (
    <p onClick={() => dispatch({ type: appActions.updatePage, pageState: pageStates.ready })}>Loading...</p>
  );
};

const Website = () => {
  const state = useAppState();
  return (
    state.pageState === pageStates.idle ? <IdlePage /> :
    state.pageState === pageStates.loading ? <LoadingPage /> :
    !state.appReady ? <SetupApp /> :
    !state.user ? <SetupUser /> :
    <Control />
  );
};

const App = () => (
  <AppProvider>
    <Website />
  </AppProvider>
);

ReactDOM.render(<App/>, document.getElementById('main'));
