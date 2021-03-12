import React from 'react';

function SetupUser(props) {
  return props.bot ? (
    <p>Setup Chatbot Page <a href="/authorize-chatbot" rel="external" target="_blank">Start authorization</a> (for separate Twitch account for chatbot, open in incognito mode or another browser)</p>
  ) : (
    <p>Setup User Page <a href="/authorize" rel="external" target="_blank">Start authorization</a></p>
  );
}

export default SetupUser;
