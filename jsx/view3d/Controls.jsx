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
    if (this.camera.isOrthographicCamera) {
      this.frameOrtho(aabb, center);
    } else {
      this.framePersp(aabb, center);
    }
  }

  frameOrtho(aabb, center) {
    // Drop the center of the bounding box down to the floor: this is the point our ortho camera will be fixed to
    const groundCenter = new THREE.Vector3(center.x, 0.0, center.z);
    this.orbit.target0 = groundCenter;

    // Position the camera above that position, raised up so that its far plane reaches past the ground
    const cameraDistance = (this.camera.far - this.camera.near) * 0.95;
    this.orbit.position0 = vec(groundCenter).add(new THREE.Vector3(0, cameraDistance, 0));

    // Compute a zoom value for our ortho camera such that it will show the entire region of the bounding box:
    // Get the apparent size of the region we need to show, from the X (horizontal) and Z (vertical) components of the bounding box
    const hSize = aabb.max.x - aabb.min.x;
    const vSize = aabb.max.z - aabb.min.z;

    // Get the size of the corresponding dimensions of our camera's orthographic projection
    const hOrtho = this.camera.right - this.camera.left;
    const vOrtho = this.camera.top - this.camera.bottom;

    // Compute an extra padding (independent of scene scale) around our objects
    const paddingPixels = 16.0;
    const wPixelsToScene = hOrtho / this.domElement.clientWidth;
    const hPixelsToScene = vOrtho / this.domElement.clientHeight;

    // Apply the final zoom that fits our entire bounding box in the orthographic view, with some padding
    const hZoom = (hOrtho - paddingPixels * wPixelsToScene) / hSize;
    const vZoom = (vOrtho - paddingPixels * hPixelsToScene) / vSize;
    this.orbit.zoom0 = Math.min(hZoom, vZoom);

    // Reset the OrbitControls so the camera will adopt our newly computed view
    this.orbit.reset();
  }

  framePersp(aabb, center) {
    const pos = (this.camera.position.distanceToSquared(center) > 0.01) ? this.camera.position : vec(center).add(new THREE.Vector3(1.0, 0.0, 0.0));

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

export default Controls;
