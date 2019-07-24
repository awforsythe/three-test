class ViewportEvents {
  constructor() {
    this.onRegister = null;          // ()
    this.onFramePress = null;        // ()
    this.onToggleCameraPress = null; // ()
    this.onCanUndoChanged = null;    // (bool)
    this.onNodeAdd = null;           // (float, float, float)
    this.onNodeMove = null;          // (int, float, float, float)
    this.onNodeDelete = null;        // (int)
    this.onNodeSelect = null;        // (int?)
  }

  dispatch(f, ...args) {
    return f ? f(...args) : null;
  }
}

export default ViewportEvents;
