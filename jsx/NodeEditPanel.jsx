import React from 'react';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import { post } from './util.jsx';
import { SceneContext } from './SceneContext.jsx';
import NodePositionControl from './NodePositionControl.jsx';
import ModelSelect from './ModelSelect.jsx';

function NodeEditPanel(props) {
  const { id, xPos, yPos, zPos, modelUrl, onPromptDelete } = props;
  return (
    <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)', padding: '2px 8px', border: '1px solid rgba(0, 0, 0, 0.3)', minWidth: 120 }}>
      <Grid container spacing={1} direction="column">
        <Grid item>
          <Grid container style={{ alignItems: 'center' }}>
            <Grid item style={{ flexGrow: 1 }}>
              <Typography variant="button">
                Node {id}
              </Typography>
            </Grid>
            <Grid item>
              <Button
                size="small"
                variant="outlined"
                color="primary"
                onClick={() => onPromptDelete(id)}
              >
                Delete
              </Button>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <NodePositionControl
            id={id}
            xPos={xPos}
            yPos={yPos}
            zPos={zPos}
          />
        </Grid>
        <Grid item>
          <ModelSelect
            value={modelUrl}
            onChange={(newUrl) => post(`/api/nodes/${id}`, { model_url: newUrl })}
          />
        </Grid>
      </Grid>
    </div>
  );
}
NodeEditPanel.propTypes = {
  id: PropTypes.number.isRequired,
  xPos: PropTypes.number.isRequired,
  yPos: PropTypes.number.isRequired,
  zPos: PropTypes.number.isRequired,
  modelUrl: PropTypes.string,
  onPromptDelete: PropTypes.func.isRequired,
};

export default (props) => (
  <SceneContext.Consumer>
    {context => {
      const node = context.nodes.find(x => x.id === props.id);
      if (!node) return null;
      return (
        <NodeEditPanel
          xPos={node.x_pos}
          yPos={node.y_pos}
          zPos={node.z_pos}
          modelUrl={node.model_url}
          {...props}
        />
      );
    }}
  </SceneContext.Consumer>
);
