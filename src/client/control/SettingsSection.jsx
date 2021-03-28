import React, { useState } from 'react';
import changeMethods from '../../shared/ChangeMethods';
import appActions from '../../shared/AppActions';
import SocketBridge from '../utils/SocketBridge';
import requiredRewards from '../../shared/RequiredRewards';
import { MissingRewardsSection } from './MissingRewardsSection';
import { EditRewardMap } from './EditRewardMap';

function isInRewardMap(rewardMap, actionKey) {
  return Object.values(rewardMap).includes(actionKey);
}

export function SettingsSection(props) {
  const [tempGenderMethod, setTempGenderMethod] = useState(props.appState.genderMethod);
  const [tempCharTypeMethod, setTempCharTypeMethod] = useState(props.appState.charTypeMethod);

  function onGenderMethodChange(e) {
    setTempGenderMethod(e.target.value);
    SocketBridge.socket.emit(appActions.updateGenderMethod, e.target.value);
  }

  function onCharTypeMethodChange(e) {
    setTempCharTypeMethod(e.target.value);
    SocketBridge.socket.emit(appActions.updateCharTypeMethod, e.target.value);
  }

  const genderMethodRewardEnabled = isInRewardMap(
    props.appState.rewardMap,
    requiredRewards.changeCharacterGender.key
  );

  const charTypeMethodRewardEnabled = isInRewardMap(
    props.appState.rewardMap,
    requiredRewards.changeCharacterType.key
  );

  const mappedActions = Object.values(props.appState.rewardMap);
  const missingRewards = Object.keys(requiredRewards).filter(key => !mappedActions.includes(key));

  return (
    <section className="container-sm">
      <MissingRewardsSection rewards={props.appState.rewards} missingRewards={missingRewards} />
      <EditRewardMap rewards={props.appState.rewards} rewardMap={props.appState.rewardMap} />
      <article className="card bg-dark">
        <header className="card-header">Character Settings</header>
        <div className="card-body">
          <h5>Change Gender Method</h5>
          <div>
            <div className="form-check form-check-inline">
              <label className="form-check-label">
                <input
                  type="radio"
                  className="form-check-input"
                  value={changeMethods.chat}
                  checked={props.appState.genderMethod === changeMethods.chat}
                  onChange={onGenderMethodChange}
                  disabled={tempGenderMethod !== props.appState.genderMethod}
                />
                Chat
              </label>
            </div>
            <div className="form-check form-check-inline">
              <label className="form-check-label">
                <input
                  type="radio"
                  className="form-check-input"
                  value={changeMethods.reward}
                  checked={props.appState.genderMethod === changeMethods.reward}
                  onChange={onGenderMethodChange}
                  disabled={!genderMethodRewardEnabled || tempGenderMethod !== props.appState.genderMethod}
                />
                Reward
              </label>
            </div>
          </div>
          <h5>Change Char Type Method</h5>
          <div>
            <div className="form-check form-check-inline">
              <label className="form-check-label">
                <input
                  type="radio"
                  className="form-check-input"
                  value={changeMethods.chat}
                  checked={props.appState.charTypeMethod === changeMethods.chat}
                  onChange={onCharTypeMethodChange}
                  disabled={tempCharTypeMethod !== props.appState.charTypeMethod}
                />
                Chat
              </label>
            </div>
            <div className="form-check form-check-inline">
              <label className="form-check-label">
                <input
                  type="radio"
                  className="form-check-input"
                  value={changeMethods.reward}
                  checked={props.appState.charTypeMethod === changeMethods.reward}
                  onChange={onCharTypeMethodChange}
                  disabled={!charTypeMethodRewardEnabled || tempCharTypeMethod !== props.appState.charTypeMethod}
                />
                Reward
              </label>
            </div>
          </div>
        </div>
      </article>
      <article className="card bg-dark">
        <header className="card-header">Redemptions</header>
        <ul className="list-group list-group-flush">
          { props.appState.redeems.length ? props.appState.redeems.map(item => (
            <li key={item.id} className="list-group-item list-group-item-dark">
              <strong>{item.rewardTitle}</strong>: {item.status}
            </li>
          )) : (
            <li className="list-group-item list-group-item-dark"><em>None</em></li>
          )}
        </ul>
      </article>
    </section>
  );
}
