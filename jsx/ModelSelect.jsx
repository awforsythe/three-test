import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import { ModelsContext } from './ModelsContext.jsx';

function getDisplayName(url) {
  const index = url.lastIndexOf('/');
  if (index >= 0 && index + 1 < url.length) {
    return url.slice(index + 1);
  }
  return url;
}

function ModelSelect(props) {
  const { modelUrls, value, onChange } = props;
  return (
    <Select
      fullWidth
      value={value || ''}
      onChange={(event) => onChange(event.target.value)}
    >
      <MenuItem value={''}><em>None</em></MenuItem>
      {modelUrls.map(url => (
        <MenuItem key={url} value={url}>
          {getDisplayName(url)}
        </MenuItem>
      ))}
    </Select>
  );
}
ModelSelect.propTypes = {
  modelUrls: PropTypes.array,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export default (props) => (
  <ModelsContext.Consumer>
    {context => (
      <ModelSelect
        modelUrls={context.models}
        {...props}
      />
    )}
  </ModelsContext.Consumer>
);
