import * as THREE from 'three';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import Environment from './Environment.jsx';
import Container from './Container.jsx';
import CameraSwitcher from './CameraSwitcher.jsx';
import AddCursor from './AddCursor.jsx';
import Renderer from './Renderer.jsx';
import Controls from './Controls.jsx';
import Selection from './Selection.jsx';
import Hotkeys from './Hotkeys.jsx';
import SceneNode from './SceneNode.jsx';

class Viewport {
  constructor(containerDiv, cameraType, onCanUndoChanged, onAddNodeClick, hotkeyMappings) {
    THREE.Cache.enabled = true;

    this.scene = new THREE.Scene();
    this.environment = new Environment(this.scene);
    this.container = new Container(containerDiv);
    this.switcher = new CameraSwitcher(this.container, cameraType);
    this.addCursor = new AddCursor(1.0, this.scene);
    this.renderer = new Renderer(this.container, this.switcher, this.scene);
    this.controls = new Controls(this.switcher, this.renderer.getDomElement());
    this.selection = new Selection(this.container, this.switcher, this.addCursor, this.renderer.outlines.onHoveredChange, this.renderer.outlines.onClickedChange, onCanUndoChanged, onAddNodeClick);

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

  setAddMode(newAddMode) {
    this.selection.setAddMode(newAddMode);
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

  getNode(handle) {
    return this.nodes.find(x => x.handle === handle);
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
