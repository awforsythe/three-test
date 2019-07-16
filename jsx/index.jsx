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
        this.viewport = new Viewport(this.divRef);
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

  setDivRef = (ref) => {
    console.log('ReactViewport setDivRef');
    this.divRef = ref;
  };

  render() {
    const { count } = this.props;
    console.log(`ReactViewport render (count: ${count})`);
    return (
      <React.Fragment>
        <Typography variant="h6">Count is {count}</Typography>
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
};

function App(props) {
  const [count, setCount] = useState(0);
  return (
    <ThemeProvider>
      <Typography variant="h3">Hello</Typography>
      <ReactViewport count={count} />
      <Button
        color="primary"
        variant="contained"
        onClick={() => setCount(count + 1)}
      >
        Increment
      </Button>
    </ThemeProvider>
  );
}

ReactDOM.render(<App />, document.getElementById('main'));
