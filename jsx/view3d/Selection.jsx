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

class Selection {
  constructor(camera, container, outlinePass, outlinePassHover, onCanUndoDragChanged) {
    this.camera = camera;
    this.container = container;
    this.outlinePass = outlinePass;
    this.outlinePassHover = outlinePassHover;

    this.drag = new DragContext(this.camera, onCanUndoDragChanged);
    this.drag.enabled = this.camera.isOrthographicCamera;

    this.mousePos = new THREE.Vector2();
    this.lastMouseDownPos = new THREE.Vector2();
    this.lastMouseUpPos = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.hoveredNode = null;
    this.hoveredNodeIntersectPoint = new THREE.Vector3();
    this.selectedNode = null;

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

  updateMousePos(clientX, clientY, target) {
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

  onMouseMove = (event) => {
    event.preventDefault();
    if (this.updateMousePos(event.clientX, event.clientY, this.mousePos)) {
      if (this.drag.current) {
        this.drag.update(this.mousePos);
      }
    }
  };

  onMouseDown = (event) => {
    if (event.target.parentNode === this.container) {
      this.updateMousePos(event.clientX, event.clientY, this.lastMouseDownPos);
      if (this.drag.enabled && !this.drag.current && this.hoveredNode) {
        this.drag.start(this.hoveredNode, this.hoveredNodeIntersectPoint);
      }
    }
  };

  onMouseUp = (event) => {
    const onCanvas = event.target.parentNode === this.container;
    const inCanvasBounds = this.updateMousePos(event.clientX, event.clientY, this.lastMouseUpPos);
    if (this.drag.current) {
      if (inCanvasBounds) {
        this.drag.finish();
      } else {
        this.drag.cancel();
      }
    }

    if (onCanvas && inCanvasBounds) {
      const xDelta = Math.abs(this.lastMouseUpPos.x - this.lastMouseDownPos.x);
      const yDelta = Math.abs(this.lastMouseUpPos.y - this.lastMouseDownPos.y);
      if (xDelta < 0.05 && yDelta < 0.05) {
        if (this.hoveredNode) {
          if (this.hoveredNode !== this.selectedNode) {
            this.selectedNode = this.hoveredNode;
            this.updateOutlines();
          }
        } else {
          if (this.selectedNode) {
            this.selectedNode = null;
            this.updateOutlines();
          }
        }
      }
    }
  };

  updateOutlines() {
    this.outlinePass.selectedObjects.length = 0;
    this.outlinePassHover.selectedObjects.length = 0;
    if (this.selectedNode) {
      this.outlinePass.selectedObjects.push(this.selectedNode.root);
    }
    if (this.hoveredNode) {
      this.outlinePassHover.selectedObjects.push(this.hoveredNode.root);
    }
  }

  update(nodes) {
    let collisionObjects = []
    for (const node of nodes) {
      collisionObjects.push(node.getCollisionObject());
    }
    this.raycaster.setFromCamera(this.mousePos, this.camera);

    const results = this.raycaster.intersectObjects(collisionObjects, true);
    const node = results.length > 0 ? nodes.find(x => x.isParentTo(results[0].object)) : null;
    if (node) {
      if (node !== this.hoveredNode) {
        this.hoveredNode = node;
        this.updateOutlines();
      }
      this.hoveredNodeIntersectPoint.copy(results[0].point);
    } else {
      if (this.hoveredNode) {
        this.hoveredNode = null;
        this.updateOutlines();
      }
    }
  }
}

export default Selection;
