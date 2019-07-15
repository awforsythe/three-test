import Viewport from './Viewport.jsx';
import SceneNode from './SceneNode.jsx';

const viewport = new Viewport();
viewport.register();

const helmet = viewport.addNode({ url: '/models/DamagedHelmet.glb' });

setTimeout(() => {
  viewport.removeNode(helmet);
}, 5000);
