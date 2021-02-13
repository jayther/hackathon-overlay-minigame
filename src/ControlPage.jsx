import React, { useState } from 'react';
import { withApp } from './utils/AppContext';
import SocketBridge from './utils/SocketBridge';
import appActions from '../src-shared/AppActions';

function ControlPage(props) {
  const [rewardData, setRewardData] = useState({
    title: '',
    cost: 1,
    prompt: ''
  });
  return (
    <div>
      <h1>Control</h1>
      <h2>Rewards</h2>
      <ul>
        { props.appState.rewards.map(item => (
          <li key={item.id}>
            <strong>{item.title}</strong>: {item.cost} points
          </li>
        ))}
      </ul>
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
            <td><button onClick={() => SocketBridge.socket.emit(appActions.createReward, rewardData)}>Create</button></td>
          </tr>
        </tbody>
      </table>
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
