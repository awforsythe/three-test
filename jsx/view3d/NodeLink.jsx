import * as THREE from 'three';

class NodeLink {
  constructor(handle, srcNodeHandle, dstNodeHandle) {
    this.handle = handle;
    this.srcNodeHandle = srcNodeHandle;
    this.dstNodeHandle = dstNodeHandle;

    this.srcPosition = new THREE.Vector3();
    this.dstPosition = new THREE.Vector3();

    this.root = new THREE.Group();

    this.material = new THREE.MeshLambertMaterial({ color: 0x112299 });
    this.cylinderGeometry = new THREE.CylinderBufferGeometry(0.05, 0.05, 1.0, 16);
    this.cylinder = new THREE.Mesh(this.cylinderGeometry, this.material);
    this.root.add(this.cylinder);
    this.cylinder.position.z = 0.1;
    this.cylinder.rotation.z = Math.PI * 0.5;

    this.coneGeometry = new THREE.ConeBufferGeometry(0.15, 0.5, 16, 1);
    this.cone = new THREE.Mesh(this.coneGeometry, this.material);
    this.root.add(this.cone);
    this.cone.position.z = 0.1;
    this.cone.rotation.z = Math.PI * -0.5;
  }

  setSrcPosition(newPosition) {
    this.srcPosition.copy(newPosition);
    this._updateMesh();
  }

  setDstPosition(newPosition) {
    this.dstPosition.copy(newPosition);
    this._updateMesh();
  }

  getCollisionObject() {
    return this.cylinder;
  }

  isParentTo(obj) {
    return obj === this.cylinder;
  }

  _updateMesh() {
    const [forward, distance] = this._getDirectionAndDistance();
    const [v0, v1, displayDistance] = this._getDisplayPoints(forward, distance);
    const matrix = this._getRotationMatrix(forward);

    this.root.position.lerpVectors(v0, v1, 0.5);
    this.root.setRotationFromMatrix(matrix);
    this.cone.position.x = (displayDistance * 0.5);
    this.cylinder.scale.y = displayDistance;
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
    const insetDistance = Math.min(1.0, distance * 0.333);
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

export default NodeLink;
