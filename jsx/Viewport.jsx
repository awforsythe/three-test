import * as THREE from 'three';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import Camera from './Camera.jsx';
import Environment from './Environment.jsx';
import SceneNode from './SceneNode.jsx';

class Viewport {
  constructor() {
    THREE.Cache.enabled = true;

    this.camera = new Camera();
    this.scene = new THREE.Scene();
    this.environment = new Environment(this.scene);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.controls = new OrbitControls(this.camera.camera, this.renderer.domElement);

    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    this.cube = new THREE.Mesh(geometry, material);
    this.scene.add(this.cube);

    this.camera.camera.position.set(10, 10, 10);
    this.camera.camera.lookAt(this.cube.position);

    this.renderer.gammaInput = true;
    this.renderer.gammaOutput = true;
    this.renderer.shadowMap.enabled = true;

    this.loader = new GLTFLoader();

    this.nodes = [];

    this.registered = false;
  }

  register() {
    if (!this.registered) {
      this.registered = true;
      document.body.appendChild(this.renderer.domElement);
      window.addEventListener('resize', this.onWindowResize, false);
      this.animate();
    }
  }

  unregister() {
    if (this.registered) {
      this.registered = false;
      window.removeEventListener('resize', this.onWindowResize, false);
      document.body.removeChild(this.renderer.domElement);
    }
  }

  addNode(options) {
    const node = new SceneNode(this.loader, options);
    this.nodes.push(node);
    this.scene.add(node.root);
    return node;
  }

  removeNode(node) {
    const index = this.nodes.findIndex(x => x == node);
    if (index >= 0) {
      this.nodes.splice(index, 1);
      this.scene.remove(node.root);
    }
  }

  onWindowResize = () => {
    this.camera.onResize(window.innerWidth, window.innerHeight);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  animate = () => {
    if (this.registered) {
      requestAnimationFrame(this.animate);
      this.controls.update();
      this.renderer.render(this.scene, this.camera.camera);
    }
  };
}

export default Viewport;
