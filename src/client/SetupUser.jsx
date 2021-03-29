import React from 'react';

import CenterCon from './CenterCon';

const pages = {
  user: {
    title: 'Setup User',
    url: '/authorize',
    label: 'Start User Authorization',
    help: '(Your streaming Twitch account)'
  },
  bot: {
    title: 'Setup Chatbot',
    url: '/authorize-chatbot',
    label: 'Start Chatbot Authorization',
    help: '(for separate Twitch account for chatbot, open in incognito mode or another browser)'
  }
};

function SetupUser(props) {
  const page = props.bot ? pages.bot : pages.user;
  return (<CenterCon>
    <article className="card card-block bg-dark">
      <header className="card-header">{page.title}</header>
      <div className="card-body">
        <p><a className="btn btn-primary" href={page.url} rel="noreferrer" target="_blank">{page.label}</a></p>
        <p>{page.help}</p>
      </div>
    </article>
  </CenterCon>);
}

export default SetupUser;
