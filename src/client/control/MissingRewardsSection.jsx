import React, { useState } from 'react';
import SocketBridge from '../utils/SocketBridge';
import appActions from '../../shared/AppActions';
import requiredRewards from '../../shared/RequiredRewards';

export function MissingRewardsSection(props) {
  if (props.missingRewards.length === 0) {
    return null;
  }
  const [rewardData, setRewardData] = useState({
    title: '',
    cost: 1,
    prompt: '',
    userInputRequired: false
  });
  const [showCreateForKey, setShowCreateForKey] = useState(null);
  const [showExistingForKey, setShowExistingForKey] = useState(null);
  const [createRewardPressed, setCreateRewardPressed] = useState(false);
  const [existingRewardPressed, setExistingRewardPressed] = useState(false);

  function createReward(key) {
    const rewardData = {
      ...requiredRewards[key]
    };
    delete rewardData.eventName;
    setRewardData(rewardData);
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
        {props.missingRewards.map(key => (
          <li key={key}>
            <strong>{key}</strong>:
            <button onClick={() => createReward(key)}>Create reward</button>
            <button onClick={() => useExisting(key)}>Use existing</button>
            {showCreateForKey === key && (
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
                      <td>User Input Required:</td>
                      <td><input type="checkbox" checked={rewardData.userInputRequired} onChange={e => setRewardData({ ...rewardData, userInputRequired: e.target.checked })} /></td>
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
            )}
            {showExistingForKey === key && (
              <div>
                <h3>Use existing reward for &quot;{key}&quot;</h3>
                <ul>
                  {props.rewards.map(item => (
                    <li key={item.id}>
                      <strong>{item.title}</strong>
                      <button onClick={() => sendExistingRewardForAction(item.id, key)} disabled={existingRewardPressed}>Select</button>
                    </li>
                  ))}
                </ul>
                <button onClick={() => setShowExistingForKey(null)}>Cancel</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
