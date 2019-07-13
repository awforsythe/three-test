import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

class Loader {
  constructor() {
    this.loader = new GLTFLoader();
  }

  load(url, proxy) {
    this.loader.load(url, (gltf) => {
      const model = gltf.scene;
      model.castShadow = true;
      model.receiveShadow = true;
      proxy.setModel(model);
    }, undefined, (error) => {
      console.log(error);
    });
  }
}

export default Loader;
