import React, { useState } from 'react';
import ReactDOM from 'react-dom';

import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import { ModelsProvider } from './ModelsContext.jsx';
import { NodesProvider } from './NodesContext.jsx';
import { LinksProvider } from './LinksContext.jsx';

import ThemeProvider from './ThemeProvider.jsx';
import SceneExplorer from './SceneExplorer.jsx';

function App(props) {
  const [enabled, setEnabled] = useState(true);
  return (
    <ThemeProvider>
      <Container maxWidth="lg">
        <div style={{ display: 'flex' }}>
          <Typography
            variant="h4"
            style={{ marginTop: 16, flexGrow: 1 }}
          >
            Three.js Test
          </Typography>
          <Button
            color="primary"
            variant="outlined"
            style={{ marginTop: 16 }}
            onClick={() => setEnabled(!enabled)}
          >
            {enabled ? 'Unmount' : 'Mount'}
          </Button>
        </div>
        <hr />
        <ModelsProvider>
          <NodesProvider>
            <LinksProvider>
              {enabled && <SceneExplorer />}
            </LinksProvider>
          </NodesProvider>
        </ModelsProvider>
        <hr />
      </Container>
    </ThemeProvider>
  );
}

ReactDOM.render(<App />, document.getElementById('main'));
