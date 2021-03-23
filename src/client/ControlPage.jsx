import React from 'react';
import { withApp } from './utils/AppContext';
import requiredRewards from '../shared/RequiredRewards';
import { DebugSection } from './control/DebugSection';
import { PlayersSection } from './control/PlayersSection';
import { BattleSection } from './control/BattleSection';
import { MissingRewardsSection } from './control/MissingRewardsSection';
import { EditRewardMap } from './control/EditRewardMap';
import { SettingsSection } from './control/SettingsSection';
import { SoundSection } from './control/SoundSection';

function ControlPage(props) {
  const mappedActions = Object.values(props.appState.rewardMap);
  const missingRewards = Object.keys(requiredRewards).filter(key => !mappedActions.includes(key));
  const battle = props.appState.currentBattle ? {
      player1: props.appState.players.find(p => p.userId === props.appState.currentBattle[0]) || {
        userId: props.appState.currentBattle[0],
        userDisplayName: props.appState.currentBattle[0],
        userName: props.appState.currentBattle[0]
      },
      player2: props.appState.players.find(p => p.userId === props.appState.currentBattle[1]) || {
        userId: props.appState.currentBattle[1],
        userDisplayName: props.appState.currentBattle[1],
        userName: props.appState.currentBattle[1]
      }
    } : null;

  return (
    <div>
      <h1>Control</h1>
      <h2>Players</h2>
      <PlayersSection players={props.appState.players} />
      <BattleSection
        battle={battle}
        battleQueue={props.appState.battleQueue}
        battleResults={props.appState.battleResults}
        battleSettings={props.appState.battleSettings}
      />
      <MissingRewardsSection rewards={props.appState.rewards} missingRewards={missingRewards} />
      <SettingsSection appState={props.appState} />
      <SoundSection appState={props.appState} appDispatch={props.appDispatch} />
      <EditRewardMap rewards={props.appState.rewards} rewardMap={props.appState.rewardMap} />
      <DebugSection appState={props.appState} />
      <h2>Redemptions</h2>
      <ul>
        { props.appState.redeems.length ? props.appState.redeems.map(item => (
          <li key={item.id}>
            <strong>{item.rewardTitle}</strong>: {item.status}
          </li>
        )) : (
          <li><em>None</em></li>
        )}
      </ul>
    </div>
  );
}

export default withApp(ControlPage);
