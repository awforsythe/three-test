import * as THREE from 'three';

class Selection {
  constructor() {
    this.mousePos = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.hoveredNode = null;
    this.selectedNode = null;
  }

  register() {
    document.addEventListener('mousemove', this.onMouseMove, false);
  }

  unregister() {
    document.removeEventListener('mousemove', this.onMouseMove, false);
  }

  onMouseMove = (event) => {
    event.preventDefault();
    this.mousePos.x = (event.clientX / window.innerWidth) * 2.0 - 1.0;
    this.mousePos.y = -(event.clientY / window.innerHeight) * 2.0 + 1.0;
  }

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
