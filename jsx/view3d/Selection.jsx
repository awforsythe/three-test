import * as THREE from 'three';

class Selection {
  constructor(container, outlinePass, outlinePassHover) {
    this.container = container;
    this.outlinePass = outlinePass;
    this.outlinePassHover = outlinePassHover;
    this.mousePos = new THREE.Vector2();
    this.lastMouseDownPos = new THREE.Vector2();
    this.lastMouseUpPos = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.hoveredNode = null;
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
    this.updateMousePos(event.clientX, event.clientY, this.mousePos);
  };

  onMouseDown = (event) => {
    if (event.target.parentNode === this.container) {
      this.updateMousePos(event.clientX, event.clientY, this.lastMouseDownPos);
    }
  };

  onMouseUp = (event) => {
    if (event.target.parentNode === this.container) {
      if (this.updateMousePos(event.clientX, event.clientY, this.lastMouseUpPos)) {
        const xDelta = Math.abs(this.lastMouseUpPos.x - this.lastMouseDownPos.x);
        const yDelta = Math.abs(this.lastMouseUpPos.y - this.lastMouseDownPos.y);
        if (xDelta < 0.05 && yDelta < 0.05) {
          if (this.hoveredNode) {
            if (this.hoveredNode !== this.selectedNode) {
              if (this.selectedNode) {
                this.selectedNode.deselect();
              }
              this.selectedNode = this.hoveredNode;
              this.selectedNode.select();
              this.updateOutlines();
            }
          } else {
            if (this.selectedNode) {
              this.selectedNode.deselect();
              this.selectedNode = null;
              this.updateOutlines();
            }
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

  update(camera, nodes) {
    let collisionObjects = []
    for (const node of nodes) {
      collisionObjects.push(node.getCollisionObject());
    }
    this.raycaster.setFromCamera(this.mousePos, camera);

    const results = this.raycaster.intersectObjects(collisionObjects, true);
    const node = results.length > 0 ? nodes.find(x => x.isParentTo(results[0].object)) : null;
    if (node) {
      if (node !== this.hoveredNode) {
        if (this.hoveredNode) {
          this.hoveredNode.unhover();
        }
        this.hoveredNode = node;
        this.hoveredNode.hover();
        this.updateOutlines();
      }
    } else {
      if (this.hoveredNode) {
        this.hoveredNode.unhover();
        this.hoveredNode = null;
        this.updateOutlines();
      }
    }
  }
}

export default Selection;
