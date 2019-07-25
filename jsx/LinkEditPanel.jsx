import React from 'react';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import { LinksContext } from './LinksContext.jsx';

function LinkEditPanel(props) {
  const { id, srcNodeId, dstNodeId, onDeleteClick } = props;
  return (
    <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)', padding: '2px 8px', border: '1px solid rgba(0, 0, 0, 0.3)', minWidth: 120 }}>
      <Grid container spacing={1} direction="column">
        <Grid item>
          <Grid container style={{ alignItems: 'center' }}>
            <Grid item style={{ flexGrow: 1 }}>
              <Typography variant="button">
                Link {id}
              </Typography>
            </Grid>
            <Grid item>
              <Button
                size="small"
                variant="outlined"
                color="primary"
                onClick={() => onDeleteClick(id)}
              >
                Delete
              </Button>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Typography>From node {srcNodeId} to node {dstNodeId}</Typography>
        </Grid>
      </Grid>
    </div>
  );
}
LinkEditPanel.propTypes = {
  id: PropTypes.number.isRequired,
  srcNodeId: PropTypes.number.isRequired,
  dstNodeId: PropTypes.number.isRequired,
  onDeleteClick: PropTypes.func.isRequired,
};

export default (props) => (
  <LinksContext.Consumer>
    {context => {
      const link = context.links.find(x => x.id === props.id);
      if (!link) return null;
      return (
        <LinkEditPanel
          srcNodeId={link.src_node_id}
          dstNodeId={link.dst_node_id}
          {...props}
        />
      );
    }}
  </LinksContext.Consumer>
);
