import * as THREE from 'three';

import CursorContext from './CursorContext.jsx';
import DragContext from './DragContext.jsx';

class Selection {
  constructor(container, switcher, addCursor, onHoveredChange, onClickedChange, onCanUndoDragChanged, onAddClick) {
    this.container = container;
    this.switcher = switcher;
    this.cursor = new CursorContext(this.container, onHoveredChange, onClickedChange)
    this.drag = new DragContext(this.switcher, onCanUndoDragChanged);
    this.onAddClick = onAddClick;
    this.drag.enabled = this.switcher.current.isOrthographicCamera;
    this.addCursor = addCursor;
    this.addMode = false;

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

  setAddMode(newAddMode) {
    if (this.addMode !== newAddMode) {
      this.addMode = newAddMode;
      this.addCursor.root.visible = newAddMode;
    }
  }

  handleCameraSwitch = (oldCamera, newCamera) => {
    this.drag.enabled = newCamera.isOrthographicCamera;
  };

  onMouseMove = (event) => {
    const { cursor, drag, addCursor } = this;
    event.preventDefault();
    if (cursor.reposition(event.clientX, event.clientY, cursor.pos)) {
      if (drag.current) {
        drag.update(cursor.pos);
      } else {
        addCursor.moveTo(cursor.pos, this.switcher.current);
      }
    }
  };

  onMouseDown = (event) => {
    const { cursor, drag, addCursor, addMode } = this;
    if (event.target.parentNode === this.container.div) {
      cursor.reposition(event.clientX, event.clientY, cursor.downPos);
      if (drag.enabled && !drag.current && cursor.hovered) {
        drag.start(cursor.hovered, cursor.hoveredPoint);
        if (addMode) {
          addCursor.root.visible = false;
        }
      }
    }
  };

  onMouseUp = (event) => {
    const { cursor, drag, addCursor, addMode } = this;
    const onCanvas = event.target.parentNode === this.container.div;
    const inCanvasBounds = cursor.reposition(event.clientX, event.clientY, cursor.upPos);

    if (drag.current) {
      if (inCanvasBounds) {
        drag.finish();
      } else {
        drag.cancel();
      }

      if (addMode) {
        addCursor.root.visible = true;
      }
    } else if (addMode) {
      if (this.onAddClick) {
        const pos = this.addCursor.root.position;
        this.onAddClick(pos.x, pos.y, pos.z);
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
