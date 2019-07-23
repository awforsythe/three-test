import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import Input from '@material-ui/core/Input';

import { post } from './util.jsx';

function NodePositionControl(props) {
  const { id, xPos, yPos, zPos } = props;
  const handleBlur = (component, value) => {
    const prevValue = component === 0 ? xPos : (component === 1 ? yPos : zPos);
    const newValue = Number.parseFloat(value);
    if (Math.abs(prevValue - newValue) > 0.00001) {
      const field = component === 0 ? 'x_pos' : (component === 1 ? 'y_pos' : 'z_pos');
      post(`/api/nodes/${id}`, { [field]: newValue });
    }
  };

  return (
    <Grid container spacing={1}>
      <Grid item>
        <Input
          label="X"
          defaultValue={xPos.toPrecision(4)}
          onBlur={(event) => handleBlur(0, event.target.value)}
        />
      </Grid>
      <Grid item>
        <Input
          label="Y"
          defaultValue={yPos.toPrecision(4)}
          onBlur={(event) => handleBlur(1, event.target.value)}
        />
      </Grid>
      <Grid item>
        <Input
          label="Z"
          defaultValue={zPos.toPrecision(4)}
          onBlur={(event) => handleBlur(2, event.target.value)}
        />
      </Grid>
    </Grid>
  );
}
NodePositionControl.propTypes = {
  id: PropTypes.number.isRequired,
  xPos: PropTypes.number.isRequired,
  yPos: PropTypes.number.isRequired,
  zPos: PropTypes.number.isRequired,
};

export default NodePositionControl;
