import * as THREE from 'three';
import { vec } from './util.jsx';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

class Controls {
  constructor(camera, domElement) {
    this.camera = null;
    this.domElement = domElement;

    this.orbit = null;
    this.setCamera(camera);
  }

  setCamera(newCamera) {
    if (newCamera != this.camera) {
      this.camera = newCamera;

      if (this.orbit) {
        this.orbit.dispose();
        this.orbit = null;
      }

      this.orbit = new OrbitControls(this.camera, this.domElement);
      if (this.camera.isOrthographicCamera) {
        this.orbit.enableRotate = false;
      }
    }
  }

  update() {
    this.orbit.update();
  }

  frame(aabb) {
    // Get the center of the target AABB: this is where our camera should now focus and orbit
    const center = aabb.getCenter(new THREE.Vector3());
    const pos = (this.camera.position.distanceToSquared(center) > 0.01) ? this.camera.position : vec(center).add(new THREE.Vector3(1.0, 0.0, 0.0));

    if (this.camera.isOrthographicCamera) {
      const groundCenter = new THREE.Vector3(center.x, 0.0, center.z);
      this.orbit.target0 = groundCenter;
      this.orbit.position0 = vec(groundCenter).add(new THREE.Vector3(0, 100.0, 0));
      this.orbit.zoom0 = 1.0;
      this.orbit.reset();
    } else {
      // Run a ray-box intersection to get a point on the AABB's surface from the current camera positioon
      const toCenter = vec(center).sub(pos).normalize();
      const ray = new THREE.Ray(pos, toCenter);
      const intersect = ray.intersectBox(aabb, new THREE.Vector3());

      // Get the direction pointing out from the center of the AABB to that intersection point
      const toIntersect = vec(intersect).sub(center).normalize();
      const newPos = vec(intersect).add(toIntersect.multiplyScalar(5.0));

      this.orbit.target0 = center;
      this.orbit.position0 = newPos;
      this.orbit.zoom0 = 1.0;
      this.orbit.reset();
    }
  }


}

export default Controls;
