import React from 'react';
import PropTypes from 'prop-types';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

function NodeDeleteConfirmDialog(props) {
  const { nodeId, onClose, onConfirm } = props;
  return (
    <Dialog fullWidth maxWidth="sm" open={!!nodeId} onClose={onClose}>
      <DialogTitle>
        Delete node {nodeId}?
      </DialogTitle>
      <DialogContent>
        <Typography>Deleting a node is irreversible.</Typography>
        <Typography>&nbsp;</Typography>
        <Grid container spacing={1} style={{ marginBottom: 8 }}>
          <Grid item style={{ flexGrow: 1 }}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={() => { onConfirm(nodeId); onClose(); }}
            >
              Delete
            </Button>
          </Grid>
          <Grid item style={{ flexGrow: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
NodeDeleteConfirmDialog.propTypes = {
  nodeId: PropTypes.number,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default NodeDeleteConfirmDialog;
