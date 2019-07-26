import * as THREE from 'three';

class LinkCursor {
  constructor(scene) {
    this.srcPosition = new THREE.Vector3();
    this.dstPosition = new THREE.Vector3();

    this.root = new THREE.Group();
    this.root.visible = false;

    this.material = new THREE.MeshLambertMaterial({ color: 0xff0000 });
    this.cylinderGeometry = new THREE.CylinderBufferGeometry(0.075, 0.075, 1.0, 16);
    this.cylinder = new THREE.Mesh(this.cylinderGeometry, this.material);
    this.root.add(this.cylinder);
    this.cylinder.position.y = 0.15;
    this.cylinder.rotation.z = Math.PI * 0.5;

    this.coneGeometry = new THREE.ConeBufferGeometry(0.2, 0.75, 16, 1);
    this.cone = new THREE.Mesh(this.coneGeometry, this.material);
    this.root.add(this.cone);
    this.cone.position.y = 0.15;
    this.cone.rotation.z = Math.PI * -0.5;

    scene.add(this.root);
  }

  setSource(node) {
    if (node) {
      this.srcPosition.copy(node.getLinkPosition());
    }
  }

  setTarget(node) {
    if (node) {
      this.dstPosition.copy(node.getLinkPosition());
      this.root.visible = true;
      this._updateMesh();
    } else {
      this.dstPosition.set(0, 0, 0);
      this.root.visible = false;
    }
  }

  _updateMesh() {
    const [forward, distance] = this._getDirectionAndDistance();
    if (distance > 0.0) {
      const [v0, v1, displayDistance] = this._getDisplayPoints(forward, distance);
      const matrix = this._getRotationMatrix(forward);

      this.root.position.lerpVectors(v0, v1, 0.5);
      this.root.setRotationFromMatrix(matrix);
      this.cone.position.x = (displayDistance * 0.5);
      this.cylinder.scale.y = displayDistance;

      this.cone.visible = true;
      this.cylinder.visible = true;
    } else {
      this.cone.visible = false;
      this.cylinder.visible = false;
    }
  }

  _getDirectionAndDistance() {
    const v = new THREE.Vector3().copy(this.dstPosition).sub(this.srcPosition);
    const distance = v.length();
    if (distance > 0.0) {
      v.divideScalar(distance);
    } else {
      v.set(1, 0, 0);
    }
    return [v, distance];
  }

  _getDisplayPoints(direction, distance) {
    const insetDistance = Math.min(1.5, distance * 0.333);
    const inset = new THREE.Vector3().copy(direction).multiplyScalar(insetDistance);

    const v0 = new THREE.Vector3().copy(this.srcPosition).add(inset);
    const v1 = new THREE.Vector3().copy(this.dstPosition).sub(inset);
    return [v0, v1, distance - (insetDistance * 2.0)];
  }

  _getRotationMatrix(forward) {
    const right = new THREE.Vector3().copy(forward).cross(new THREE.Vector3(0, 1, 0)).normalize();
    const up = new THREE.Vector3().copy(right).cross(forward).normalize();
    return new THREE.Matrix4().makeBasis(forward, up, right);
  }
}

export default LinkCursor;
