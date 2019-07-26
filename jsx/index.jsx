import React, { useState } from 'react';
import ReactDOM from 'react-dom';

import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';

import { ModelsProvider } from './ModelsContext.jsx';
import { NodesProvider } from './NodesContext.jsx';
import { LinksProvider } from './LinksContext.jsx';

import ThemeProvider from './ThemeProvider.jsx';
import SceneExplorer from './SceneExplorer.jsx';

function App(props) {
  return (
    <ThemeProvider>
      <Container maxWidth="xl">
        <Typography variant="h4" style={{ marginTop: 16 }}>Three.js Test</Typography>
        <hr />
        <ModelsProvider>
          <NodesProvider>
            <LinksProvider>
              <SceneExplorer />
            </LinksProvider>
          </NodesProvider>
        </ModelsProvider>
        <hr />
      </Container>
    </ThemeProvider>
  );
}

ReactDOM.render(<App />, document.getElementById('main'));
