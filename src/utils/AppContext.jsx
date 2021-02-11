import React from 'react';
import appActions from '../../src-shared/AppActions';

const StateContext = React.createContext();
const DispatchContext = React.createContext();

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
        pageState: action.value
      };
    case appActions.updateApp:
      return {
        ...state,
        appReady: action.value || false
      };
    case appActions.updateUser:
      return {
        ...state,
        user: action.value || null
      };
    case appActions.updateEventSubReady:
      return {
        ...state,
        eventSubReady: action.value || false
      };
    case appActions.addRedeem:
      if (!action.value) {
        throw new Error('App action "addRedeem" requires a redeem value');
      }
      return {
        ...state,
        redeems: [...state.redeems, action.value]
      };
    case appActions.updateRedeem:
      if (!action.value) {
        throw new Error('App action "updateRedeem" requires a redeem value');
      }
      list = state.redeems.map(redeem => {
        if (redeem.id === action.value.id) {
          redeem.status = action.value.status;
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
