import React, { useState } from 'react';
import ReactDOM from 'react-dom';

import Typography from '@material-ui/core/Typography';

import ThemeProvider from './ThemeProvider.jsx';
import SceneExplorer from './SceneExplorer.jsx';

function App(props) {
  return (
    <ThemeProvider>
      <Typography variant="h3">Hello</Typography>
      <SceneExplorer />
    </ThemeProvider>
  );
}

ReactDOM.render(<App />, document.getElementById('main'));
