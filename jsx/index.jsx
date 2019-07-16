import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import ThemeProvider from './ThemeProvider.jsx';

import * as THREE from 'three';

import Viewport from './view3d/Viewport.jsx';
import SceneNode from './view3d/SceneNode.jsx';

function addTestModels(viewport) {
  const helmet = viewport.addNode({
    position: new THREE.Vector3(-1.0, 2.2, -1.8),
    url: '/models/DamagedHelmet.glb',
  });

  setTimeout(() => {
    viewport.addNode({
      position: new THREE.Vector3(0.0, 0.6, -0.8),
      url: '/models/DamagedHelmet.glb',
    });
    helmet.setPosition(new THREE.Vector3(-1.2, 2.4, -2.2));
  }, 1500);
}

class ReactViewport extends React.Component {
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
        addTestModels(this.viewport);
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
    console.log(`ReactViewport componentDidUpdate (${prevProps.camera} ==> ${this.props.camera})`);
    if (this.props.camera !== prevProps.camera) {
      this.viewport.setCameraType(this.props.camera);
    }
  }

  setDivRef = (ref) => {
    console.log('ReactViewport setDivRef');
    this.divRef = ref;
  };

  render() {
    const { count, camera } = this.props;
    console.log(`ReactViewport render (count: ${count}, camera: ${camera})`);
    return (
      <React.Fragment>
        <Typography variant="h6">Count is {count}</Typography>
        <Typography variant="h6">Camera: {camera}</Typography>
        <div
          ref={this.setDivRef}
          style={{ width: 800, height: 600, margin: 8, border: '1px solid #999' }}
        />
      </React.Fragment>
    );
  }
}
ReactViewport.propTypes = {
  count: PropTypes.number.isRequired,
  camera: PropTypes.oneOf(['top', 'persp']).isRequired,
  onToggleCamera: PropTypes.func.isRequired,
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count:  0,
      camera: 'persp',
    };
  }

  onToggleCamera = () => {
    const { camera } = this.state;
    this.setState({ camera: camera === 'persp' ? 'top' : 'persp' });
  };

  render() {
    const { count, camera } = this.state;
    return (
      <ThemeProvider>
        <Typography variant="h3">Hello</Typography>
        <ReactViewport
          count={count}
          camera={camera}
          onToggleCamera={this.onToggleCamera}
        />
        <Button
          color="primary"
          variant="contained"
          onClick={() => setCount(count + 1)}
        >
          Increment
        </Button>
        <Button
          color="primary"
          variant="contained"
          onClick={this.onToggleCamera}
        >
          Toggle Camera
        </Button>
      </ThemeProvider>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('main'));
