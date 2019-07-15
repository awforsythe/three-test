import * as THREE from 'three';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import Hotkeys from './Hotkeys.jsx';
import Controls from './Controls.jsx';
import Environment from './Environment.jsx';
import SceneNode from './SceneNode.jsx';

class Viewport {
  constructor() {
    THREE.Cache.enabled = true;

    this.hotkeys = new Hotkeys({
      70: { pressEvent: this.frameAll },
    });

    this.camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1.0, 8000.0);
    this.scene = new THREE.Scene();
    this.environment = new Environment(this.scene);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.controls = new Controls(this.camera, this.renderer.domElement);

    this.camera.position.set(10, 10, 10);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

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
      document.addEventListener('keydown', this.onKeyDown);
      document.addEventListener('keyup', this.onKeyUp);
      window.addEventListener('resize', this.onWindowResize, false);
      this.animate();
    }
  }

  unregister() {
    if (this.registered) {
      this.registered = false;
      window.removeEventListener('resize', this.onWindowResize, false);
      document.body.removeChild(this.renderer.domElement);
      document.removeEventListener('keydown', this.onKeyDown);
      document.removeEventListener('keyup', this.onKeyUp);
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

  getSceneBoundingBox() {
    if (!this.nodes) {
      const s = 5.0;
      return new THREE.Box3(new THREE.Vector3(-s, -s, -s), new THREE.Vector3(s, s, s));
    }

    let min = new THREE.Vector3(Infinity, Infinity, Infinity);
    let max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
    for (const node of this.nodes) {
      const aabb = new THREE.Box3().setFromObject(node.box);
      if (aabb.min.x < min.x) { min.x = aabb.min.x; }
      if (aabb.min.y < min.y) { min.y = aabb.min.y; }
      if (aabb.min.z < min.z) { min.z = aabb.min.z; }
      if (aabb.max.x > max.x) { max.x = aabb.max.x; }
      if (aabb.max.y > max.y) { max.y = aabb.max.y; }
      if (aabb.max.z > max.z) { max.z = aabb.max.z; }
    }
    return new THREE.Box3(min, max);
  }

  frameAll = () => {
    const aabb = this.getSceneBoundingBox();
    this.controls.frame(aabb);
  };

  onKeyDown = (event) => {
    this.hotkeys.onKeyDown(event.keyCode);
  };

  onKeyUp = (event) => {
    this.hotkeys.onKeyUp(event.keyCode);
  };

  onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  animate = () => {
    if (this.registered) {
      requestAnimationFrame(this.animate);
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    }
  };
}

export default Viewport;
