import * as THREE from 'three';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';

class Renderer {
  constructor(scene, camera, width, height) {
    this.scene = scene;
    this.camera = camera;

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(width, height);
    this.renderer.gammaInput = true;
    this.renderer.gammaOutput = true;
    this.renderer.shadowMap.enabled = true;

    this.initPasses(width, height);
  }

  initPasses(width, height) {
    this.composer = new EffectComposer(this.renderer);

    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    this.outlinePass = new OutlinePass(new THREE.Vector2(width, height), this.scene, this.camera);
    this.outlinePass.visibleEdgeColor = new THREE.Color(1.0, 0.75, 0.0);
    this.outlinePass.hiddenEdgeColor = new THREE.Color(1.0, 0.875, 0.5);
    this.outlinePass.edgeThickness = 0.25;
    this.outlinePass.edgeStrength = 10.0;
    this.composer.addPass(this.outlinePass);

    this.outlinePassHover = new OutlinePass(new THREE.Vector2(width, height), this.scene, this.camera);
    this.outlinePassHover.visibleEdgeColor = new THREE.Color(0.0, 0.75, 1.0);
    this.outlinePassHover.hiddenEdgeColor = new THREE.Color(0.5, 0.875, 1.0);
    this.outlinePassHover.edgeThickness = 0.025;
    this.outlinePassHover.edgeStrength = 5.0;
    this.composer.addPass(this.outlinePassHover);

    this.fxaaPass = new ShaderPass(FXAAShader);
    this.fxaaPass.uniforms['resolution'].value.set(1.0 / width, 1.0 / height);
    this.composer.addPass(this.fxaaPass);
  }

  getDomElement() {
    return this.renderer.domElement;
  }

  onResize(width, height) {
    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
    this.fxaaPass.uniforms['resolution'].value.set(1.0 / width, 1.0 / height);
  }

  setCamera(newCamera) {
    if (newCamera !== this.camera) {
      const prevCamera = this.camera;
      this.camera = newCamera;
      this.renderPass.camera = newCamera;
      this.updateOutlinePass(this.outlinePass, prevCamera, newCamera);
      this.updateOutlinePass(this.outlinePassHover, prevCamera, newCamera);
    }
  }

  updateOutlinePass(pass, prevCamera, newCamera) {
    pass.renderCamera = newCamera;
    if (prevCamera.isOrthographicCamera != newCamera.isOrthographicCamera) {
      const maskMaterial = pass.prepareMaskMaterial;
      const oldFunc = newCamera.isOrthographicCamera ? 'perspectiveDepthToViewZ' : 'orthographicDepthToViewZ';
      const newFunc = newCamera.isOrthographicCamera ? 'orthographicDepthToViewZ' : 'perspectiveDepthToViewZ';
      maskMaterial.fragmentShader = maskMaterial.fragmentShader.replace(oldFunc, newFunc);
      maskMaterial.needsUpdate = true;
    }
  }

  render() {
    this.composer.render();
  }
}

export default Renderer;