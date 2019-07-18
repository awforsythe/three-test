import * as THREE from 'three';

import CursorContext from './CursorContext.jsx';
import DragContext from './DragContext.jsx';

class Selection {
  constructor(container, switcher, onHoveredChange, onClickedChange, onCanUndoDragChanged) {
    this.container = container;
    this.switcher = switcher;
    this.cursor = new CursorContext(this.container, onHoveredChange, onClickedChange)
    this.drag = new DragContext(this.switcher, onCanUndoDragChanged);
    this.drag.enabled = this.switcher.current.isOrthographicCamera;

    this.switcher.onSwitch.push(this.handleCameraSwitch);
  }

  register() {
    document.addEventListener('mousemove', this.onMouseMove, false);
    document.addEventListener('mousedown', this.onMouseDown);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  unregister() {
    document.removeEventListener('mousemove', this.onMouseMove, false);
    document.removeEventListener('mousedown', this.onMouseDown);
    document.removeEventListener('mouseup', this.onMouseUp);
  }

  handleCameraSwitch = (oldCamera, newCamera) => {
    this.drag.enabled = newCamera.isOrthographicCamera;
  };

  onMouseMove = (event) => {
    const { cursor, drag } = this;
    event.preventDefault();
    if (cursor.reposition(event.clientX, event.clientY, cursor.pos)) {
      if (drag.current) {
        drag.update(cursor.pos);
      }
    }
  };

  onMouseDown = (event) => {
    const { cursor, drag } = this;
    if (event.target.parentNode === this.container.div) {
      cursor.reposition(event.clientX, event.clientY, cursor.downPos);
      if (drag.enabled && !drag.current && cursor.hovered) {
        drag.start(cursor.hovered, cursor.hoveredPoint);
      }
    }
  };

  onMouseUp = (event) => {
    const { cursor, drag } = this;
    const onCanvas = event.target.parentNode === this.container.div;
    const inCanvasBounds = cursor.reposition(event.clientX, event.clientY, cursor.upPos);

    if (drag.current) {
      if (inCanvasBounds) {
        drag.finish();
      } else {
        drag.cancel();
      }
    }

    if (onCanvas && inCanvasBounds) {
      cursor.updateClicked();
    }
  };

  update(nodes) {
    this.cursor.updateHovered(this.switcher.current, nodes);
  }
}

export default Selection;
