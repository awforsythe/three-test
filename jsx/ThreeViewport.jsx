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
        this.viewport = new Viewport(this.divRef, this.props.camera, this.props.onCanUndoChanged, this.props.onAddNodeClick, {
          84: { pressEvent: this.props.onToggleCamera },
          70: { pressEvent: this.props.onFrameScene },
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
    if (this.props.frameSceneCount !== prevProps.frameSceneCount) {
      this.viewport.frameSelection();
    }
    if (this.props.undoCount !== prevProps.undoCount) {
      this.viewport.undoLastMove();
    }
    if (this.props.addMode !== prevProps.addMode) {
      this.viewport.setAddMode(this.props.addMode);
    }
  }

  setDivRef = (ref) => {
    this.divRef = ref;
  };

  render() {
    const { topLeft, topRight, bottomLeft, bottomRight, children } = this.props;
    return (
      <React.Fragment>
        <div
          ref={this.setDivRef}
          style={{ height: '80vh', margin: 8, border: '1px solid #999', position: 'relative' }}
        >
          <div style={{ position: 'absolute', width: '100%', height: '100%', padding: 4, visibility: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', visibility: 'hidden' }}>
              <div style={{ visibility: 'visible' }}>
                {topLeft}
              </div>
              <div style={{ visibility: 'hidden', flexGrow: 1 }}>
              </div>
              <div style={{ visibility: 'visible' }}>
                {topRight}
              </div>
            </div>
            <div style={{ visibility: 'hidden', flexGrow: 1 }}>
            </div>
            <div style={{ display: 'flex', visibility: 'hidden' }}>
              <div style={{ visibility: 'visible' }}>
                {bottomLeft}
              </div>
              <div style={{ visibility: 'hidden', flexGrow: 1 }}>
              </div>
              <div style={{ visibility: 'visible' }}>
                {bottomRight}
              </div>
            </div>
          </div>
        </div>
        {React.Children.map(children, (x) => !!x.props.viewport).every((x) => x === true) && children}
      </React.Fragment>
    );
  }
}
ThreeViewport.propTypes = {
  camera: PropTypes.oneOf(['top', 'persp']).isRequired,
  frameSceneCount: PropTypes.number.isRequired,
  undoCount: PropTypes.number.isRequired,
  onCanUndoChanged: PropTypes.func,
  onAddNodeClick: PropTypes.func,
  addMode: PropTypes.bool,
  topLeft: PropTypes.element,
  topRight: PropTypes.element,
  bottomLeft: PropTypes.element,
  bottomRight: PropTypes.element,
  onRegister: PropTypes.func,
  onToggleCamera: PropTypes.func,
  onFrameScene: PropTypes.func,
};

export default ThreeViewport;
