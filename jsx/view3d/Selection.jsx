import * as THREE from 'three';

class Selection {
  constructor(container) {
    this.container = container;
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
    this.updateMousePos(event.clientX, event.clientY, this.lastMouseDownPos);
  };

  onMouseUp = (event) => {
    if (this.updateMousePos(event.clientX, event.clientY, this.lastMouseUpPos)) {
      const xDelta = Math.abs(this.lastMouseUpPos.x - this.lastMouseDownPos.x);
      const yDelta = Math.abs(this.lastMouseUpPos.y - this.lastMouseDownPos.y);
      if (xDelta < 0.001 && yDelta < 0.001) {
        if (this.hoveredNode) {
          if (this.hoveredNode !== this.selectedNode) {
            if (this.selectedNode) {
              this.selectedNode.deselect();
            }
            this.selectedNode = this.hoveredNode;
            this.selectedNode.select();
          }
        } else {
          if (this.selectedNode) {
            this.selectedNode.deselect();
            this.selectedNode = null;
          }
        }
      }
    }
  };

  update(camera, nodes) {
    let boxes = []
    for (const node of nodes) {
      boxes.push(node.box);
    }
    this.raycaster.setFromCamera(this.mousePos, camera);

    const results = this.raycaster.intersectObjects(boxes);
    const node = results.length > 0 ? nodes.find(x => x.box === results[0].object) : null;
    if (node) {
      if (node !== this.hoveredNode) {
        if (this.hoveredNode) {
          this.hoveredNode.unhover();
        }
        this.hoveredNode = node;
        this.hoveredNode.hover();
      }
    } else {
      if (this.hoveredNode) {
        this.hoveredNode.unhover();
        this.hoveredNode = null;
      }
    }
  }
}

export default Selection;