import * as THREE from 'three';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import Environment from './Environment.jsx';
import AddCursor from './AddCursor.jsx';
import SceneNode from './SceneNode.jsx';

class Scene {
  constructor() {
    this.scene = new THREE.Scene();
    this.environment = new Environment(this.scene);
    this.addCursor = new AddCursor(1.0, this.scene);

    this.loader = new GLTFLoader();
    this.nodes = [];
  }

  add(options) {
    const node = new SceneNode(this.loader, options);
    this.nodes.push(node);
    this.scene.add(node.root);
    return node;
  }

  get(handle) {
    return this.nodes.find(x => x.handle === handle);
  }

  remove(node) {
    const index = this.nodes.findIndex(x => x == node);
    if (index >= 0) {
      this.nodes.splice(index, 1);
      this.scene.remove(node.root);
    }
  }

  getBoundingBox() {
    if (this.nodes.length <= 0) {
      const s = 5.0;
      return new THREE.Box3(new THREE.Vector3(-s, -s, -s), new THREE.Vector3(s, s, s));
    }

    let min = new THREE.Vector3(Infinity, Infinity, Infinity);
    let max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
    for (const node of this.nodes) {
      const aabb = new THREE.Box3().setFromObject(node.getCollisionObject());
      if (aabb.min.x < min.x) { min.x = aabb.min.x; }
      if (aabb.min.y < min.y) { min.y = aabb.min.y; }
      if (aabb.min.z < min.z) { min.z = aabb.min.z; }
      if (aabb.max.x > max.x) { max.x = aabb.max.x; }
      if (aabb.max.y > max.y) { max.y = aabb.max.y; }
      if (aabb.max.z > max.z) { max.z = aabb.max.z; }
    }
    return new THREE.Box3(min, max);
  }
}

export default Scene;
