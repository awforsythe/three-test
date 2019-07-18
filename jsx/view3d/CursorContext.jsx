import * as THREE from 'three';

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

export default CursorContext;
