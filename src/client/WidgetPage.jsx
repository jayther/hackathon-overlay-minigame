import React from 'react';
import { withApp } from './utils/AppContext';
import R from './Resources';
import PlayerChar from './game/PlayerChar';

class WidgetPage extends React.Component {
  constructor(props) {
    super(props);

  }

  render() {
    return (
      <div className="widget-page">
        <PlayerChar anim={{
          sprites: [
            R.frames['Archangel_Female/idle_1.png'],
            R.frames['Archangel_Female/idle_2.png'],
            R.frames['Archangel_Female/idle_3.png']
          ],
          frameDelay: 150
        }} />
      </div>
    )
  }
}

export default withApp(WidgetPage);
