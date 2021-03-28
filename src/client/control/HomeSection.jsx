import React from 'react';
import { PlayersSection } from './PlayersSection';
import { BattleSection } from './BattleSection';

export function HomeSection(props) {
  return (
    <div className="container-fluid">
      <h2>Home</h2>
      <div className="row">
        <div className="col">
          <BattleSection appState={props.appState} />
        </div>  
        <div className="col">
          <PlayersSection players={props.appState.players} />
        </div>
      </div>
    </div>
  );
}
