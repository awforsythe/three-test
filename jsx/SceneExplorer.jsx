import React from 'react';
import PropTypes from 'prop-types';
import * as THREE from 'three';

import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import ThreeViewport from './ThreeViewport.jsx';

const StyledButton = withStyles({
  root: {
    backgroundColor: 'rgba(0, 0, 0, 0.075)',
  },
})(Button);

function ViewportButton(props) {
  const { label, ...others } = props;
  return (
    <StyledButton
      disableRipple
      color="primary"
      variant="outlined"
      {...others}
    >
      {label}
    </StyledButton>
  );
}

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
      frameSceneCount: 0,
    };
  }

  toggleCamera = () => {
    const { camera } = this.state;
    this.setState({ camera: camera === 'persp' ? 'top' : 'persp' });
  };

  frameScene = () => {
    const { frameSceneCount } = this.state;
    this.setState({ frameSceneCount: frameSceneCount + 1 });
  };

  render() {
    const { camera, frameSceneCount } = this.state;
    const controls = (
      <div>
        <ViewportButton
          label="Frame"
          style={{ width: 32, marginRight: 4 }}
          onClick={this.frameScene}
        />
        <ViewportButton
          label={camera === 'persp' ? '3D' : 'TOP'}
          style={{ width: 32 }}
          onClick={this.toggleCamera}
        />
      </div>
    );
    return (
      <ThreeViewport
        camera={camera}
        frameSceneCount={frameSceneCount}
        onRegister={addTestModels}
        onToggleCamera={this.toggleCamera}
        onFrameScene={this.frameScene}
        topRight={controls}
      />
    );
  }
}

export default SceneExplorer;
