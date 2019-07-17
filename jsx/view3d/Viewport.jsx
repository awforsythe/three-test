import * as THREE from 'three';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';

import Hotkeys from './Hotkeys.jsx';
import Controls from './Controls.jsx';
import Selection from './Selection.jsx';
import Environment from './Environment.jsx';
import SceneNode from './SceneNode.jsx';

const FRUSTUM_SIZE = 15.0;

class Viewport {
  constructor(container, cameraType, hotkeyMappings) {
    this.container = container;

    THREE.Cache.enabled = true;

    const defaultMappings = {
      70: { pressEvent: this.frameSelection },
      84: { pressEvent: this.toggleCamera },
    };
    this.hotkeys = new Hotkeys({...defaultMappings, ...hotkeyMappings});

    const aspect = this.container.clientWidth / this.container.clientHeight;

    this.perspCamera = new THREE.PerspectiveCamera(55, aspect, 1.0, 8000.0);
    this.topCamera = new THREE.OrthographicCamera(FRUSTUM_SIZE * aspect * -0.5, FRUSTUM_SIZE * aspect * 0.5, FRUSTUM_SIZE * 0.5, FRUSTUM_SIZE * -0.5, 1.0, 1000.0);
    this.topCamera.position.set(0, 5, 0);
    this.camera = cameraType === 'top' ? this.topCamera : this.perspCamera;

    this.scene = new THREE.Scene();
    this.environment = new Environment(this.scene);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);

    this.controls = new Controls(this.camera, this.renderer.domElement);
    this.selection = new Selection(this.container);

    this.renderer.gammaInput = true;
    this.renderer.gammaOutput = true;
    this.renderer.shadowMap.enabled = true;

    this.composer = new EffectComposer(this.renderer);

    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    this.outlinePass = new OutlinePass(new THREE.Vector2(this.container.clientWidth, this.container.clientHeight), this.scene, this.camera);
    this.outlinePass.visibleEdgeColor = new THREE.Color(1.0, 0.75, 0.0);
    this.outlinePass.hiddenEdgeColor = new THREE.Color(1.0, 0.875, 0.5);
    this.outlinePass.edgeThickness = 0.25;
    this.outlinePass.edgeStrength = 10.0;
    this.composer.addPass(this.outlinePass);

    this.fxaaPass = new ShaderPass(FXAAShader);
    this.fxaaPass.uniforms['resolution'].value.set(1.0 / this.container.clientWidth, 1.0 / this.container.clientHeight);
    this.composer.addPass(this.fxaaPass);

    this.loader = new GLTFLoader();

    this.nodes = [];

    this.registered = false;

    this.frameSelection();
  }

  register() {
    if (!this.registered) {
      this.registered = true;
      this.container.appendChild(this.renderer.domElement);
      window.addEventListener('resize', this.onWindowResize, false);
      this.selection.register();
      this.hotkeys.register();

      this.animate();
    }
  }

  unregister() {
    if (this.registered) {
      this.registered = false;
      this.hotkeys.unregister();
      this.selection.unregister();
      window.removeEventListener('resize', this.onWindowResize, false);
      this.container.removeChild(this.renderer.domElement);
    }
  }

  setCameraType(newCameraType) {
    if (newCameraType === 'persp') {
      if (this.camera !== this.perspCamera) {
        this.toggleCamera();
      }
    } else if (newCameraType === 'top') {
      if (this.camera !== this.topCamera) {
        this.toggleCamera();
      }
    }
  }

  addNode(options) {
    const node = new SceneNode(this.loader, options);
    this.nodes.push(node);
    this.outlinePass.selectedObjects.push(node.root);
    this.scene.add(node.root);
    return node;
  }

  removeNode(node) {
    const index = this.nodes.findIndex(x => x == node);
    if (index >= 0) {
      this.nodes.splice(index, 1);
      this.scene.remove(node.root);
    }
  }

  getSceneBoundingBox() {
    if (this.selection.selectedNode) {
      return new THREE.Box3().setFromObject(this.selection.selectedNode.box);
    }

    if (this.nodes.length <= 0) {
      const s = 5.0;
      return new THREE.Box3(new THREE.Vector3(-s, -s, -s), new THREE.Vector3(s, s, s));
    }

    let min = new THREE.Vector3(Infinity, Infinity, Infinity);
    let max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
    for (const node of this.nodes) {
      const aabb = new THREE.Box3().setFromObject(node.box);
      if (aabb.min.x < min.x) { min.x = aabb.min.x; }
      if (aabb.min.y < min.y) { min.y = aabb.min.y; }
      if (aabb.min.z < min.z) { min.z = aabb.min.z; }
      if (aabb.max.x > max.x) { max.x = aabb.max.x; }
      if (aabb.max.y > max.y) { max.y = aabb.max.y; }
      if (aabb.max.z > max.z) { max.z = aabb.max.z; }
    }
    return new THREE.Box3(min, max);
  }

  frameSelection = () => {
    const aabb = this.getSceneBoundingBox();
    this.controls.frame(aabb);
  };

  toggleCamera = () => {
    this.camera = this.camera === this.perspCamera ? this.topCamera : this.perspCamera;
    this.controls.setCamera(this.camera);

    this.renderPass.camera = this.camera;
    this.outlinePass.renderCamera = this.camera;

    const maskMaterial = this.outlinePass.prepareMaskMaterial;
    const oldFunc = this.camera.isOrthographicCamera ? 'perspectiveDepthToViewZ' : 'orthographicDepthToViewZ';
    const newFunc = this.camera.isOrthographicCamera ? 'orthographicDepthToViewZ' : 'perspectiveDepthToViewZ';
    maskMaterial.fragmentShader = maskMaterial.fragmentShader.replace(oldFunc, newFunc);
    maskMaterial.needsUpdate = true;

    this.frameSelection();
  };

  onWindowResize = () => {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    const aspect = width / height;

    this.perspCamera.aspect = aspect;
    this.perspCamera.updateProjectionMatrix();

    this.topCamera.left = FRUSTUM_SIZE * aspect * -0.5;
    this.topCamera.right = FRUSTUM_SIZE * aspect * 0.5;
    this.topCamera.top = FRUSTUM_SIZE * 0.5;
    this.topCamera.bottom = FRUSTUM_SIZE * -0.5;
    this.topCamera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
    this.fxaaPass.uniforms['resolution'].value.set(1.0 / width, 1.0 / height);
  };

  animate = () => {
    if (this.registered) {
      requestAnimationFrame(this.animate);
      this.controls.update();
      this.selection.update(this.camera, this.nodes);
      //this.renderer.render(this.scene, this.camera);
      this.composer.render();
    }
  };
}

export default Viewport;
