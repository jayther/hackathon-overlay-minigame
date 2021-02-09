import React, { useState } from 'react';
import { withApp, pageStates, appActions } from './utils/AppContext';
import SocketBridge from './utils/SocketBridge';
import Deferred from './utils/Deferred';


function waitForAppReadyData(props) {
  console.log('Waiting for app ready...');
  const deferred = new Deferred();

  SocketBridge.socket.once('appready', appReady => {
    props.appDispatch({ type: appActions.updateApp, appReady });
    console.log(`App ready received (${appReady})`);
    deferred.resolve();
  });

  return deferred.promise;
}

async function sendDetails(props, setSent, setError, clientId, clientSecret) {
  if (!clientId) {
    setError('Invalid Client ID');
    return;
  }
  if (!clientSecret) {
    setError('Invalid Client Secret');
    return;
  }
  setSent(true);
  console.log('Sending app details...');
  SocketBridge.emit('appsetup', clientId, clientSecret);
  await waitForAppReadyData(props);
  console.log('App details sent');
}

function SetupApp(props) {
  const [ clientId, setClientId ] = useState('');
  const [ clientSecret, setClientSecret ] = useState('');
  const [ sent, setSent ] = useState(false);
  const [ error, setError ] = useState('');
  return (
    <div>
      <h1>Setup App</h1>
      <table>
        <tbody>
          <tr>
            <td>Client Id</td>
            <td><input type="text" value={clientId} onChange={e => setClientId(e.target.value)} /></td>
          </tr>
          <tr>
            <td>Client Secret</td>
            <td><input type="password" value={clientSecret} onChange={e => setClientSecret(e.target.value)}/></td>
          </tr>
          <tr>
            <td></td>
            <td><button disabled={sent} onClick={() => sendDetails(props, setSent, setError, clientId, clientSecret)}>Submit</button></td>
          </tr>
          <tr>
            <td></td>
            <td>{error || null}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default withApp(SetupApp);
