import * as THREE from 'three';

class SceneProxy {
  constructor(viewport, modelUrl) {
    this.group = new THREE.Group();
    viewport.add(this, modelUrl);

    //const geometry = new THREE.BoxGeometry(10, 10, 10);
    //const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    //this.cube = new THREE.Mesh(geometry, material);
    //this.cube.castShadow = true;
    //this.cube.receiveShadow = true;
    //viewport.scene.add(this.cube);
  }

  setModel(model) {
    this.group.add(model);
  }
}

export default SceneProxy;
