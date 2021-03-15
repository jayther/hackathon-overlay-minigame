import React, { useState } from 'react';
import { has } from '../../shared/ObjectUtils';
import appActions from '../../shared/AppActions';
import { clamp01 } from '../../shared/math/JMath';
import SocketBridge from '../utils/SocketBridge';

export function SoundSection(props) {
  const [show, setShow] = useState(false);
  function toggleShow() {
    setShow(!show);
  }
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
    <div>
      <h2>Sounds <button onClick={toggleShow}>{show ? 'Hide' : 'Show'}</button></h2>
      { show && (
        <table className="sound-volumes">
          <tbody>
            {Object.entries(props.appState.soundVolumes).map(([key, volume]) => (
              <tr key={key}>
                <td className="sound-name">{key}</td>
                <td className="sound-slider">
                  <input type="range" min="0" max="1" value={volume}
                    step="0.1"
                    data-soundkey={key}
                    onChange={onVolumeRangeChange}
                  />
                  <input type="number" value={Math.floor(volume * 100)}
                    data-soundkey={key}
                    onChange={onVolumeTextChange}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
