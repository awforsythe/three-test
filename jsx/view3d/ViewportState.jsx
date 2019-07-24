class ViewportState {
  constructor(onChange) {
    this.cameraType = 'persp';
    this.frameCount = 0;
    this.undoCount = 0;
    this.selectedNodeHandle = null;
    this.addMode = false;

    this.onChange = onChange;
  }

  get() {
    return {
      cameraType: this.cameraType,
      frameCount: this.frameCount,
      undoCount: this.undoCount,
      selectedNodeHandle: this.selectedNodeHandle,
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

  setSelectedNodeHandle = (handle) => {
    if (handle !== this.selectedNodeHandle) {
      this.selectedNodeHandle = handle;
      this.onChange({ selectedNodeHandle: this.selectedNodeHandle });
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
