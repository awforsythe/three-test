import React from 'react';
import PropTypes from 'prop-types';
import * as THREE from 'three';

import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import { NodesContext } from './NodesContext.jsx';
import { LinksContext } from './LinksContext.jsx';

import ViewportState from './view3d/ViewportState.jsx';
import ViewportEvents from './view3d/ViewportEvents.jsx';

import ThreeViewport from './ThreeViewport.jsx';
import ThreeSceneNode from './ThreeSceneNode.jsx';
import NodeEditPanel from './NodeEditPanel.jsx';
import NodeDeleteConfirmDialog from './NodeDeleteConfirmDialog.jsx';

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
    this.state = {
      canUndo: false,
      deleteDialogId: null,
      ...this.viewportState.get(),
    };

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
    this.viewportEvents.onSelectionChange = (type, handle) => {
      this.viewportState.setSelection(type, handle);
    };
  }

  handleDeletePrompt = (nodeId) => {
    this.setState({ deleteDialogId: nodeId });
  };

  handleDeleteConfirm = (nodeId) => {
    fetch(`/api/nodes/${nodeId}`, { method: 'DELETE' });
  };

  handleDeleteClose = () => {
    this.setState({ deleteDialogId: null });
  };

  render() {
    const { canUndo, deleteDialogId, cameraType, addMode, selection } = this.state;
    const { nodes, links } = this.props;
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
    const editor = selection.type === 'node' && selection.handle ? (
      <NodeEditPanel
        id={selection.handle}
        onPromptDelete={this.handleDeletePrompt}
      />
    ) : null;
    return (
      <React.Fragment>
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
        <NodeDeleteConfirmDialog
          nodeId={deleteDialogId}
          onConfirm={this.handleDeleteConfirm}
          onClose={this.handleDeleteClose}
        />
        <ul>
          {links.map(x => <li key={x.id}>Link {x.id}: from {x.src_node_id} to {x.dst_node_id}</li>)}
        </ul>
      </React.Fragment>
    );
  }
}
SceneExplorer.propTypes = {
  nodes: PropTypes.array,
  links: PropTypes.array,
};

export default (props) => (
  <NodesContext.Consumer>
    {nodesContext => (
      <LinksContext.Consumer>
        {linksContext => (
          <SceneExplorer
            nodes={nodesContext.nodes}
            links={linksContext.links}
            {...props}
          />
        )}
      </LinksContext.Consumer>
    )}
  </NodesContext.Consumer>
);
