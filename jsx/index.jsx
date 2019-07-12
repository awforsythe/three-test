import * as THREE from 'three';

import skyVertex from './shaders/skyVertex.glsl';
import skyFragment from './shaders/skyFragment.glsl';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Camera
const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1.0, 8000.0);
camera.position.set(500, 0, 250);

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color().setHSL(0.6, 0, 1);
scene.fog = new THREE.Fog(scene.background, 1, 5000);

// Hemisphere light
const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
hemiLight.color.setHSL(0.6, 1, 0.6);
hemiLight.groundColor.setHSL(0.095, 1, 0.75);
hemiLight.position.set(0, 50, 0);
scene.add(hemiLight);

const hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10);
scene.add(hemiLightHelper);

// Directional light
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.color.setHSL(0.1, 1, 0.95);
dirLight.position.set(-1, 1.75, 1);
dirLight.position.multiplyScalar(30);
scene.add(dirLight);

dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.left = -50;
dirLight.shadow.camera.right = 50;
dirLight.shadow.camera.top = 50;
dirLight.shadow.camera.bottom = -50;
dirLight.shadow.camera.far = 3500;
dirLight.shadow.bias = - 0.0001;

const dirLightHeper = new THREE.DirectionalLightHelper(dirLight, 10);
scene.add( dirLightHeper );

// Ground
const groundGeo = new THREE.PlaneBufferGeometry(10000, 10000);
const groundMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
groundMat.color.setHSL(0.095, 1, 0.75);
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.position.y = -33;
ground.rotation.x = -Math.PI / 2.0;
ground.receiveShadow = true;
scene.add(ground);

// Sky
let uniforms = {
  "topColor": { value: new THREE.Color( 0x0077ff ) },
  "bottomColor": { value: new THREE.Color( 0xffffff ) },
  "offset": { value: 33 },
  "exponent": { value: 0.6 }
};
uniforms["topColor"].value.copy(hemiLight.color);
scene.fog.color.copy(uniforms[ "bottomColor" ].value);
const skyGeo = new THREE.SphereBufferGeometry(4000, 32, 15);
const skyMat = new THREE.ShaderMaterial({
  uniforms: uniforms,
  vertexShader: skyVertex,
  fragmentShader: skyFragment,
  side: THREE.BackSide
});
const sky = new THREE.Mesh(skyGeo, skyMat);
scene.add(sky);


// Model
const geometry = new THREE.BoxGeometry(10, 10, 10);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
cube.castShadow = true;
cube.receiveShadow = true;
scene.add(cube);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

renderer.gammaInput = true;
renderer.gammaOutput = true;
renderer.shadowMap.enabled = true;

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
const draggable = [cube];
const drag = new DragControls(draggable, camera, renderer.domElement);
drag.addEventListener('dragstart', () => controls.enabled = false);
drag.addEventListener('dragend', () => controls.enabled = true);

controls.update()

const loader = new GLTFLoader();
loader.load('/models/DamagedHelmet.glb', (gltf) => {
  const model = gltf.scene;
  model.scale.set(50, 50, 50);
  model.position.set(0, 20, 0);
  model.castShadow = true;
  model.receiveShadow = true;
  cube.add(model);
}, undefined, (error) => {
  console.log(error);
});

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener('resize', onWindowResize, false);
animate();
