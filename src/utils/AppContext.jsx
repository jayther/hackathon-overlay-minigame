import React from 'react';

const StateContext = React.createContext();
const DispatchContext = React.createContext();

const appActions = {
  updatePage: 'updatepage',
  updateApp: 'updateapp',
  updateUser: 'updateuser',
  updateEventSubReady: 'updateeventsubready',
  addRedeem: 'addredeem',
  updateRedeem: 'updateredeem'
};

const pageStates = {
  idle: 'idle',
  loading: 'loading',
  ready: 'ready'
};

const initialState = {
  pageState: pageStates.idle,
  user: null,
  appReady: false,
  eventSubReady: false,
  redeems: []
};

function reducer(state, action) {
  let list;
  switch (action.type) {
    case appActions.updatePage:
      if (!action.pageState) {
        throw new Error('App action "updatePage" requires a page state');
      }
      return {
        ...state,
        pageState: action.pageState
      };
    case appActions.updateApp:
      return {
        ...state,
        appReady: action.appReady || false
      };
    case appActions.updateUser:
      return {
        ...state,
        user: action.user || null
      };
    case appActions.updateEventSubReady:
      return {
        ...state,
        eventSubReady: action.eventSubReady || false
      };
    case appActions.addRedeem:
      if (!action.redeem) {
        throw new Error('App action "addRedeem" requires a redeem');
      }
      return {
        ...state,
        redeems: [...state.redeems, action.redeem]
      };
    case appActions.updateRedeem:
      if (!action.redeem) {
        throw new Error('App action "updateRedeem" requires a redeem');
      }
      list = state.redeems.map(redeem => {
        if (redeem.id === action.redeem.id) {
          redeem.status = action.redeem.status;
        }
        return redeem;
      });
      return {
        ...state,
        redeems: list
      };
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
