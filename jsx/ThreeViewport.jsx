import React from 'react';
import PropTypes from 'prop-types';

import Viewport from './view3d/Viewport.jsx';

class ThreeViewport extends React.Component {
  constructor(props) {
    super(props);
    this.viewport = null;
    this.divRef = null;
  }

  componentDidMount() {
    if (!this.viewport) {
      if (this.divRef) {
        this.viewport = new Viewport(this.divRef, this.props.camera, {
          84: { pressEvent: this.props.onToggleCamera },
        });
        this.viewport.register();
        this.props.onRegisterViewport(this.viewport);
      } else {
        console.error('ERROR: Component mounted without valid div ref');
      }
    } else {
      console.error('ERROR: Component mounted with viewport still active');
    }
  }

  componentWillUnmount() {
    if (this.viewport) {
      this.viewport.unregister();
      this.viewport = null;
    } else {
      console.error('ERROR: Component unmounted without active viewport');
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.camera !== prevProps.camera) {
      this.viewport.setCameraType(this.props.camera);
    }
  }

  setDivRef = (ref) => {
    this.divRef = ref;
  };

  render() {
    return (
      <React.Fragment>
        <div
          ref={this.setDivRef}
          style={{ width: 1280, height: 720, margin: 8, border: '1px solid #999' }}
        />
      </React.Fragment>
    );
  }
}
ThreeViewport.propTypes = {
  camera: PropTypes.oneOf(['top', 'persp']).isRequired,
  onRegisterViewport: PropTypes.func.isRequired,
  onToggleCamera: PropTypes.func.isRequired,
};

export default ThreeViewport;
