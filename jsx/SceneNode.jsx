import * as THREE from 'three';

import { vec } from './util.jsx';

class SceneNode {
  constructor(loader, options) {
    this.loader = loader;
    this.options = options || {};
    this.root = new THREE.Group();

    this.model = null;
    this.loadedModelUrl = null;
    this.loadingModelUrl = null;

    this.boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    this.boxMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5 });
    this.box = new THREE.Mesh(this.boxGeometry, this.boxMaterial);
    this.root.add(this.box);

    if (this.options.position) {
      this.root.position.copy(this.options.position);
    }

    if (this.options.url) {
      this.setModel(this.options.url);
    }
  }

  setPosition(position) {
    this.root.position.copy(position);
  }

  setModel(url) {
    if (this.loadingModelUrl) {
      console.log(`ERROR: Already loading model ${this.loadingModelUrl}; can not set new model to ${url}`);
      return;
    }

    if (url != this.loadedModelUrl) {
      if (url) {
        this.loadingModelUrl = url;
        this.loader.load(url, this.onLoad, undefined, this.onLoadError);
      } else {
        this.clearModel();
      }
    }
  }

  clearModel() {
    if (this.model) {
      this.root.remove(this.model);
      this.model = null;
      this.loadedModelUrl = null;
      this.updateBox();
    }
  }

  updateBox() {
    if (this.model) {
      const aabb = new THREE.Box3().setFromObject(this.model);
      const extents = aabb.max.sub(aabb.min);
      this.box.scale.copy(extents);

      const aabbCenter = vec(aabb.min).add(vec(extents).multiplyScalar(0.5));
      const offset = vec(aabbCenter).sub(this.root.position);
      this.box.position.copy(offset);
    } else {
      this.box.scale.set(1, 1, 1);
      this.box.position.set(0, 0, 0);
    }
  }

  onLoad = (gltf) => {
    this.clearModel();
    this.loadedModelUrl = this.loadingModelUrl;
    this.loadingModelUrl = null;
    this.model = gltf.scene;
    this.root.add(this.model);
    this.updateBox();
  };

  onLoadError = (error) => {
    console.log(`ERROR: Failed to load ${this.loadingModelUrl}: ${error}`);
    this.loadingModelUrl = null;
  };
}

export default SceneNode;