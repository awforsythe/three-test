import React from 'react';
import PropTypes from 'prop-types';
import * as THREE from 'three';

import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import { SceneContext } from './SceneContext.jsx';

import ViewportState from './view3d/ViewportState.jsx';
import ViewportEvents from './view3d/ViewportEvents.jsx';

import ThreeViewport from './ThreeViewport.jsx';
import ThreeSceneNode from './ThreeSceneNode.jsx';
import NodeEditPanel from './NodeEditPanel.jsx';

import { post } from './util.jsx';

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
    this.viewport = null;
    this.viewportState = new ViewportState((obj) => this.setState(obj));
    this.state = { ...this.viewportState.get(), canUndo: false };

    this.viewportEvents = new ViewportEvents();
    this.viewportEvents.onRegister = (viewport) => {
      this.viewport = viewport;
      this.forceUpdate();
    };
    this.viewportEvents.onFramePress = () => {
      this.viewportState.frame();
    };
    this.viewportEvents.onToggleCameraPress = () => {
      this.viewportState.toggleCamera();
    };
    this.viewportEvents.onCanUndoChanged = (canUndo) => {
      this.setState({ canUndo });
    };
    this.viewportEvents.onNodeAdd = (xPos, yPos, zPos) => {
      this.viewportState.setAddMode(false);
      post('/api/nodes', { x_pos: xPos, y_pos: yPos, z_pos: zPos });
    };
    this.viewportEvents.onNodeMove = (handle, xPos, yPos, zPos) => {
      post(`/api/nodes/${handle}`, { x_pos: xPos, y_pos: yPos, z_pos: zPos });
    };
    this.viewportEvents.onNodeSelect = (handle) => {
      this.viewportState.setSelectedNodeHandle(handle);
    };
  }

  render() {
    const { cameraType, frameSceneCount, undoCount, canUndo, addMode, selectedNodeHandle } = this.state;
    const { nodes } = this.props;
    const undoButton = canUndo ? (
      <ViewportButton
        label="Undo"
        style={{ width: 32 }}
        onClick={this.viewportState.undo}
      />
    ) : null;
    const controls = (
      <div>
        <ViewportButton
          label="Frame"
          style={{ width: 32, marginRight: 4 }}
          onClick={this.viewportState.frame}
        />
        <ViewportButton
          label={cameraType === 'persp' ? '3D' : 'TOP'}
          style={{ width: 32 }}
          onClick={this.viewportState.toggleCamera}
        />
      </div>
    );
    const addButton = cameraType === 'top' ? (
      <ViewportButton
        label={addMode ? 'CANCEL' : 'ADD'}
        style={{ width: 32 }}
        onClick={this.viewportState.toggleAddMode}
      />
    ) : null;
    const editor = selectedNodeHandle ? (
      <NodeEditPanel id={selectedNodeHandle} />
    ) : null;
    return (
      <ThreeViewport
        viewportState={this.state}
        viewportEvents={this.viewportEvents}
        topLeft={undoButton}
        topRight={controls}
        bottomLeft={editor}
        bottomRight={addButton}
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
