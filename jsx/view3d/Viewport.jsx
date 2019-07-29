import * as THREE from 'three';

import Scene from './Scene.jsx';
import Container from './Container.jsx';
import CameraSwitcher from './CameraSwitcher.jsx';
import Renderer from './Renderer.jsx';
import Controls from './Controls.jsx';
import SelectionState from './SelectionState.jsx';
import Selection from './Selection.jsx';
import Hotkeys from './Hotkeys.jsx';

class Viewport {
  constructor(containerDiv, state, events) {
    THREE.Cache.enabled = true;

    this.containerDiv = containerDiv;
    this.state = state;
    this.events = events;

    this.scene = new Scene();
    this.container = new Container(this.containerDiv);
    this.switcher = new CameraSwitcher(this.container, this.state.cameraType)
    this.renderer = new Renderer(this.container, this.switcher, this.scene.scene);
    this.controls = new Controls(this.switcher, this.renderer.getDomElement());
    this.selectionState = new SelectionState(
      this.renderer.outlines.handleSelectionStateChange,
      (type, handle) => this.events.dispatch(this.events.onSelectionChange, type, handle),
      (srcNodeHandle, dstNodeHandle) => this.events.dispatch(this.events.onLinkAdd, srcNodeHandle, dstNodeHandle),
    );
    this.selection = new Selection(
      this.container,
      this.switcher,
      this.scene.addCursor,
      this.scene.linkCursor,
      this.selectionState,
      (canUndo) => this.events.dispatch(this.events.onCanUndoChanged, canUndo),
      (x, y, z) => this.events.dispatch(this.events.onNodeAdd, x, y, z),
      (handle, x, y, z) => this.events.dispatch(this.events.onNodeMove, handle, x, y, z),
    );
    this.hotkeys = new Hotkeys({
      70: { pressEvent: (() => this.events.dispatch(this.events.onFramePress)) },
      84: { pressEvent: (() => this.events.dispatch(this.events.onToggleCameraPress)) },
    });

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

      this.scene.scene.dispose();
    }
  }

  updateState(newState) {
    const { cameraType, frameCount, undoCount, selection, addMode, linkMode } = this.state;
    if (cameraType !== newState.cameraType) {
      this.switcher.setType(newState.cameraType);
    }
    if (frameCount !== newState.frameCount) {
      this.frameSelection();
    }
    if (undoCount !== newState.undoCount) {
      this.selection.undoLastMove();
    }
    if (selection !== newState.selection) {
      if (!newState.selection.handle) {
        this.selectionState.setSelection(null);
      } else if (newState.selection.type === 'node') {
        this.selectionState.setSelection(this.scene.get(newState.selection.handle));
      } else if (newState.selection.type === 'link') {
        this.selectionState.setSelection(this.scene.getLink(newState.selection.handle));
      }
    }
    if (addMode !== newState.addMode) {
      this.selection.setAddMode(newState.addMode);
    }
    if (linkMode !== newState.linkMode) {
      this.selection.setLinkMode(newState.linkMode);
    }
    if (hotkeysPaused !== newState.hotkeysPaused) {
      if (newState.hotkeysPaused) {
        this.hotkeys.pause();
      } else {
        this.hotkeys.resume();
      }
    }
    this.state = newState;
  }

  handleCameraSwitch = (oldCamera, newCamera) => {
    this.frameSelection();
  };

  addNode(options) {
    const node = this.scene.add(options);
    if (options.reframeOnModelLoad) {
      node.onModelLoad = () => this.frameSelection();
    }
    return node;
  }

  removeNode(node) {
    this.selection.drag.undoStack.removeNode(node);
    this.scene.remove(node);
  }

  frameSelection = () => {
    if (this.selectionState.selected) {
      const aabb = new THREE.Box3().setFromObject(this.selectionState.selected.getCollisionObject());
      this.controls.frame(aabb);
    } else {
      this.controls.frame(this.scene.getBoundingBox());
    }
  };

  animate = () => {
    if (this.registered) {
      requestAnimationFrame(this.animate);
      this.controls.update();
      this.selection.update(this.scene.nodes, this.scene.links);
      this.renderer.render();
    }
  };
}

export default Viewport;
