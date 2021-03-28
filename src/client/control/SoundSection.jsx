import React from 'react';
import { has } from '../../shared/ObjectUtils';
import appActions from '../../shared/AppActions';
import { clamp01 } from '../../shared/math/JMath';
import SocketBridge from '../utils/SocketBridge';

export function SoundSection(props) {
  function onVolumeRangeChange(e) {
    const soundKey = e.target.dataset.soundkey;
    if (!has(props.appState.soundVolumes, soundKey)) {
      console.error(`SoundSection.onVolumeRangeChange: "${soundKey}" is not a valid sound key`);
      return;
    }
    const volume = parseFloat(e.target.value, 10);
    if (isNaN(volume)) {
      console.error(`SoundSection.onVolumeRangeChange: "${e.target.value}" is not a number`);
      return;
    }

    const newObj = {
      ...props.appState.soundVolumes
    };
    newObj[soundKey] = clamp01(volume);
    props.appDispatch({
      type: appActions.updateVolumes,
      value: newObj
    });
    SocketBridge.socket.emit(appActions.updateVolumes, newObj);
  }
  function onVolumeTextChange(e) {
    const soundKey = e.target.dataset.soundkey;
    if (!has(props.appState.soundVolumes, soundKey)) {
      console.error(`SoundSection.onVolumeTextChange: "${soundKey}" is not a valid sound key`);
      return;
    }

    const volume = clamp01(e.target.value / 100);
    const newObj = {
      ...props.appState.soundVolumes
    };
    newObj[soundKey] = volume;
    props.appDispatch({
      type: appActions.updateVolumes,
      value: newObj
    });
    SocketBridge.socket.emit(appActions.updateVolumes, newObj);
  }
  return (
    <section className="container-sm">
      <article className="card bg-dark">
        <header className="card-header">Sounds</header>
        <div className="card-body sound-volumes">
          {Object.entries(props.appState.soundVolumes).map(([key, volume]) => (
            <div key={key} className="row">
              <div className="sound-name col-sm-2">{key}</div>
              <div className="sound-slider form-group col-sm-7">
                <input type="range" className="form-control-range"
                  min="0" max="1" value={volume}
                  step="0.1"
                  data-soundkey={key}
                  onChange={onVolumeRangeChange}
                />
              </div>
              <div className="form-group col-sm-2">
                <input type="number" className="sound-input form-control"
                  value={Math.floor(volume * 100)}
                  data-soundkey={key}
                  onChange={onVolumeTextChange}
                />
              </div>
              <div className="col-sm-1">
                %
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  )
}
