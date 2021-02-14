import React from 'react';
import { withApp } from './utils/AppContext';

class WidgetPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <div>
        <h1>Widget</h1>
      </div>
    )
  }
}

export default withApp(WidgetPage);
