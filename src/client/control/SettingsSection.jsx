import React, { useState } from 'react';
import changeMethods from '../../shared/ChangeMethods';
import appActions from '../../shared/AppActions';
import SocketBridge from '../utils/SocketBridge';
import requiredRewards from '../../shared/RequiredRewards';

function isInRewardMap(rewardMap, actionKey) {
  return Object.values(rewardMap).includes(actionKey);
}

export function SettingsSection(props) {
  const [show, setShow] = useState(false);
  const [tempGenderMethod, setTempGenderMethod] = useState(props.appState.genderMethod);
  const [tempCharTypeMethod, setTempCharTypeMethod] = useState(props.appState.charTypeMethod);

  function toggleShow() {
    setShow(!show);
  }

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

  return (
    <div>
      <h2>Settings <button onClick={toggleShow}>{show ? 'Hide' : 'Show'}</button></h2>
      {show && (
        <div>
          <h3>Change Gender Method</h3>
          <p>
            <label>
              <input
                type="radio"
                value={changeMethods.chat}
                checked={props.appState.genderMethod === changeMethods.chat}
                onChange={onGenderMethodChange}
                disabled={tempGenderMethod !== props.appState.genderMethod}
              />
              Chat
            </label>
            <label>
              <input
                type="radio"
                value={changeMethods.reward}
                checked={props.appState.genderMethod === changeMethods.reward}
                onChange={onGenderMethodChange}
                disabled={!genderMethodRewardEnabled || tempGenderMethod !== props.appState.genderMethod}
              />
              Reward
            </label>
          </p>
          <h3>Change Char Type Method</h3>
          <p>
            <label>
              <input
                type="radio"
                value={changeMethods.chat}
                checked={props.appState.charTypeMethod === changeMethods.chat}
                onChange={onCharTypeMethodChange}
                disabled={tempCharTypeMethod !== props.appState.charTypeMethod}
              />
              Chat
            </label>
            <label>
              <input
                type="radio"
                value={changeMethods.reward}
                checked={props.appState.charTypeMethod === changeMethods.reward}
                onChange={onCharTypeMethodChange}
                disabled={!charTypeMethodRewardEnabled || tempCharTypeMethod !== props.appState.charTypeMethod}
              />
              Reward
            </label>
          </p>
        </div>
      )}
    </div>
  );
}
