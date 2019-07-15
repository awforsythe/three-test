class Hotkeys {
  constructor(mappings) {
    this.mappings = mappings;
    this.states = {};
    for (const keyCode in this.mappings) {
      this.states[keyCode] = false;
    }
  }

  onKeyDown(keyCode) {
    const state = this.states[keyCode];
    if (state !== undefined && !state) {
      this.states[keyCode] = true;
      if (this.mappings[keyCode].pressEvent) {
        this.mappings[keyCode].pressEvent();
      }
    }
  }

  onKeyUp(keyCode) {
    const state = this.states[keyCode];
    if (state !== undefined && state) {
      this.states[keyCode] = false;
      if (this.mappings[keyCode].releaseEvent) {
        this.mappings[keyCode].releaseEvent();
      }
    }
  }
}

export default Hotkeys;
