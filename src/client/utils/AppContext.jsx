/* eslint-disable react/display-name */
import React from 'react';
import appActions from '../../shared/AppActions';
import changeMethods from '../../shared/ChangeMethods';

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
  botReady: false,
  appReady: false,
  eventSubReady: false,
  redeems: [],
  rewards: [],
  rewardMap: {},
  players: [],
  battleQueue: [],
  currentBattle: null,
  winner: null,
  genderMethod: changeMethods.chat,
  charTypeMethod: changeMethods.chat,
  soundVolumes: {},
  battleSettings: {
    delayBetweenAttacks: 0,
    pruneAfterBattle: true,
    autoBattle: false,
    autoBattleDelay: 3000,
    controlFromTwitch: false,
    chanceNormalWeight: 75,
    chanceCritWeight: 10,
    chanceMissWeight: 15
  },
  rewardSettings: {
    autoRefund: false
  }
};

function reducer(state, action) {
  let list, found, id, index;
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
      found = false;
      list = state.redeems.map(redeem => {
        if (redeem.id === action.value.id) {
          redeem.status = action.value.status;
          found = true;
        }
        return redeem;
      });
      if (!found) {
        list.push(action.value);
      }
      return {
        ...state,
        redeems: list
      };
    case appActions.allRedeems:
      return {
        ...state,
        redeems: action.value
      };
    case appActions.updateRewards:
      return {
        ...state,
        rewards: action.value
      };
    case appActions.updateRewardMap:
      return {
        ...state,
        rewardMap: action.value
      };
    case appActions.addPlayer:
      if (!action.value) {
        throw new Error('App action "addplayer" requires a value');
      }
      return {
        ...state,
        players: [...state.players, action.value]
      };
    case appActions.updatePlayer:
      if (!action.value) {
        throw new Error('App action "updateplayer" requires a value');
      }
      list = Array.from(state.players);
      found = false;
      for (let i = 0; i < list.length && !found; i += 1) {
        if (list[i].userId === action.value.userId) {
          list[i] = action.value;
          found = true;
        }
      }
      if (!found) {
        list.push(action.value);
      }
      return {
        ...state,
        players: list
      };
    case appActions.removePlayer:
      if (!action.value) {
        throw new Error('App action "removeplayer" requires a value');
      }
      if (typeof action.value === 'string') {
        id = action.value;
      } else if (action.value.userId) {
        id = action.value.userId;
      } else {
        throw new Error('App action "removeplayer" requires a userId value or an object with userId');
      }
      index = state.players.findIndex(playerChar => id === playerChar.userId);
      if (index === -1) {
        return state;
      }
      list = Array.from(state.players);
      list.splice(index, 1);
      return {
        ...state,
        players: list
      };
    case appActions.allPlayers:
      if (!action.value) {
        throw new Error('App action "allplayers" requires a value');
      }
      return {
        ...state,
        players: action.value
      };
    case appActions.updateBattleQueue:
      if (!action.value) {
        throw new Error('App action "updatebattlequeue" requires a value');
      }
      return {
        ...state,
        battleQueue: action.value
      };
    case appActions.updateBattle:
      return {
        ...state,
        currentBattle: action.value || null
      };
    case appActions.updateBattleResults:
      return {
        ...state,
        battleResults: action.value || null
      };
    case appActions.updateBotReady:
      return {
        ...state,
        botReady: action.value || false
      };
    case appActions.updateGenderMethod:
      if (!action.value) {
        throw new Error(`App action "${action.type}" requires a value`);
      }
      if (!Object.values(changeMethods).includes(action.value)) {
        throw new Error(`"${action.value}" is an invalid value for App action "${action.type}"`)
      }
      return {
        ...state,
        genderMethod: action.value
      };
    case appActions.updateCharTypeMethod:
      if (!action.value) {
        throw new Error(`App action "${action.type}" requires a value`);
      }
      if (!Object.values(changeMethods).includes(action.value)) {
        throw new Error(`"${action.value}" is an invalid value for App action "${action.type}"`)
      }
      return {
        ...state,
        charTypeMethod: action.value
      };
    case appActions.updateVolumes:
      if (!action.value) {
        throw new Error(`App action "${action.type}" requires a value`);
      }
      return {
        ...state,
        soundVolumes: action.value
      };
    case appActions.updateBattleSettings:
      if (!action.value) {
        throw new Error(`App action "${action.type}" requires a value`);
      }
      return {
        ...state,
        battleSettings: action.value
      };
    case appActions.updateRewardSettings:
      if (!action.value) {
        throw new Error(`App action "${action.type}" requires a value`);
      }
      return {
        ...state,
        rewardSettings: action.value
      };
    case appActions.runPlayer:
    case appActions.dancePlayer:
      // do nothing
      return state;
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
