import React from 'react';
import PropTypes from 'prop-types';
import * as THREE from 'three';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import ThreeViewport from './ThreeViewport.jsx';

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

class SceneExplorer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      camera: 'persp',
    };
  }

  toggleCamera = () => {
    const { camera } = this.state;
    this.setState({ camera: camera === 'persp' ? 'top' : 'persp' });
  };

  render() {
    const { camera } = this.state;
    return (
      <React.Fragment>
        <Typography variant="h6">Camera: {camera}</Typography>
        <ThreeViewport
          camera={camera}
          onRegister={addTestModels}
          onToggleCamera={this.toggleCamera}
        />
        <Button
          color="primary"
          variant="contained"
          onClick={this.toggleCamera}
        >
          Toggle Camera
        </Button>
      </React.Fragment>
    );
  }
}

export default SceneExplorer;
