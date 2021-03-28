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
    <article className="card bg-dark">
      <header className="card-header">
        Reward Map
        <button className="btn btn-primary ml-1" onClick={toggleShow}>
          {show ? 'Hide' : 'Show'}
        </button>
      </header>
      {show && (<div className="card-body">
        <table className="reward-map table table-dark table-striped">
          <tbody>
            {actionRewards.length > 0 ? actionRewards.map(([actionKey, reward]) => (
              <tr key={actionKey}>
                <td>
                  <strong>{actionKey}</strong>
                </td>
                <td>{reward.title}</td>
                <td>
                  <button
                    className="btn btn-danger"
                    onClick={() => unsetReward(reward)}
                  >Unset</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={3}><em>None</em></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>)}
    </article>
  );
}
