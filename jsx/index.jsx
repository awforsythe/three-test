import Viewport from './Viewport.jsx';
import SceneProxy from './SceneProxy.jsx';

const viewport = new Viewport();
viewport.register();

const helmet = new SceneProxy(viewport, '/models/DamagedHelmet.glb');
