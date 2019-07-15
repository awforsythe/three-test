import * as THREE from 'three';

import Viewport from './Viewport.jsx';
import SceneNode from './SceneNode.jsx';

const viewport = new Viewport();
viewport.register();

const helmet = viewport.addNode();

setTimeout(() => {
  helmet.setModel('/models/DamagedHelmet.glb');
}, 5000);

setTimeout(() => {
  helmet.setModel(null);
}, 6000);

setTimeout(() => {
  helmet.setModel('/models/DamagedHelmet.glb');
}, 6500);
