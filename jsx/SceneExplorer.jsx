import React from 'react';
import PropTypes from 'prop-types';
import * as THREE from 'three';

import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import { SceneContext } from './SceneContext.jsx';

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
      undoCount: 0,
      canUndo: false,
    };
  }

  onViewportRegister = (viewport) => {
    this.viewport = viewport;
    this.forceUpdate();
  };

  onCanUndoChanged = (canUndo) => {
    this.setState({ canUndo });
  };

  toggleCamera = () => {
    const { camera } = this.state;
    this.setState({ camera: camera === 'persp' ? 'top' : 'persp' });
  };

  frameScene = () => {
    const { frameSceneCount } = this.state;
    this.setState({ frameSceneCount: frameSceneCount + 1 });
  };

  undoLastMove = () => {
    const { undoCount } = this.state;
    this.setState({ undoCount: undoCount + 1 });
  };

  render() {
    const { camera, frameSceneCount, undoCount, canUndo } = this.state;
    const { nodes } = this.props;
    const undoButton = canUndo ? (
      <ViewportButton
        label="Undo"
        style={{ width: 32 }}
        onClick={this.undoLastMove}
      />
    ) : null;
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
        undoCount={undoCount}
        onRegister={this.onViewportRegister}
        onCanUndoChanged={this.onCanUndoChanged}
        onToggleCamera={this.toggleCamera}
        onFrameScene={this.frameScene}
        topLeft={undoButton}
        topRight={controls}
      >
        {nodes.map(node => (
          <ThreeSceneNode
            key={node.id}
            viewport={this.viewport}
            handle={node.id}
            modelUrl={node.model_url}
            xPos={node.x_pos}
            yPos={node.y_pos}
            zPos={node.z_pos}
          />
        ))}
      </ThreeViewport>
    );
  }
}
SceneExplorer.propTypes = {
  nodes: PropTypes.array,
};

export default (props) => (
  <SceneContext.Consumer>
    {context => (
      <SceneExplorer
        nodes={context.nodes}
        {...props}
      />
    )}
  </SceneContext.Consumer>
);
