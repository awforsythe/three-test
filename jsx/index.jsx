import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import ThemeProvider from './ThemeProvider.jsx';
import ThreeViewport from './ThreeViewport.jsx';

import * as THREE from 'three';

function addTestModels(viewport) {
  const helmet = viewport.addNode({
    position: new THREE.Vector3(-1.0, 2.2, -1.8),
    url: '/models/DamagedHelmet.glb',
  });

  setTimeout(() => {
    viewport.addNode({
      position: new THREE.Vector3(0.0, 0.6, -0.8),
      url: '/models/DamagedHelmet.glb',
    });
    helmet.setPosition(new THREE.Vector3(-4.2, 2.4, -2.2));
  }, 1500);
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      camera: 'persp',
    };
  }

  onToggleCamera = () => {
    const { camera } = this.state;
    this.setState({ camera: camera === 'persp' ? 'top' : 'persp' });
  };

  render() {
    const { camera } = this.state;
    return (
      <ThemeProvider>
        <Typography variant="h3">Hello</Typography>
        <ThreeViewport
          camera={camera}
          onRegisterViewport={addTestModels}
          onToggleCamera={this.onToggleCamera}
        />
        <Button
          color="primary"
          variant="contained"
          onClick={this.onToggleCamera}
        >
          Toggle Camera
        </Button>
      </ThemeProvider>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('main'));
