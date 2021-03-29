import React, { useState } from 'react';
import { withApp, appActions } from './utils/AppContext';
import SocketBridge from './utils/SocketBridge';
import Deferred from './utils/Deferred';
import CenterCon from './CenterCon';

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
  return (<CenterCon>
    <article className="card card-block bg-dark">
      <header className="card-header">Setup App</header>
      <div className="card-body">
        <div className="form-group">
          <label>Client Id</label>
          <input type="text" className="form-control" value={clientId} onChange={e => setClientId(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Client Secret</label>
          <input type="password" className="form-control" value={clientSecret} onChange={e => setClientSecret(e.target.value)}/>
        </div>
        <button className="btn btn-primary" disabled={sent} onClick={() => sendDetails(props, setSent, setError, clientId, clientSecret)}>Submit</button>
        {error && <div className="alert alert-danger">{error}</div>}
      </div>
    </article>
  </CenterCon>);
}

export default withApp(SetupApp);
