import React, { useState } from 'react';
import SocketBridge from '../utils/SocketBridge';
import appActions from '../../shared/AppActions';

export function EditRewardMap(props) {
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
      <h2>Reward Map <button onClick={toggleShow}>{show ? 'Hide' : 'Show'}</button></h2>
      {show && (
        <ul>
          {actionRewards.map(([actionKey, reward]) => (
            <li key={actionKey}>
              <strong>{actionKey}</strong>: {reward.title} <button onClick={() => unsetReward(reward)}>Unset</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
