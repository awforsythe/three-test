import * as THREE from 'three';
import { vec } from './util.jsx';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

class Controls {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.orbit = new OrbitControls(this.camera, this.domElement);
  }

  update() {
    this.orbit.update();
  }

  frame(aabb) {
    const center = aabb.getCenter(new THREE.Vector3());
    const toCenter = vec(center).sub(this.camera.position).normalize();
    const ray = new THREE.Ray(this.camera.position, toCenter);
    const intersect = ray.intersectBox(aabb, new THREE.Vector3());
    const newPos = vec(intersect).add(toCenter.multiplyScalar(-5.0))

    this.orbit.target0 = center;
    this.orbit.position0 = newPos;
    this.orbit.zoom0 = 1.0;
    this.orbit.reset();
  }


}

export default Controls;
