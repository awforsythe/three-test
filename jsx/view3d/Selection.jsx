import * as THREE from 'three';

class DragOperation {
  constructor(node, camera) {
    this.node = node;
    this.camera = camera;

    this.worldStart = new THREE.Vector3();
    this.worldFinish = new THREE.Vector3();
    this.raycaster = new THREE.Raycaster();
    this.plane = new THREE.Plane();
    this.intersection = new THREE.Vector3();
    this.offset = new THREE.Vector3();
  }

  start(intersectPoint) {
    this.worldStart.copy(this.node.root.position);
    this.plane.setFromNormalAndCoplanarPoint(this.camera.getWorldDirection(this.plane.normal), this.worldStart);

    this.raycaster.set(intersectPoint, this.plane.normal);
    if (this.raycaster.ray.intersectPlane(this.plane, this.intersection)) {
      this.offset.copy(this.intersection).sub(this.worldStart);
      return true;
    }
    return false;
  }

  update(mousePos) {
    this.raycaster.setFromCamera(mousePos, this.camera);
    if (this.raycaster.ray.intersectPlane(this.plane, this.intersection)) {
      this.node.setPosition(this.intersection.sub(this.offset));
    }
  }

  finish() {
    this.worldFinish.copy(this.node.root.position);
    if (this.worldFinish.distanceToSquared(this.worldStart) > 0.001) {
      return true;
    }
    return false;
  }

  reset() {
    this.node.setPosition(this.worldStart);
  }
}


class UndoStack {
  constructor(onChange) {
    this.operations = [];
    this.onChange = onChange;
  }

  push(operation) {
    this.operations.push(operation);
    if (this.onChange && this.operations.length === 1) {
      this.onChange(true);
    }
  }

  pop() {
    if (this.onChange && this.operations.length === 1) {
      this.onChange(false);
    }
    return this.operations.pop();
  }

  pause() {
    if (this.onChange && this.operations.length > 0) {
      this.onChange(false);
    }
  }

  resume() {
    if (this.onChange && this.operations.length > 0) {
      this.onChange(true);
    }
  }

  clear() {
    if (this.operations.length > 0) {
      this.operations.length = 0;
      if (this.onChange) {
        this.onChange(false);
      }
    }
  }
}

class DragContext {
  constructor(camera, onCanUndoChange) {
    this.camera = camera;
    this.current = null;
    this.undoStack = new UndoStack(onCanUndoChange);
    this.enabled = true;
  }

  setCamera(newCamera) {
    if (newCamera !== this.camera) {
      if (this.current) {
        this.cancel();
      }
      this.camera = newCamera;
    }
  }

  start(node, intersectPoint) {
    if (!this.current) {
      const operation = new DragOperation(node, this.camera);
      if (operation.start(intersectPoint)) {
        this.current = operation;
      }
    }
  }

  update(mousePos) {
    if (this.current) {
      this.current.update(mousePos);
    }
  }

  finish() {
    if (this.current) {
      if (this.current.finish()) {
        this.undoStack.push(this.current);
        this.current = null;
      } else {
        this.cancel();
      }
    }
  }

  cancel() {
    if (this.current) {
      this.current.reset();
      this.current = null;
    }
  }

  undo() {
    if (this.undoStack.operations.length > 0) {
      const operation = this.undoStack.pop();
      if (operation.node.alive && operation.node.root.position.distanceToSquared(operation.worldFinish) < 0.001) {
        operation.reset();
      } else {
        this.undoStack.clear();
      }
    }
  }
}

class CursorContext {
  constructor(container, onHoveredChange, onClickedChange) {
    this.container = container;
    this.raycaster = new THREE.Raycaster();
    this.pos = new THREE.Vector2();
    this.downPos = new THREE.Vector2();
    this.upPos = new THREE.Vector2();

    this.hoveredPoint = new THREE.Vector3();
    this.hovered = null;
    this.clicked = null;

    this.onHoveredChange = onHoveredChange;
    this.onClickedChange = onClickedChange;
  }

  reposition(clientX, clientY, target) {
    const rect = this.container.getBoundingClientRect();
    const mouseX = Math.round(clientX - Math.round(rect.left));
    const mouseY = Math.round(clientY - Math.round(rect.top));
    const unitX = (mouseX / rect.width) * 2.0 - 1.0;
    const unitY = -(mouseY / rect.height) * 2.0 + 1.0;
    if (unitX >= -1.0 && unitX <= 1.0 && unitY >= -1.0 && unitY <= 1.0) {
      target.x = unitX;
      target.y = unitY;
      return true;
    }
    return false;
  }

  updateHovered(camera, nodes) {
    let objs = [];
    for (const node of nodes) {
      objs.push(node.getCollisionObject());
    }

    this.raycaster.setFromCamera(this.pos, camera);
    const results = this.raycaster.intersectObjects(objs, true);
    const node = results.length > 0 ? nodes.find(x => x.isParentTo(results[0].object)) : null;
    if (node) {
      this.hoveredPoint.copy(results[0].point);
    }
    this._setHovered(node);
  }

  updateClicked() {
    const tolerance = 0.025;
    const toleranceSquared = tolerance * tolerance;
    if (this.upPos.distanceToSquared(this.downPos) < toleranceSquared) {
      this._setClicked(this.hovered);
    }
  }

  _setHovered(node) {
    if (node !== this.hovered) {
      const prev = this.hovered;
      this.hovered = node;
      if (this.onHoveredChange) {
        this.onHoveredChange(prev, this.hovered);
      }
    }
  }

  _setClicked(node) {
    if (node !== this.clicked) {
      const prev = this.clicked;
      this.clicked = node;
      if (this.onClickedChange) {
        this.onClickedChange(prev, this.clicked);
      }
    }
  }
}

class Selection {
  constructor(camera, container, outlinePass, outlinePassHover, onCanUndoDragChanged) {
    this.camera = camera;
    this.container = container;
    this.outlinePass = outlinePass;
    this.outlinePassHover = outlinePassHover;

    this.cursor = new CursorContext(this.container, this.onHoveredChange, this.onClickedChange)

    this.drag = new DragContext(this.camera, onCanUndoDragChanged);
    this.drag.enabled = this.camera.isOrthographicCamera;
  }

  register() {
    document.addEventListener('mousemove', this.onMouseMove, false);
    document.addEventListener('mousedown', this.onMouseDown);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  unregister() {
    document.removeEventListener('mousemove', this.onMouseMove, false);
    document.removeEventListener('mousedown', this.onMouseDown);
    document.removeEventListener('mouseup', this.onMouseUp);
  }

  setCamera(newCamera) {
    if (this.camera !== newCamera) {
      this.camera = newCamera;
      this.drag.setCamera(this.camera);
      this.drag.enabled = this.camera.isOrthographicCamera;
    }
  }

  onMouseMove = (event) => {
    const { cursor, drag } = this;
    event.preventDefault();
    if (cursor.reposition(event.clientX, event.clientY, cursor.pos)) {
      if (drag.current) {
        drag.update(cursor.pos);
      }
    }
  };

  onMouseDown = (event) => {
    const { cursor, drag } = this;
    if (event.target.parentNode === this.container) {
      cursor.reposition(event.clientX, event.clientY, cursor.downPos);
      if (drag.enabled && !drag.current && cursor.hovered) {
        drag.start(cursor.hovered, cursor.hoveredPoint);
      }
    }
  };

  onMouseUp = (event) => {
    const { cursor, drag } = this;
    const onCanvas = event.target.parentNode === this.container;
    const inCanvasBounds = cursor.reposition(event.clientX, event.clientY, cursor.upPos);

    if (drag.current) {
      if (inCanvasBounds) {
        drag.finish();
      } else {
        drag.cancel();
      }
    }

    if (onCanvas && inCanvasBounds) {
      cursor.updateClicked();
    }
  };

  onHoveredChange = (prev, next) => {
    this.outlinePassHover.selectedObjects.length = 0;
    if (next) {
      this.outlinePassHover.selectedObjects.push(next.root);
    }
  };

  onClickedChange = (prev, next) => {
    this.outlinePass.selectedObjects.length = 0;
    if (next) {
      this.outlinePass.selectedObjects.push(next.root);
    }
  };

  update(nodes) {
    this.cursor.updateHovered(this.camera, nodes);
  }
}

export default Selection;
