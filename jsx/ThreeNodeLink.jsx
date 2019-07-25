import React from 'react';
import PropTypes from 'prop-types';
import * as THREE from 'three';

class ThreeNodeLink extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { viewport, handle, srcNodeHandle, dstNodeHandle } = this.props;
    viewport.scene.addLink(handle, srcNodeHandle, dstNodeHandle);
  }

  componentWillUnmount() {
    const { viewport, handle } = this.props;
    viewport.scene.removeLink(handle);
  }

  render() {
    return null;
  }
}
ThreeNodeLink.propTypes = {
  viewport: PropTypes.object,
  handle: PropTypes.number.isRequired,
  srcNodeHandle: PropTypes.number.isRequired,
  dstNodeHandle: PropTypes.number.isRequired,
};

export default ThreeNodeLink;
