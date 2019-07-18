import * as THREE from 'three';
import { vec } from './util.jsx';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

class Controls {
  constructor(switcher, domElement) {
    this.switcher = switcher;
    this.domElement = domElement;

    this.orbit = null;
    this.handleCameraSwitch(null, this.switcher.current);

    this.switcher.onSwitch.push(this.handleCameraSwitch);
  }

  handleCameraSwitch = (oldCamera, newCamera) => {
    if (this.orbit) {
      this.orbit.dispose();
      this.orbit = null;
    }

    this.orbit = new OrbitControls(newCamera, this.domElement);
    if (newCamera.isOrthographicCamera) {
      this.orbit.enableRotate = false;
    } else {
      this.orbit.screenSpacePanning = true;
    }
  };

  update() {
    this.orbit.update();
  }

  frame(aabb) {
    // Get the center of the target AABB: this is where our camera should now focus and orbit
    const center = aabb.getCenter(new THREE.Vector3());
    if (this.switcher.current.isOrthographicCamera) {
      this.frameOrtho(aabb, center);
    } else {
      this.framePersp(aabb, center);
    }
  }

  frameOrtho(aabb, center) {
    const camera = this.switcher.current;

    // Drop the center of the bounding box down to the floor: this is the point our ortho camera will be fixed to
    const groundCenter = new THREE.Vector3(center.x, 0.0, center.z);
    this.orbit.target0 = groundCenter;

    // Position the camera above that position, raised up so that its far plane reaches past the ground
    const cameraDistance = (camera.far - camera.near) * 0.95;
    this.orbit.position0 = vec(groundCenter).add(new THREE.Vector3(0, cameraDistance, 0));

    // Compute a zoom value for our ortho camera such that it will show the entire region of the bounding box:
    // Get the apparent size of the region we need to show, from the X (horizontal) and Z (vertical) components of the bounding box
    const hSize = aabb.max.x - aabb.min.x;
    const vSize = aabb.max.z - aabb.min.z;

    // Get the size of the corresponding dimensions of our camera's orthographic projection
    const hOrtho = camera.right - camera.left;
    const vOrtho = camera.top - camera.bottom;

    // Compute an extra padding (independent of scene scale) around our objects
    const paddingPixels = 16.0;
    const width = this.domElement.clientWidth || 640;
    const height = this.domElement.clientHeight || 480;
    const wPad = paddingPixels * hOrtho / width;
    const hPad = paddingPixels * vOrtho / height;

    // Apply the final zoom that fits our entire bounding box in the orthographic view, with some padding
    const hZoom = (hOrtho - wPad) / hSize;
    const vZoom = (vOrtho - hPad) / vSize;
    this.orbit.zoom0 = Math.min(hZoom, vZoom);

    // Reset the OrbitControls so the camera will adopt our newly computed view
    this.orbit.reset();
  }

  framePersp(aabb, center) {
    const camera = this.switcher.current;

    const isOverlapping = camera.position.distanceToSquared(center) < 0.01;
    const targetToPos = isOverlapping ? new THREE.Vector3(1.0, 0.0, 0.0) : vec(camera.position).sub(this.orbit.target).normalize();
    const dim = vec(aabb.max).sub(aabb.min);
    const maxDim = Math.max(dim.x, Math.max(dim.y, dim.z));

    const isVertical = camera.aspect < 1.0;
    const fovRadians = camera.fov * (Math.PI / 180.0);
    const cameraDistance = (maxDim * 0.8) / Math.tan(fovRadians * 0.5) / (isVertical ? camera.aspect : 1.0);

    this.orbit.target0 = center;
    this.orbit.position0 = vec(center).add(targetToPos.multiplyScalar(cameraDistance));
    this.orbit.zoom0 = 1.0;
    this.orbit.reset();
  }
}

export default Controls;
