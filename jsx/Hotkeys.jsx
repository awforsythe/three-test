class Hotkeys {
  constructor(mappings) {
    this.mappings = mappings;
    this.states = {};
    for (const keyCode in this.mappings) {
      this.states[keyCode] = false;
    }
  }

  register() {
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);
  }

  unregister() {
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
  }

  onKeyDown = (event) => {
    const state = this.states[event.keyCode];
    if (state !== undefined) {
      this.handleKeyState(true, event.keyCode);
    }
  };

  onKeyUp = (event) => {
    const state = this.states[event.keyCode];
    if (state !== undefined) {
      this.handleKeyState(false, event.keyCode);
    }
  };

  handleKeyState(newState, keyCode) {
    if (this.states[keyCode] === !newState) {
      this.states[keyCode] = newState;
      const func = newState ? this.mappings[keyCode].pressEvent : this.mappings[keyCode].releaseEvent;
      if (func) {
        func();
      }
    }
  }
}

export default Hotkeys;
