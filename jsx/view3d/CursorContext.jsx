import * as THREE from 'three';

class CursorContext {
  constructor(container, selectionState) {
    this.container = container;
    this.selectionState = selectionState;
1
    this.raycaster = new THREE.Raycaster();
    this.pos = new THREE.Vector2();
    this.downPos = new THREE.Vector2();
    this.upPos = new THREE.Vector2();

    this.hoveredPoint = new THREE.Vector3();
  }

  reposition(clientX, clientY, target) {
    const rect = this.container.div.getBoundingClientRect();
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
    this.selectionState.handleHover(node);
  }

  updateClicked() {
    console.log('updateClicked');
    const tolerance = 0.025;
    const toleranceSquared = tolerance * tolerance;
    if (this.upPos.distanceToSquared(this.downPos) < toleranceSquared) {
      const node = this.selectionState.hovered;
      this.selectionState.handleClick(node);
    }
  }
}

export default CursorContext;
