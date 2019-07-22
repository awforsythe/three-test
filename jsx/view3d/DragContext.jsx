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

  removeNode(node) {
    if (this.operations.length > 0) {
      for (let i = this.operations.length - 1; i >= 0; i--) {
        if (this.operations[i].node === node) {
          this.operations.splice(i, 1);
        }
      }
      if (this.operations.length === 0) {
        this.onChange(false);
      }
    }
  }
}

class DragContext {
  constructor(switcher, onCanUndoChange) {
    this.switcher = switcher;
    this.current = null;
    this.undoStack = new UndoStack(onCanUndoChange);
    this.enabled = true;

    this.switcher.onSwitch.push(this.handleCameraSwitch);
  }

  handleCameraSwitch = (oldCamera, newCamera) => {
    this.cancel();
  };

  start(node, intersectPoint) {
    if (!this.current) {
      const operation = new DragOperation(node, this.switcher.current);
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

export default DragContext;
