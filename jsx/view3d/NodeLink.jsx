import * as THREE from 'three';

class NodeLink {
  constructor(handle, srcNodeHandle, dstNodeHandle) {
    this.handle = handle;
    this.srcNodeHandle = srcNodeHandle;
    this.dstNodeHandle = dstNodeHandle;

    this.srcPosition = new THREE.Vector3();
    this.dstPosition = new THREE.Vector3();

    this.root = new THREE.Group();

    this.material = new THREE.MeshLambertMaterial({ color: 0xff0000 });
    this.cylinderGeometry = new THREE.CylinderBufferGeometry(0.05, 0.05, 1.0, 16);
    this.cylinder = new THREE.Mesh(this.cylinderGeometry, this.material);
    this.root.add(this.cylinder);
    this.cylinder.rotation.z = Math.PI / 2;

    this.matX = new THREE.MeshLambertMaterial({ color: 0xff0000 });
    this.geoX = new THREE.BoxBufferGeometry(0.1, 0.1, 0.1);
    this.boxX = new THREE.Mesh(this.geoX, this.matX);
    this.root.add(this.boxX);
    this.boxX.position.set(1, 0, 0);

    this.matY = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
    this.geoY = new THREE.BoxBufferGeometry(0.1, 0.1, 0.1);
    this.boxY = new THREE.Mesh(this.geoY, this.matY);
    this.root.add(this.boxY);
    this.boxY.position.set(0, 1, 0);

    this.matZ = new THREE.MeshLambertMaterial({ color: 0x0000ff });
    this.geoZ = new THREE.BoxBufferGeometry(0.1, 0.1, 0.1);
    this.boxZ = new THREE.Mesh(this.geoZ, this.matZ);
    this.root.add(this.boxZ);
    this.boxZ.position.set(0, 0, 1);
  }

  setSrcPosition(newPosition) {
    this.srcPosition.copy(newPosition);
    this.updateMesh();
  }

  setDstPosition(newPosition) {
    this.dstPosition.copy(newPosition);
    this.updateMesh();
  }

  updateMesh() {
    const displacement = new THREE.Vector3().copy(this.dstPosition).sub(this.srcPosition);
    const distance = displacement.length();
    if (distance > 0.0) {
      const halfDisplacement = new THREE.Vector3().copy(displacement).multiplyScalar(0.5);
      const midpoint = new THREE.Vector3().copy(this.srcPosition).add(halfDisplacement);

      const forward = new THREE.Vector3().copy(displacement).divideScalar(distance);
      const right = new THREE.Vector3().copy(forward).cross(new THREE.Vector3(0, 1, 0));
      const up = new THREE.Vector3().copy(right).cross(forward);

      const matrix = new THREE.Matrix4().makeBasis(forward, up, right);

      this.root.position.copy(midpoint).add(new THREE.Vector3().copy(right).multiplyScalar(0.1));
      this.root.setRotationFromMatrix(matrix);
      this.cylinder.scale.y = distance;
    }
  }
}

export default NodeLink;
