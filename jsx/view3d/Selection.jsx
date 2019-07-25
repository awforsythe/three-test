import * as THREE from 'three';

import CursorContext from './CursorContext.jsx';
import DragContext from './DragContext.jsx';

class Selection {
  constructor(container, switcher, addCursor, selectionState, onCanUndoDragChanged, onAddClick, onNodeMove) {
    this.container = container;
    this.switcher = switcher;
    this.addCursor = addCursor;
    this.selectionState = selectionState;

    this.cursor = new CursorContext(this.container, selectionState)
    this.drag = new DragContext(this.switcher, onCanUndoDragChanged);
    this.drag.enabled = this.switcher.current.isOrthographicCamera;

    this.onAddClick = onAddClick;
    this.onNodeMove = onNodeMove;
    this.addMode = false;
    this.linkMode = false;

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

  setLinkMode(newLinkMode) {
    if (this.linkMode !== newLinkMode) {
      this.linkMode = newLinkMode;
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
    const { cursor, drag, addCursor, selectionState, addMode } = this;
    if (event.target.parentNode === this.container.div) {
      cursor.reposition(event.clientX, event.clientY, cursor.downPos);
      if (drag.enabled && !drag.current && selectionState.hovered && selectionState.hovered.isSceneNode) {
        drag.start(selectionState.hovered, cursor.hoveredPoint);
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
        const movedNode = drag.finish();
        if (movedNode && this.onNodeMove) {
          const pos = movedNode.root.position;
          this.onNodeMove(movedNode.handle, pos.x, pos.y, pos.z);
        }
      } else {
        drag.cancel();
      }

      if (addMode) {
        addCursor.root.visible = true;
      }
    } else if (addMode && onCanvas) {
      if (this.onAddClick) {
        const pos = this.addCursor.root.position;
        this.onAddClick(pos.x, pos.y, pos.z);
        drag.undoStack.clear();
      }
    }

    if (onCanvas && inCanvasBounds) {
      cursor.updateClicked(this.linkMode);
    }
  };

  update(nodes, links) {
    this.cursor.updateHovered(this.switcher.current, nodes.concat(links));
  }

  undoLastMove() {
    const movedNode = this.drag.undo();
    if (movedNode && this.onNodeMove) {
      const pos = movedNode.root.position;
      this.onNodeMove(movedNode.handle, pos.x, pos.y, pos.z);
    }
  }
}

export default Selection;
