import * as THREE from 'three';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import Environment from './Environment.jsx';
import Container from './Container.jsx';
import CameraSwitcher from './CameraSwitcher.jsx';
import AddCursor from './AddCursor.jsx';
import Renderer from './Renderer.jsx';
import Controls from './Controls.jsx';
import SelectionState from './SelectionState.jsx';
import Selection from './Selection.jsx';
import Hotkeys from './Hotkeys.jsx';
import SceneNode from './SceneNode.jsx';

class Viewport {
  constructor(containerDiv, state, events) { 
    THREE.Cache.enabled = true;

    this.containerDiv = containerDiv;
    this.state = state;
    this.events = events;

    this.scene = new THREE.Scene();
    this.environment = new Environment(this.scene);
    this.container = new Container(this.containerDiv);
    this.switcher = new CameraSwitcher(this.container, this.state.cameraType)
    this.addCursor = new AddCursor(1.0, this.scene);
    this.renderer = new Renderer(this.container, this.switcher, this.scene);
    this.controls = new Controls(this.switcher, this.renderer.getDomElement());
    this.selectionState = new SelectionState(
      this.renderer.outlines.handleSelectionStateChange,
      (handle) => this.events.dispatch(this.events.onNodeSelect, handle),
    );
    this.selection = new Selection(
      this.container,
      this.switcher,
      this.addCursor,
      this.selectionState,
      (canUndo) => this.events.dispatch(this.events.onCanUndoChanged, canUndo),
      (x, y, z) => this.events.dispatch(this.events.onNodeAdd, x, y, z),
      (handle, x, y, z) => this.events.dispatch(this.events.onNodeMove, handle, x, y, z),
    );
    this.hotkeys = new Hotkeys({
      70: { pressEvent: (() => this.events.dispatch(this.events.onFramePress)) },
      84: { pressEvent: (() => this.events.dispatch(this.events.onToggleCameraPress)) },
    });

    this.loader = new GLTFLoader();
    this.nodes = [];

    this.registered = false;
    this.switcher.onSwitch.push(this.handleCameraSwitch);
    this.frameSelection();
  }

  /** Attaches the viewport to the DOM and registers event listeners. */
  register() {
    if (!this.registered) {
      this.registered = true;
      
      window.addEventListener('resize', this.container.recompute, false);
      this.renderer.register();
      this.selection.register();
      this.hotkeys.register();

      this.animate();

      this.events.dispatch(this.events.onRegister, this);
    }
  }

  /** Cleans up and removes the viewport from the DOM, undoing its registration. */
  unregister() {
    if (this.registered) {
      this.registered = false;

      window.removeEventListener('resize', this.container.recompute, false);
      this.hotkeys.unregister();
      this.selection.unregister();
      this.renderer.unregister();
    }
  }

  updateState(newState) {
    const { cameraType, frameCount, undoCount, selectedNodeHandle, addMode } = this.state;
    if (cameraType !== newState.cameraType) {
      this.switcher.setType(newState.cameraType);
    }
    if (frameCount !== newState.frameCount) {
      this.frameSelection();
    }
    if (undoCount !== newState.undoCount) {
      this.selection.undoLastMove();
    }
    if (selectedNodeHandle !== newState.selectedNodeHandle) {
      this.selectionState.setSelected(this.getNode(newState.selectedNodeHandle));
    }
    if (addMode !== newState.addMode) {
      this.selection.setAddMode(newState.addMode);
    }
    this.state = newState;
  }

  handleCameraSwitch = (oldCamera, newCamera) => {
    this.frameSelection();
  };

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
    this.selection.drag.undoStack.removeNode(node);
    const index = this.nodes.findIndex(x => x == node);
    if (index >= 0) {
      this.nodes.splice(index, 1);
      this.scene.remove(node.root);
    }
  }

  getSceneBoundingBox() {
    if (this.selectionState.selected) {
      return new THREE.Box3().setFromObject(this.selectionState.selected.getCollisionObject());
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
    this.controls.frame(this.getSceneBoundingBox());
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
