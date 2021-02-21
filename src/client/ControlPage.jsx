import React, { useState } from 'react';
import { withApp } from './utils/AppContext';
import SocketBridge from './utils/SocketBridge';
import appActions from '../shared/AppActions';
import requiredRewards from '../shared/RequiredRewards';
import { characterTypes, characterGenders } from '../shared/CharacterParts';
import { next } from '../shared/ArrayUtils';

function PlayersSection(props) {
  return (
    <table className="players-section">
      <thead>
        <tr>
          <th>Username</th>
          <th>Char Type</th>
          <th>Char Gender</th>
          <th>Weapon</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {props.players.map(player => (
          <tr key={player.userId}>
            <td>{player.userDisplayName}</td>
            <td>{player.characterType}</td>
            <td>{player.characterGender}</td>
            <td>{player.weapon ? 'Yes' : 'No'}</td>
            <td>
              <button onClick={() => SocketBridge.socket.emit(appActions.updatePlayer, player.userId, {
                characterType: next(characterTypes, player.characterType)
              })}>
                Change Type
              </button>
              <button onClick={() => SocketBridge.socket.emit(appActions.updatePlayer, player.userId, {
                characterGender: next(characterGenders, player.characterGender)
              })}>
                Change Gender
              </button>
              <button onClick={() => SocketBridge.socket.emit(appActions.updatePlayer, player.userId, {
                weapon: !player.weapon
              })}>
                Toggle Weapon
              </button>
              <button onClick={() => SocketBridge.socket.emit(appActions.removePlayer, player.userId)}>
                Remove
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function MissingRewardsSection(props) {
  if (props.missingRewards.length === 0) {
    return null;
  }
  const [rewardData, setRewardData] = useState({
    title: '',
    cost: 1,
    prompt: ''
  });
  const [showCreateForKey, setShowCreateForKey] = useState(null);
  const [showExistingForKey, setShowExistingForKey] = useState(null);
  const [createRewardPressed, setCreateRewardPressed] = useState(false);
  const [existingRewardPressed, setExistingRewardPressed] = useState(false);

  function createReward(key) {
    setRewardData({
      title: requiredRewards[key].defaultTitle,
      cost: requiredRewards[key].defaultCost,
      prompt: requiredRewards[key].defaultPrompt
    });
    setShowCreateForKey(key);
    setShowExistingForKey(null);
    setCreateRewardPressed(false);
  }

  function useExisting(key) {
    setShowCreateForKey(null);
    setShowExistingForKey(key);
    setExistingRewardPressed(false);
  }

  function sendCreateRewardForAction(key) {
    setCreateRewardPressed(true);
    SocketBridge.socket.emit(appActions.createRewardForAction, rewardData, key);
  }

  function sendExistingRewardForAction(rewardId, key) {
    setExistingRewardPressed(true);
    SocketBridge.socket.emit(appActions.setRewardToAction, rewardId, key);
  }

  return (
    <div>
      <h2>Missing rewards</h2>
      <ul>
        { props.missingRewards.map(key => (
          <li key={key}>
            <strong>{key}</strong>:
            <button onClick={() => createReward(key)}>Create reward</button>
            <button onClick={() => useExisting(key)}>Use existing</button>
            { showCreateForKey === key && (
              <div>
                <h3>Create reward for &quot;{key}&quot;</h3>
                <table>
                  <tbody>
                    <tr>
                      <td>Title:</td>
                      <td><input type="text" value={rewardData.title} onChange={e => setRewardData({ ...rewardData, title: e.target.value })} /></td>
                    </tr>
                    <tr>
                      <td>Cost:</td>
                      <td><input type="number" value={rewardData.cost} onChange={e => setRewardData({ ...rewardData, cost: e.target.value })} /></td>
                    </tr>
                    <tr>
                      <td>Prompt:</td>
                      <td><input type="text" value={rewardData.prompt} onChange={e => setRewardData({ ...rewardData, prompt: e.target.value })} /></td>
                    </tr>
                    <tr>
                      <td></td>
                      <td>
                        <button onClick={() => setShowCreateForKey(null)}>Cancel</button>
                        <button onClick={() => sendCreateRewardForAction(key)} disabled={createRewardPressed}>Create</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) }
            { showExistingForKey === key && (
              <div>
                <h3>Use existing reward for &quot;{key}&quot;</h3>
                <ul>
                  { props.rewards.map(item => (
                    <li key={item.id}>
                      <strong>{item.title}</strong>
                      <button onClick={() => sendExistingRewardForAction(item.id, key)} disabled={existingRewardPressed}>Select</button>
                    </li>
                  ))}
                </ul>
                <button onClick={() => setShowExistingForKey(null)}>Cancel</button>
              </div>
            ) }
          </li>
        )) }
      </ul>
    </div>
  );
}

function DebugSection(props) {
  const [show, setShow] = useState(false);

  function toggleShow() {
    setShow(!show);
  }

  function onAutoRefundChange(e) {
    console.log('auto refund change', props.appState.debugAutoRefund, e.target.checked);
    SocketBridge.socket.emit(appActions.updateDebugAutoRefund, e.target.checked);
  }

  function onAddDebugPlayer() {
    SocketBridge.socket.emit(appActions.addDebugPlayer);
  }

  function onClearDebugPlayers() {
    SocketBridge.socket.emit(appActions.clearDebugPlayers);
  }

  return (
    <div>
      <h2>Debug options <button onClick={toggleShow}>{show ? 'Hide' : 'Show'}</button></h2>
      { show && (
        <ul>
          <li><label>
            <input type="checkbox"
              checked={props.appState.debugAutoRefund}
              onChange={onAutoRefundChange}
            /> Auto refund
          </label></li>
          <li>
            <button onClick={onAddDebugPlayer}>Add debug player</button>
          </li>
          <li>
            <button onClick={onClearDebugPlayers}>Clear debug players</button>
          </li>
        </ul>
      )}
    </div>
  )
}

function EditRewardMap(props) {
  const [show, setShow] = useState(false);

  function toggleShow() {
    setShow(!show);
  }

  function unsetReward(reward) {
    SocketBridge.socket.emit(appActions.setRewardToAction, reward.id, null);
  }

  const actionRewards = [];

  Object.entries(props.rewardMap).forEach(([rewardId, actionKey]) => {
    const reward = props.rewards.find(reward => reward.id === rewardId);
    actionRewards.push([actionKey, reward || { title: 'Unknown' }]);
  });

  return (
    <div>
      <h2>Reward Map <button onClick={toggleShow}>{ show ? 'Hide' : 'Show'}</button></h2>
      { show && (
        <ul>
          { actionRewards.map(([actionKey, reward]) => (
            <li key={actionKey}>
              <strong>{actionKey}</strong>: {reward.title} <button onClick={() => unsetReward(reward)}>Unset</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ControlPage(props) {
  const mappedActions = Object.values(props.appState.rewardMap);
  const missingRewards = Object.keys(requiredRewards).filter(key => !mappedActions.includes(key));


  return (
    <div>
      <h1>Control</h1>
      <h2>Players</h2>
      <PlayersSection players={props.appState.players} />
      <MissingRewardsSection rewards={props.appState.rewards} missingRewards={missingRewards} />
      <EditRewardMap rewards={props.appState.rewards} rewardMap={props.appState.rewardMap} />
      <DebugSection appState={props.appState} />
      <h2>Redemptions</h2>
      <ul>
        { props.appState.redeems.map(item => (
          <li key={item.id}>
            <strong>{item.rewardTitle}</strong>: {item.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default withApp(ControlPage);
