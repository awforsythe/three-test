import * as THREE from 'three';

import { vec } from './util.jsx';

class SceneNode {
  constructor(loader, options) {
    this.loader = loader;
    this.options = options || {};
    this.hovered = false;
    this.selected = false;
    this.root = new THREE.Group();

    this.model = null;
    this.loadedModelUrl = null;
    this.loadingModelUrl = null;

    this.boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    this.boxMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00, transparent: true, opacity: 0.125 });
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

  getCollisionObject() {
    if (this.model) {
      return this.model;
    }
    return this.box;
  }

  isParentTo(obj) {
    let parent = obj.parent;
    while (parent) {
      if (parent === this.root) {
        return true;
      }
      parent = parent.parent;
    }
    return false;
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

  hover() {
    if (!this.hovered) {
      this.hovered = true;
      this.updateMaterial();
    }
  }

  unhover() {
    if (this.hovered) {
      this.hovered = false;
      this.updateMaterial();
    }
  }

  select() {
    if (!this.selected) {
      this.selected = true;
      this.updateMaterial();
    }
  }

  deselect() {
    if (this.selected) {
      this.selected = false;
      this.updateMaterial();
    }
  }

  updateMaterial() {
    if (this.selected) {
      this.boxMaterial.color.set(this.hovered ? 0x9999ff : 0x6699ff);
      this.boxMaterial.opacity = 0.5;
    } else if (this.hovered) {
      this.boxMaterial.color.set(0xff9900);
      this.boxMaterial.opacity = 0.5;
    } else {
      this.boxMaterial.color.set(0x00ff00);
      this.boxMaterial.opacity = 0.125;
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
