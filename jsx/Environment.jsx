import * as THREE from 'three';

import skyVertex from './shaders/skyVertex.glsl';
import skyFragment from './shaders/skyFragment.glsl';

class Environment {
  constructor(scene) {
    scene.background = new THREE.Color().setHSL(0.6, 0, 1);
    scene.fog = new THREE.Fog(scene.background, 1, 5000);

    this.axes = new THREE.AxesHelper(5);
    scene.add(this.axes);

    this.initHemiLight(scene);
    this.initDirLight(scene);
    this.initGround(scene);
    this.initSky(scene);
  }

  initHemiLight(scene) {
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
    this.hemiLight.color.setHSL(0.6, 1, 0.6);
    this.hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    this.hemiLight.position.set(0, 50, 0);
    scene.add(this.hemiLight);

    //this.hemiLightHelper = new THREE.HemisphereLightHelper(this.hemiLight, 10);
    //scene.add(this.hemiLightHelper);
  }

  initDirLight(scene) {
    this.dirLight = new THREE.DirectionalLight(0xffffff, 1);
    this.dirLight.color.setHSL(0.1, 1, 0.95);
    this.dirLight.position.set(-1, 1.75, 1);
    this.dirLight.position.multiplyScalar(30);
    scene.add(this.dirLight);

    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.left = -50;
    this.dirLight.shadow.camera.right = 50;
    this.dirLight.shadow.camera.top = 50;
    this.dirLight.shadow.camera.bottom = -50;
    this.dirLight.shadow.camera.far = 3500;
    this.dirLight.shadow.bias = - 0.0001;

    //this.dirLightHeper = new THREE.DirectionalLightHelper(this.dirLight, 10);
    //scene.add(this.dirLightHeper);
  }

  initGround(scene) {
    const geo = new THREE.PlaneBufferGeometry(10000, 10000);
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    mat.color.setHSL(0.095, 1, 0.75);

    this.ground = new THREE.Mesh(geo, mat);
    this.ground.position.y = -33;
    this.ground.rotation.x = -Math.PI / 2.0;
    this.ground.receiveShadow = true;
    scene.add(this.ground);
  }

  initSky(scene) {
    let uniforms = {
      topColor: { value: new THREE.Color(0x0077ff) },
      bottomColor: { value: new THREE.Color(0xffffff) },
      offset: { value: 33 },
      exponent: { value: 0.6 },
    };
    uniforms.topColor.value.copy(this.hemiLight.color);
    scene.fog.color.copy(uniforms.bottomColor.value);

    const geo = new THREE.SphereBufferGeometry(4000, 32, 15);
    const mat = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: skyVertex,
      fragmentShader: skyFragment,
      side: THREE.BackSide
    });
    this.sky = new THREE.Mesh(geo, mat);
    scene.add(this.sky);
  }
}

export default Environment;
