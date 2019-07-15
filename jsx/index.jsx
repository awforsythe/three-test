import * as THREE from 'three';

import Viewport from './Viewport.jsx';
import SceneNode from './SceneNode.jsx';

const viewport = new Viewport();
viewport.register();

const helmet = viewport.addNode({
  position: new THREE.Vector3(-1.0, 2.2, -1.8),
  url: '/models/DamagedHelmet.glb',
});

setTimeout(() => {
  viewport.addNode({
    position: new THREE.Vector3(0.0, 0.6, -0.8),
    url: '/models/DamagedHelmet.glb',
  });
}, 4500);
