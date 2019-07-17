import React from 'react';
import PropTypes from 'prop-types';
import * as THREE from 'three';

class ThreeSceneNode extends React.Component {
  constructor(props) {
    super(props);
    this.node = null;
  }

  componentDidMount() {
    const { viewport, xPos, yPos, zPos, modelUrl } = this.props;
    this.node = viewport.addNode({
      position: new THREE.Vector3(xPos, yPos, zPos),
      url: modelUrl,
    });
  }

  componentWillUnmount() {
    this.node = null;
  }

  componentDidUpdate(prevProps) {
    const { xPos, yPos, zPos, modelUrl } = this.props;
    if (prevProps.xPos !== xPos || prevProps.yPos !== yPos || prevProps.zPos !== zPos) {
      this.node.setPosition(new THREE.Vector3(xPos, yPos, zPos));
    }
    if (prevProps.modelUrl !== modelUrl) {
      this.node.setModel(modelUrl);
    }
  }

  render() {
    return null;
  }
}
ThreeSceneNode.propTypes = {
  viewport: PropTypes.object,
  xPos: PropTypes.number.isRequired,
  yPos: PropTypes.number.isRequired,
  zPos: PropTypes.number.isRequired,
  modelUrl: PropTypes.string.isRequired,
};

export default ThreeSceneNode;
