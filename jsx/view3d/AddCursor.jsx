import * as THREE from 'three';

class AddCursor {
  constructor(radius, scene) {
    this.radius = radius;

    this.raycaster = new THREE.Raycaster();
    this.plane = new THREE.Plane();

    this.geometry = new THREE.CylinderBufferGeometry(radius, radius, 500.0, 64);
    this.material = new THREE.MeshLambertMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5 });
    this.root = new THREE.Mesh(this.geometry, this.material);
    this.root.visible = false;
    scene.add(this.root);
  }

  moveTo(mousePos, camera) {
    this.raycaster.setFromCamera(mousePos, camera);
    this.plane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(this.plane.normal), this.root.position);
    this.raycaster.ray.intersectPlane(this.plane, this.root.position);
    this.root.position.y = 0.0;
  }
}

export default AddCursor;
