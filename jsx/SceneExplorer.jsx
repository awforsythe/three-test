import React from 'react';
import PropTypes from 'prop-types';
import * as THREE from 'three';

import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import ThreeViewport from './ThreeViewport.jsx';
import ThreeSceneNode from './ThreeSceneNode.jsx';

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

class SceneExplorer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      camera: 'persp',
      frameSceneCount: 0,
      yPos: 1.0,
    };
  }

  onViewportRegister = (viewport) => {
    this.viewport = viewport;
    this.forceUpdate();
  };

  nudgeTestModelUp = () => {
    const { yPos } = this.state;
    this.setState({ yPos: yPos + 0.1 });
  };

  nudgeTestModelDown = () => {
    const { yPos } = this.state;
    this.setState({ yPos: yPos - 0.1 });
  };

  toggleCamera = () => {
    const { camera } = this.state;
    this.setState({ camera: camera === 'persp' ? 'top' : 'persp' });
  };

  frameScene = () => {
    const { frameSceneCount } = this.state;
    this.setState({ frameSceneCount: frameSceneCount + 1 });
  };

  render() {
    const { camera, frameSceneCount, yPos } = this.state;
    const nudgeButtons = (
      <div>
        <ViewportButton
          label="Up"
          style={{ width: 32 }}
          onClick={this.nudgeTestModelUp}
        />
        <ViewportButton
          label="Down"
          style={{ width: 32, marginLeft: 4 }}
          onClick={this.nudgeTestModelDown}
        />
      </div>
    );
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
        onRegister={this.onViewportRegister}
        onToggleCamera={this.toggleCamera}
        onFrameScene={this.frameScene}
        topLeft={nudgeButtons}
        topRight={controls}
      >
        <ThreeSceneNode
          viewport={this.viewport}
          xPos={0.0} yPos={yPos} zPos={0.0}
          modelUrl="/models/DamagedHelmet.glb"
        />
        <ThreeSceneNode
          viewport={this.viewport}
          xPos={2.0} yPos={0.5} zPos={0.0}
          modelUrl="/models/DamagedHelmet.glb"
        />
      </ThreeViewport>
    );
  }
}

export default SceneExplorer;
