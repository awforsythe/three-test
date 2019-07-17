import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';

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
        if (this.props.onRegister) {
          this.props.onRegister(this.viewport);
        }
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
    const { topLeft, topRight } = this.props;
    return (
      <React.Fragment>
        <div
          ref={this.setDivRef}
          style={{ height: '80vh', margin: 8, border: '1px solid #999' }}
        >
          <div style={{ position: 'relative', height: 0 }}>
            {topRight && (
              <div style={{ position: 'absolute', margin: 4, paddingRight: 8, width: '100%', textAlign: 'right' }}>
                {topRight}
              </div>
            )}
            {topLeft && (
              <div style={{ position: 'absolute', margin: 4 }}>
                {topLeft}
              </div>
            )}
          </div>
        </div>
      </React.Fragment>
    );
  }
}
ThreeViewport.propTypes = {
  camera: PropTypes.oneOf(['top', 'persp']).isRequired,
  topLeft: PropTypes.element,
  topRight: PropTypes.element,
  onRegister: PropTypes.func,
  onToggleCamera: PropTypes.func,
};

export default ThreeViewport;
