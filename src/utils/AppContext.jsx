import React from 'react';

const StateContext = React.createContext();
const DispatchContext = React.createContext();

const appActions = {
  updatePage: 'updatepage',
  updateApp: 'updateapp',
  updateUser: 'updateuser'
};

const pageStates = {
  idle: 'idle',
  loading: 'loading',
  ready: 'ready'
};

const initialState = {
  pageState: pageStates.idle,
  user: null,
  appReady: false
};

function reducer(state, action) {
  switch (action.type) {
    case appActions.updatePage:
      if (!action.pageState) {
        throw new Error('App action "updatePage" requires a page state');
      }
      return {
        pageState: action.pageState
      };
    case appActions.updateApp:
      return {
        appReady: action.appReady || false
      };
    case appActions.updateUser:
      return {
        user: action.user || null
      }
    default:
      throw new Error(`Unknown app action type: ${action.type}`);
  }
}

function AppProvider({children}) {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

function useAppState() {
  const context = React.useContext(StateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
}

function useAppDispatch() {
  const context = React.useContext(DispatchContext);
  if (context === undefined) {
    throw new Error('useAppDispatch must be used within an AppProvider');
  }
  return context;
}

function AppConsumer({children}) {
  return (
    <StateContext.Consumer>
      { stateContext => (
        <DispatchContext.Consumer>
          { dispatchContext => {
            if (stateContext === undefined || dispatchContext == undefined) {
              throw new Error('AppConsumer must be used within an AppProvider');
            }
            return children([stateContext, dispatchContext]);
          }}
        </DispatchContext.Consumer>
      )}
    </StateContext.Consumer>
  )
}

function withApp(Component) {
  return props => (
    <AppConsumer>
      {([stateContext, dispatchContext]) => <Component
        appState={stateContext}
        appDispatch={dispatchContext}
        {...props} />
      }
    </AppConsumer>
  );
}

export {
  AppProvider,
  AppConsumer,
  withApp,
  useAppState,
  useAppDispatch,
  appActions,
  pageStates
};
