import * as THREE from 'three';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import Hotkeys from './Hotkeys.jsx';
import Controls from './Controls.jsx';
import Selection from './Selection.jsx';
import Environment from './Environment.jsx';
import Renderer from './Renderer.jsx';
import SceneNode from './SceneNode.jsx';

const FRUSTUM_SIZE = 15.0;

class Viewport {
  constructor(container, cameraType, hotkeyMappings) {
    THREE.Cache.enabled = true;

    this.container = container;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    const aspect = width / height;

    const defaultMappings = {
      70: { pressEvent: this.frameSelection },
      84: { pressEvent: this.toggleCamera },
    };
    this.hotkeys = new Hotkeys({...defaultMappings, ...hotkeyMappings});

    this.perspCamera = new THREE.PerspectiveCamera(55, aspect, 1.0, 8000.0);
    this.topCamera = new THREE.OrthographicCamera(FRUSTUM_SIZE * aspect * -0.5, FRUSTUM_SIZE * aspect * 0.5, FRUSTUM_SIZE * 0.5, FRUSTUM_SIZE * -0.5, 1.0, 1000.0);
    this.topCamera.position.set(0, 5, 0);
    this.camera = cameraType === 'top' ? this.topCamera : this.perspCamera;

    this.scene = new THREE.Scene();
    this.environment = new Environment(this.scene);

    this.renderer = new Renderer(this.scene, this.camera, width, height);

    this.controls = new Controls(this.camera, this.renderer.getDomElement());
    this.selection = new Selection(this.container, this.renderer.outlinePass, this.renderer.outlinePassHover);

    this.loader = new GLTFLoader();

    this.nodes = [];

    this.registered = false;

    this.frameSelection();
  }

  register() {
    if (!this.registered) {
      this.registered = true;
      this.container.appendChild(this.renderer.getDomElement());
      window.addEventListener('resize', this.onWindowResize, false);
      this.selection.register();
      this.hotkeys.register();

      this.animate();
    }
  }

  unregister() {
    if (this.registered) {
      this.registered = false;
      this.hotkeys.unregister();
      this.selection.unregister();
      window.removeEventListener('resize', this.onWindowResize, false);
      this.container.removeChild(this.renderer.getDomElement());
    }
  }

  setCameraType(newCameraType) {
    if (newCameraType === 'persp') {
      if (this.camera !== this.perspCamera) {
        this.toggleCamera();
      }
    } else if (newCameraType === 'top') {
      if (this.camera !== this.topCamera) {
        this.toggleCamera();
      }
    }
  }

  addNode(options) {
    const node = new SceneNode(this.loader, options);
    if (options.reframeOnModelLoad) {
      node.onModelLoad = () => this.frameSelection();
    }
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
    if (this.selection.selectedNode) {
      return new THREE.Box3().setFromObject(this.selection.selectedNode.getCollisionObject());
    }

    if (this.nodes.length <= 0) {
      const s = 5.0;
      return new THREE.Box3(new THREE.Vector3(-s, -s, -s), new THREE.Vector3(s, s, s));
    }

    let min = new THREE.Vector3(Infinity, Infinity, Infinity);
    let max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
    for (const node of this.nodes) {
      const aabb = new THREE.Box3().setFromObject(node.getCollisionObject());
      if (aabb.min.x < min.x) { min.x = aabb.min.x; }
      if (aabb.min.y < min.y) { min.y = aabb.min.y; }
      if (aabb.min.z < min.z) { min.z = aabb.min.z; }
      if (aabb.max.x > max.x) { max.x = aabb.max.x; }
      if (aabb.max.y > max.y) { max.y = aabb.max.y; }
      if (aabb.max.z > max.z) { max.z = aabb.max.z; }
    }
    return new THREE.Box3(min, max);
  }

  frameSelection = () => {
    const aabb = this.getSceneBoundingBox();
    this.controls.frame(aabb);
  };

  toggleCamera = () => {
    this.camera = this.camera === this.perspCamera ? this.topCamera : this.perspCamera;
    this.controls.setCamera(this.camera);
    this.renderer.setCamera(this.camera);
    this.frameSelection();
  };

  onWindowResize = () => {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    const aspect = width / height;

    this.perspCamera.aspect = aspect;
    this.perspCamera.updateProjectionMatrix();

    this.topCamera.left = FRUSTUM_SIZE * aspect * -0.5;
    this.topCamera.right = FRUSTUM_SIZE * aspect * 0.5;
    this.topCamera.top = FRUSTUM_SIZE * 0.5;
    this.topCamera.bottom = FRUSTUM_SIZE * -0.5;
    this.topCamera.updateProjectionMatrix();

    this.renderer.onResize(width, height);
  };

  animate = () => {
    if (this.registered) {
      requestAnimationFrame(this.animate);
      this.controls.update();
      this.selection.update(this.camera, this.nodes);
      this.renderer.render();
    }
  };
}

export default Viewport;
