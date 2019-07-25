class ViewportState {
  constructor(onChange) {
    this.cameraType = 'persp';
    this.frameCount = 0;
    this.undoCount = 0;
    this.selection = { type: null, handle: null };
    this.addMode = false;

    this.onChange = onChange;
  }

  get() {
    return {
      cameraType: this.cameraType,
      frameCount: this.frameCount,
      undoCount: this.undoCount,
      selection: this.selection,
      addMode: this.addMode,
    };
  }

  toggleCamera = () => {
    this.addMode = false;
    this.cameraType = this.cameraType === 'top' ? 'persp' : 'top';
    this.onChange({ addMode: this.addMode, cameraType: this.cameraType });
  };

  frame = () => {
    this.frameCount += 1;
    this.onChange({ frameCount: this.frameCount });
  };

  undo = () => { 
    this.undoCount += 1;
    this.onChange({ undoCount: this.undoCount });
  };

  setSelection = (type, handle) => {
    const deselect = !handle;
    if (deselect) {
      if (this.selection.handle) {
        this.selection.type = null;
        this.selection.handle = null;
        this.onChange({ selection: { type: null, handle: null } });
      }
    } else {
      if (this.selection.type !== type || this.selection.handle !== handle) {
        this.selection.type = type;
        this.selection.handle = handle;
        this.onChange({ selection: { type: this.selection.type, handle: this.selection.handle } });
      }
    }
  };

  toggleAddMode = () => {
    this.addMode = !this.addMode;
    this.onChange({ addMode: this.addMode });
  };

  setAddMode = (addMode) => {
    if (addMode !== this.addMode) {
      this.addMode = addMode;
      this.onChange({ addMode: this.addMode });
    }
  };
}

export default ViewportState;
