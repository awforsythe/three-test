import * as THREE from 'three';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import Hotkeys from './Hotkeys.jsx';
import Controls from './Controls.jsx';
import Selection from './Selection.jsx';
import Environment from './Environment.jsx';
import Renderer from './Renderer.jsx';
import SceneNode from './SceneNode.jsx';

const FRUSTUM_SIZE = 15.0;

class Container {
  constructor(div) {
    this.div = div;
    this.onResize = [];

    this.width = this.div.clientWidth;
    this.height = this.div.clientHeight;
    this.aspect = this.width / this.height;
  }

  recompute() {
    if (this.width !== this.div.clientWidth || this.height !== this.div.clientHeight) {
      this.width = this.div.clientWidth;
      this.height = this.div.clientHeight;
      this.aspect = this.width / this.height;

      for (const func of this.onResize) {
        func(this.width, this.height, this.aspect);
      }
    }
  }
}

class CameraSwitcher {
  constructor(container, type) {
    this.persp = new THREE.PerspectiveCamera(55, container.aspect, 1.0, 8000.0);
    this.top = new THREE.OrthographicCamera(
      FRUSTUM_SIZE * container.aspect * -0.5,
      FRUSTUM_SIZE * container.aspect * 0.5,
      FRUSTUM_SIZE * 0.5,
      FRUSTUM_SIZE * -0.5,
      1.0, 1000.0,
    );
    this.top.position.set(0, 5, 0);

    this.type = type;
    this.current = this.type === 'top' ? this.top : this.persp;

    this.onSwitch = [];
    container.onResize.push(this.handleContainerResize);
  }

  handleContainerResize = (width, height, aspect) => {
    this.persp.aspect = aspect;
    this.persp.updateProjectionMatrix();

    this.top.left = FRUSTUM_SIZE * aspect * -0.5;
    this.top.right = FRUSTUM_SIZE * aspect * 0.5;
    this.top.top = FRUSTUM_SIZE * 0.5;
    this.top.bottom = FRUSTUM_SIZE * -0.5;
    this.top.updateProjectionMatrix();
  };

  setType(newType) {
    if (this.type !== newType && (newType === 'persp' || newType === 'top')) {
      this.type = newType;
      const prev = this.current;
      this.current = this.type === 'top' ? this.top : this.persp;

      for (const func of this.onSwitch) {
        func(prev, this.current);
      }
    }
  }

  toggle() {
    this.setType(this.type === 'top' ? 'persp' : 'top');
  }
}

class Viewport {
  constructor(containerDiv, cameraType, onCanUndoChanged, hotkeyMappings) {
    THREE.Cache.enabled = true;

    this.scene = new THREE.Scene();
    this.environment = new Environment(this.scene);
    this.container = new Container(containerDiv);
    this.switcher = new CameraSwitcher(this.container, cameraType);
    this.renderer = new Renderer(this.container, this.switcher, this.scene);
    this.controls = new Controls(this.switcher, this.renderer.getDomElement());
    this.selection = new Selection(this.container, this.switcher, this.renderer.outlines.onHoveredChange, this.renderer.outlines.onClickedChange, onCanUndoChanged);

    const defaultMappings = {
      70: { pressEvent: this.frameSelection },
      84: { pressEvent: this.toggleCamera },
    };
    this.hotkeys = new Hotkeys({...defaultMappings, ...hotkeyMappings});

    this.loader = new GLTFLoader();
    this.nodes = [];

    this.registered = false;
    this.switcher.onSwitch.push(this.handleCameraSwitch);
    this.frameSelection();
  }

  handleCameraSwitch = (oldCamera, newCamera) => {
    this.frameSelection();
  };

  register() {
    if (!this.registered) {
      this.registered = true;
      window.addEventListener('resize', this.container.recompute, false);
      this.renderer.register();
      this.selection.register();
      this.hotkeys.register();

      this.animate();
    }
  }

  unregister() {
    if (this.registered) {
      this.registered = false;
      window.removeEventListener('resize', this.container.recompute, false);
      this.hotkeys.unregister();
      this.selection.unregister();
      this.renderer.unregister();
    }
  }

  setCameraType(newCameraType) {
    this.switcher.setType(newCameraType)
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
    if (this.selection.cursor.clicked) {
      return new THREE.Box3().setFromObject(this.selection.cursor.clicked.getCollisionObject());
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
    this.switcher.toggle();
  };

  undoLastMove = () => {
    this.selection.drag.undo();
  };

  animate = () => {
    if (this.registered) {
      requestAnimationFrame(this.animate);
      this.controls.update();
      this.selection.update(this.nodes);
      this.renderer.render();
    }
  };
}

export default Viewport;
