import * as THREE from 'three';

class Selection {
  constructor(camera, container, outlinePass, outlinePassHover, onCanUndoDragChanged) {
    this.camera = camera;
    this.container = container;
    this.outlinePass = outlinePass;
    this.outlinePassHover = outlinePassHover;
    this.onCanUndoDragChanged = onCanUndoDragChanged;

    this.mousePos = new THREE.Vector2();
    this.lastMouseDownPos = new THREE.Vector2();
    this.lastMouseUpPos = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.hoveredNode = null;
    this.hoveredNodeIntersectPoint = new THREE.Vector3();
    this.selectedNode = null;

    this.dragEnabled = this.camera.isOrthographicCamera;
    this.draggingNode = null;
    this.dragStartWorldPos = new THREE.Vector3();
    this.dragEndWorldPos = new THREE.Vector3();
    this.lastDragNode = null;
    this.canUndoDrag = false;

    this.dragPlane = new THREE.Plane();
    this.dragOffset = new THREE.Vector3();
    this.dragIntersection = new THREE.Vector3();
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
      this.dragEnabled = this.camera.isOrthographicCamera;
      if (this.draggingNode && !this.dragEnabled) {
        this.cancelDrag();
      }
    }
  }

  setCanUndoDrag(newValue) {
    if (this.canUndoDrag !== newValue) {
      this.canUndoDrag = newValue;
      if (this.onCanUndoDragChanged) {
        this.onCanUndoDragChanged(this.canUndoDrag);
      }
    }
  }

  startDrag() {
    this.setCanUndoDrag(false);
    this.draggingNode = this.hoveredNode;
    this.dragStartWorldPos.copy(this.draggingNode.root.position);
    this.dragPlane.setFromNormalAndCoplanarPoint(this.camera.getWorldDirection(this.dragPlane.normal), this.dragStartWorldPos);

    this.raycaster.set(this.hoveredNodeIntersectPoint, this.dragPlane.normal);
    if (this.raycaster.ray.intersectPlane(this.dragPlane, this.dragIntersection)) {
      this.dragOffset.copy(this.dragIntersection).sub(this.dragStartWorldPos);
    } else {
      this.draggingNode = null;
    }
  }

  endDrag() {
    this.dragEndWorldPos.copy(this.draggingNode.root.position);
    this.lastDragNode = this.draggingNode;
    this.draggingNode = null;
    this.setCanUndoDrag(true);
  }

  cancelDrag() {
    this.draggingNode.setPosition(this.dragStartWorldPos);
    this.draggingNode = null;
  }

  undoDrag() {
    if (this.canUndoDrag) {
      if (this.lastDragNode) {
        this.lastDragNode.setPosition(this.dragStartWorldPos);
      }
      this.setCanUndoDrag(false);
    }
  }

  updateDrag() {
    this.raycaster.setFromCamera(this.mousePos, this.camera);
    if (this.raycaster.ray.intersectPlane(this.dragPlane, this.dragIntersection)) {
      this.draggingNode.setPosition(this.dragIntersection.sub(this.dragOffset));
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
      if (this.draggingNode) {
        this.updateDrag();
      }
    }
  };

  onMouseDown = (event) => {
    if (event.target.parentNode === this.container) {
      this.updateMousePos(event.clientX, event.clientY, this.lastMouseDownPos);
      if (this.dragEnabled && !this.draggingNode && this.hoveredNode) {
        this.startDrag();
      }
    }
  };

  onMouseUp = (event) => {
    const onCanvas = event.target.parentNode === this.container;
    const inCanvasBounds = this.updateMousePos(event.clientX, event.clientY, this.lastMouseUpPos);
    if (this.draggingNode) {
      this.dragEndWorldPos.copy(this.draggingNode.root.position);
      if (inCanvasBounds && this.dragEndWorldPos.distanceToSquared(this.dragStartWorldPos) > 0.001) {
        this.endDrag();
      } else {
        this.cancelDrag();
      }
    }

    if (onCanvas && inCanvasBounds) {
      const xDelta = Math.abs(this.lastMouseUpPos.x - this.lastMouseDownPos.x);
      const yDelta = Math.abs(this.lastMouseUpPos.y - this.lastMouseDownPos.y);
      if (xDelta < 0.05 && yDelta < 0.05) {
        if (this.hoveredNode) {
          if (this.hoveredNode !== this.selectedNode) {
            this.setCanUndoDrag(false);
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
