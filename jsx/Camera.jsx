import * as THREE from 'three';

class Camera {
  constructor() {
    this.camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1.0, 8000.0);
    this.camera.position.set(5, 5, 5);
  }

  onResize(newWidth, newHeight) {
    this.camera.aspect = newWidth / newHeight;
    this.camera.updateProjectionMatrix();
  }
}

export default Camera;
