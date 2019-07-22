import React, { useState } from 'react';
import ReactDOM from 'react-dom';

import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';

import { SceneProvider } from './SceneContext.jsx';

import ThemeProvider from './ThemeProvider.jsx';
import SceneExplorer from './SceneExplorer.jsx';

function App(props) {
  return (
    <ThemeProvider>
      <Container maxWidth="lg">
        <Typography variant="h4" style={{ marginTop: 16 }}>Three.js Test</Typography>
        <hr />
        <SceneProvider>
          <SceneExplorer />
        </SceneProvider>
        <hr />
      </Container>
    </ThemeProvider>
  );
}

ReactDOM.render(<App />, document.getElementById('main'));
