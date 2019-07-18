import * as THREE from 'three';

const FRUSTUM_SIZE = 15.0;

class CameraSwitcher {
  constructor(container, type) {
    this.persp = new THREE.PerspectiveCamera(55, container.aspect, 1.0, 8000.0);
    this.top = new THREE.OrthographicCamera(
      FRUSTUM_SIZE * container.aspect * -0.5,
      FRUSTUM_SIZE * container.aspect * 0.5,
      FRUSTUM_SIZE * 0.5,
      FRUSTUM_SIZE * -0.5,
      1.0, 1000.0,
    );
    this.top.position.set(0, 5, 0);

    this.type = type;
    this.current = this.type === 'top' ? this.top : this.persp;

    this.onSwitch = [];
    container.onResize.push(this.handleContainerResize);
  }

  handleContainerResize = (width, height, aspect) => {
    this.persp.aspect = aspect;
    this.persp.updateProjectionMatrix();

    this.top.left = FRUSTUM_SIZE * aspect * -0.5;
    this.top.right = FRUSTUM_SIZE * aspect * 0.5;
    this.top.top = FRUSTUM_SIZE * 0.5;
    this.top.bottom = FRUSTUM_SIZE * -0.5;
    this.top.updateProjectionMatrix();
  };

  setType(newType) {
    if (this.type !== newType && (newType === 'persp' || newType === 'top')) {
      this.type = newType;
      const prev = this.current;
      this.current = this.type === 'top' ? this.top : this.persp;

      for (const func of this.onSwitch) {
        func(prev, this.current);
      }
    }
  }

  toggle() {
    this.setType(this.type === 'top' ? 'persp' : 'top');
  }
}

export default CameraSwitcher;
