import React from 'react';

export function AboutSection(props) {
  return (
    <section className="container">
      <article className="card bg-dark">
        <header className="card-header">About</header>
        <div className="card-body">
          <div className="row">
            <div className="col-sm-3 font-weight-bold text-right">
              Creator:
            </div>
            <div className="col-sm-9">
              Jayther
            </div>
          </div>
          <div className="row">
            <div className="col-sm-3 font-weight-bold text-right">
              Twitch JS Library:
            </div>
            <div className="col-sm-9">
              <a href="https://github.com/d-fischer/twitch" rel="noreferrer" target="_blank">
                <em>Twitch.js</em>
              </a> by d-fischer
            </div>
          </div>
          <div className="row">
            <div className="col-sm-3 font-weight-bold text-right">
              Fighter Graphics:
            </div>
            <div className="col-sm-9">
              <a href="https://cleancutgames.itch.io/pixelart-fantasy-characters" rel="noreferrer" target="_blank">
                <em>Medieval Fantasy Characters</em>
              </a> by CleanCutGames
            </div>
          </div>
          <div className="row">
            <div className="col-sm-3 font-weight-bold text-right">
              Arena Graphics:
            </div>
            <div className="col-sm-9">
              <a href="https://s4m-ur4i.itch.io/huge-pixelart-asset-pack" rel="noreferrer" target="_blank">
                <em>HUGE pixelart asset pack</em>
              </a> by s4m-ur4i
            </div>
          </div>
          <div className="row">
            <div className="col-sm-3 font-weight-bold text-right">
              HP Bar Graphics:
            </div>
            <div className="col-sm-9">
              <a href="https://kenney.nl/" rel="noreferrer" target="_blank">
                <em>Kenney.nl</em>
              </a>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-3 font-weight-bold text-right">
              Music and SFX:
            </div>
            <div className="col-sm-9">
              <a href="https://joelsteudler.itch.io/8-bit-action-music-sfx" rel="noreferrer" target="_blank">
                <em>8-bit Action Music &amp; SFX</em>
              </a> by Joel Steudler
            </div>
          </div>
          <div className="row">
            <div className="col-sm-3 font-weight-bold text-right">
              Control Panel Style:
            </div>
            <div className="col-sm-9">
              <a href="https://getbootstrap.com/" rel="noreferrer" target="_blank">
                <em>Bootstrap</em>
              </a>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}
