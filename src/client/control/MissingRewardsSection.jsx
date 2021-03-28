import React, { useState } from 'react';
import SocketBridge from '../utils/SocketBridge';
import appActions from '../../shared/AppActions';
import requiredRewards from '../../shared/RequiredRewards';

const cards = {
  none: 'none',
  create: 'create',
  existing: 'existing'
};

function CreateRewardCard(props) {
  const [pressed, setPressed] = useState(false);
  const [rewardData, setRewardData] = useState({
    ...requiredRewards[props.actionKey]
  });

  function sendCreateRewardForAction(actionKey) {
    if (rewardData.eventName) {
      delete rewardData.eventName;
    }
    setPressed(true);
    SocketBridge.socket.emit(appActions.createRewardForAction, rewardData, actionKey);
  }
  
  return (
    <div className="card bg-dark" style={{width: '360px', marginTop: '5px'}}>
      <header className="card-header">Create reward for &quot;{props.actionKey}&quot;</header>
      <div className="card-body">
        <div className="form-group">
          <label>Title</label>
          <input type="text" className="form-control" value={rewardData.title} onChange={e => setRewardData({ ...rewardData, title: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Cost</label>
          <input type="number" className="form-control" min="0" step="1" value={rewardData.cost} onChange={e => setRewardData({ ...rewardData, cost: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Prompt</label>
          <input type="text" className="form-control" value={rewardData.prompt} onChange={e => setRewardData({ ...rewardData, prompt: e.target.value })} />
        </div>
        <div className="form-group form-check">
          <label className="form-check-label">
            <input type="checkbox" className="form-check-input" checked={rewardData.userInputRequired} onChange={e => setRewardData({ ...rewardData, userInputRequired: e.target.checked })} />
            User Input Required
          </label>
        </div>
        <button className="btn btn-secondary" onClick={props.closeCard}>Cancel</button>
        <button className="btn btn-primary" onClick={() => sendCreateRewardForAction(props.actionKey)} disabled={pressed}>Create</button>
      </div>
    </div>
  );
}

function UseExistingCard(props) {
  const [pressed, setPressed] = useState(false);
  function sendExistingRewardForAction(rewardId, key) {
    setPressed(true);
    SocketBridge.socket.emit(appActions.setRewardToAction, rewardId, key);
  }

  return (
    <div className="card bg-dark" style={{margin: '5px 0'}}>
      <header className="card-header">Use existing reward for &quot;{props.actionKey}&quot;</header>
      <div className="card-body">
        <ul className="list-group " style={{marginBottom: '5px'}}>
          {props.rewards.map(item => (
            <li key={item.id} className="list-group-item list-group-item-dark">
              <div className="row">
                <div className="col-sm-2 text-md-right text-lg-right text-xl-right text-sm-left">
                  <button className="btn btn-primary" onClick={() => sendExistingRewardForAction(item.id, props.actionKey)} disabled={pressed}>Select</button>
                </div>
                <div className="col-sm-10"><strong>{item.title}</strong></div>
              </div>
            </li>
          ))}
        </ul>
        <button className="btn btn-secondary" onClick={props.closeCard}>Cancel</button>
      </div>
    </div>
  );
}

export function MissingRewardsSection(props) {
  if (props.missingRewards.length === 0) {
    return null;
  }
  const [card, setCard] = useState(cards.none);
  const [actionKey, setActionKey] = useState(null);

  function closeCard() {
    setActionKey(null);
    setCard(cards.none);
  }

  function createReward(key) {
    if (actionKey == key && card == cards.create) {
      closeCard();
      return;
    }
    const rewardData = {
    };
    delete rewardData.eventName;
    setActionKey(key);
    setCard(cards.create);
  }

  function useExisting(key) {
    if (actionKey == key && card == cards.existing) {
      closeCard();
      return;
    }
    setActionKey(key);
    setCard(cards.existing);
  }

  if (actionKey && props.missingRewards.indexOf(actionKey) === -1) {
    closeCard();
  }

  return (
    <article className="card bg-dark">
      <header className="card-header">
        Missing rewards
        <span className="badge badge-danger badge-pill" style={{marginLeft: '10px'}}>{props.missingRewards.length}</span>
      </header>
      <div className="card-body">
        <ul className="missing-rewards-list list-group">
          {props.missingRewards.map(key => (
            <li key={key} className="list-group-item list-group-item-dark align-middle">
              <strong>{key}</strong>:&nbsp;
              <button className="btn btn-primary" onClick={() => createReward(key)}>Create reward</button>
              <button className="btn btn-primary" onClick={() => useExisting(key)}>Use existing</button>
              
              {card === cards.create && actionKey === key && <CreateRewardCard actionKey={key} closeCard={closeCard} />}
              {card === cards.existing && actionKey === key && <UseExistingCard actionKey={key} closeCard={closeCard} rewards={props.rewards} />}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
