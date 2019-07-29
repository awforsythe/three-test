import * as THREE from 'three';

import { vec } from './util.jsx';

class SceneNode {
  constructor(loader, options) {
    this.loader = loader;
    this.options = options || {};
    this.onModelLoad = null;
    this.onMove = null;
    this.hovered = false;
    this.selected = false;
    this.root = new THREE.Group();
    this.alive = true;
    this.handle = this.options.handle || 0;
    this.isSceneNode = true;

    this.model = null;
    this.loadedModelUrl = null;
    this.loadingModelUrl = null;

    this.boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    this.boxMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
    this.box = new THREE.Mesh(this.boxGeometry, this.boxMaterial);
    this.root.add(this.box);

    this.boundsMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00, transparent: true, opacity: 0.1 });
    this.boundsModel = null;

    if (this.options.position) {
      this.root.position.copy(this.options.position);
    }

    if (this.options.url) {
      this.setModel(this.options.url);
    }
  }

  setPosition(position) {
    this.root.position.copy(position);
    if (this.onMove) {
      this.onMove(this);
    }
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

      if (this.boundsModel) {
        this.root.remove(this.boundsModel);
        this.boundsModel = null;
      }

      this.updateBox();
    }
  }

  getCollisionObject() {
    if (this.model) {
      return this.model;
    }
    return this.box;
  }

  getLinkPosition() {
    if (this.model) {
      const box = new THREE.Box3().setFromObject(this.boundsModel || this.model);
      const center = new THREE.Vector3();
      return box.getCenter(center);
    }
    return this.root.position;
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
    this.box.visible = !this.model;
  }

  onLoad = (gltf) => {
    this.clearModel();
    this.loadedModelUrl = this.loadingModelUrl;
    this.loadingModelUrl = null;
    this.model = gltf.scene;
    this.root.add(this.model);

    this.model.traverse(obj => {
      if (!this.boundsModel && obj.name.startsWith('__bounds')) {
        this.boundsModel = obj;
        this.root.add(this.boundsModel);
        this.boundsModel.material = this.boundsMaterial;
        this.boundsModel.visible = false;
      }
    });

    this.root.updateMatrixWorld();
    this.updateBox();

    if (this.onMove) {
      this.onMove(this);
    }

    if (this.onModelLoad) {
      this.onModelLoad();
    }
  };

  onLoadError = (error) => {
    console.log(`ERROR: Failed to load ${this.loadingModelUrl}: ${error}`);
    this.loadingModelUrl = null;
  };
}

export default SceneNode;
