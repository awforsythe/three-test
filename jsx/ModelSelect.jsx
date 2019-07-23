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
  const [ value, setValue ] = useState('');
  const { modelUrls } = props;
  return (
    <Select value={value} onChange={(event) => setValue(event.target.value)}>
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
