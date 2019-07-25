class SelectionState {
  constructor(onChange, onSelect) {
    this.hovered = null;
    this.selected = null;
    this.onChange = onChange;
    this.onSelect = onSelect;
  }

  handleHover = (nodeOrLink) => {
    if (nodeOrLink !== this.hovered) {
      this.hovered = nodeOrLink;
      this.onChange(this.hovered, this.selected);
    }
  };

  handleClick = (nodeOrLink) => {
    if (nodeOrLink !== this.selected) {
      if (nodeOrLink) {
        const type = nodeOrLink.isSceneNode ? 'node' : 'link';
        const handle = nodeOrLink.handle;
        this.onSelect(type, handle);
      } else {
        this.onSelect(null, null);
      }
    }
  };

  setSelection(nodeOrLink) {
    if (nodeOrLink !== this.selected) {
      this.selected = nodeOrLink;
      this.onChange(this.hovered, this.selected);
    }
  }
}

export default SelectionState;
