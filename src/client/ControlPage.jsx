import React, { useState } from 'react';
import { withApp } from './utils/AppContext';
import requiredRewards from '../shared/RequiredRewards';
import { HomeSection } from './control/HomeSection';
import { DebugSection } from './control/DebugSection';
import { PlayersSection } from './control/PlayersSection';
import { BattleSection } from './control/BattleSection';
import { SettingsSection } from './control/SettingsSection';
import { SoundSection } from './control/SoundSection';
import { AboutSection } from './control/AboutSection';

const pages = {
  home: 'home',
  players: 'players',
  battles: 'battles',
  rewards: 'rewards',
  sounds: 'sounds',
  debug: 'debug',
  about: 'about'
};

function navItemClass(page, currentPage) {
  return page === currentPage ? 'nav-item active' : 'nav-item';
}

function NavItem(props) {
  return (
    <li className={navItemClass(props.page, props.currentPage)}>
      <a className="nav-link" href="#" onClick={e => {
        e.preventDefault();
        props.setPage(props.page);
        return false
      }}>
        {props.children}
      </a>
    </li>
  );
}

function SectionPage(props) {
  switch (props.currentPage) {
    case pages.home:
      return (
        <HomeSection appState={props.appState} />
      );
    case pages.players:
      return (
        <PlayersSection players={props.appState.players} />
      );
    case pages.battles:
      return (
        <BattleSection appState={props.appState} showSettings={true} />
      );
    case pages.rewards:
      return (
        <SettingsSection appState={props.appState} />
      );
    case pages.sounds:
      return (
        <SoundSection appState={props.appState} appDispatch={props.appDispatch} />
      );
    case pages.debug:
      return (
        <DebugSection appState={props.appState} />
      );
    case pages.about:
      return (
        <AboutSection />
      );
    default: 
      return (
        <div className="alert alert-danger">Unknown page</div>
      );
  }
}

function ControlPage(props) {
  const [page, setPage] = useState(pages.home);

  const mappedActions = Object.values(props.appState.rewardMap);
  const missingRewards = Object.keys(requiredRewards).filter(key => !mappedActions.includes(key));

  return (
    <div>
      <nav id="main-nav" className="navbar navbar-expand-lg navbar-dark">
        <span className="navbar-brand">Control Panel</span>
        <button className="navbar-toggler" type="button"
          data-toggle="collapse" data-target="#navbar-content"
          aria-controls="navbar-content" aria-expanded="false"
          aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbar-content">
          <ul className="navbar-nav mr-auto">
            <NavItem page={pages.home} setPage={setPage} currentPage={page}>Home</NavItem>
            <NavItem page={pages.players} setPage={setPage} currentPage={page}>Players</NavItem>
            <NavItem page={pages.battles} setPage={setPage} currentPage={page}>Duels</NavItem>
            <NavItem page={pages.rewards} setPage={setPage} currentPage={page}>Rewards {
              missingRewards.length > 0 && (
                <span className="badge badge-danger badge-pill" style={{marginLeft: '5px'}}>{missingRewards.length}</span>
              )
            }</NavItem>
            <NavItem page={pages.sounds} setPage={setPage} currentPage={page}>Sounds</NavItem>
            <NavItem page={pages.debug} setPage={setPage} currentPage={page}>Debug</NavItem>
            <NavItem page={pages.about} setPage={setPage} currentPage={page}>About</NavItem>
          </ul>
        </div>
      </nav>
      { missingRewards.length > 0 && page !== pages.rewards && (
        <div className="container-fluid">
          <div className="alert alert-warning">
            Missing reward mapping. Please set them in <a href="#" onClick={e => {
              e.preventDefault();
              setPage(pages.rewards);
              return false;
            }}>Rewards</a>.
          </div>
        </div>
      )}
      <SectionPage appState={props.appState} appDispatch={props.appDispatch} currentPage={page} />
      <footer className="main-footer">&copy; 2021 Jayther. All Rights Reserved.</footer>
    </div>
  );
}

export default withApp(ControlPage);
