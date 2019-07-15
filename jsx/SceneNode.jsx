import * as THREE from 'three';

class SceneNode {
  constructor(loader, options) {
    this.loader = loader;
    this.options = options;
    this.root = new THREE.Group();

    this.model = null;
    this.loadedModelUrl = null;
    this.loadingModelUrl = null;

    if (this.options.url) {
      this.setModel(this.options.url);
    }
  }

  setModel(url) {
    if (url != this.loadedModelUrl) {
      if (this.loadingModelUrl) {
        console.log(`ERROR: Already loading model ${this.loadingModelUrl}; can not set new model to ${url}`);
        return;
      }

      if (url) {
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
    }
  }

  onLoad = (gltf) => {
    this.clearModel();
    this.loadedModelUrl = this.loadingModelUrl;
    this.loadingModelUrl = null;
    this.model = gltf.scene;
    this.root.add(this.model);
  };

  onLoadError = (error) => {
    console.log(`ERROR: Failed to load ${this.loadingModelUrl}: ${error}`);
    this.loadingModelUrl = null;
  };
}

export default SceneNode;
