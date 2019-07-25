import * as THREE from 'three';

class CursorContext {
  constructor(container, selectionState) {
    this.container = container;
    this.selectionState = selectionState;

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

  updateHovered(camera, nodesAndLinks, linkCursor) {
    let objs = [];
    for (const nodeOrLink of nodesAndLinks) {
      objs.push(nodeOrLink.getCollisionObject());
    }

    this.raycaster.setFromCamera(this.pos, camera);
    const results = this.raycaster.intersectObjects(objs, true);
    const nodeOrLink = results.length > 0 ? nodesAndLinks.find(x => x.isParentTo(results[0].object)) : null;
    if (nodeOrLink) {
      this.hoveredPoint.copy(results[0].point);
      if (linkCursor) {
        if (nodeOrLink.isSceneNode) {
          linkCursor.setTarget(nodeOrLink);
        } else {
          linkCursor.setTarget(null);
        }
      }
    } else {
      if (linkCursor) {
        linkCursor.setTarget(null);
      }
    }
    this.selectionState.handleHover(nodeOrLink);
  }

  updateClicked(linkMode) {
    const tolerance = 0.025;
    const toleranceSquared = tolerance * tolerance;
    if (this.upPos.distanceToSquared(this.downPos) < toleranceSquared) {
      const nodeOrLink = this.selectionState.hovered;
      this.selectionState.handleClick(nodeOrLink, linkMode);
    }
  }
}

export default CursorContext;
