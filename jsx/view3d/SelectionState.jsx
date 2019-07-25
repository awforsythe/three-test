class SelectionState {
  constructor(onChange, onSelect, onLink) {
    this.hovered = null;
    this.selected = null;
    this.onChange = onChange;
    this.onSelect = onSelect;
    this.onLink = onLink;
  }

  handleHover = (nodeOrLink) => {
    if (nodeOrLink !== this.hovered) {
      this.hovered = nodeOrLink;
      this.onChange(this.hovered, this.selected);
    }
  };

  handleClick = (nodeOrLink, linkMode) => {
    if (linkMode) {
      if (nodeOrLink && nodeOrLink.isSceneNode && nodeOrLink != this.selected && this.selected) {
        this.onLink(this.selected.handle, nodeOrLink.handle);
      }
      this.onSelect(null, null);
    } else {
      if (nodeOrLink !== this.selected) {
        if (nodeOrLink) {
          const type = nodeOrLink.isSceneNode ? 'node' : 'link';
          const handle = nodeOrLink.handle;
          this.onSelect(type, handle);
        } else {
          this.onSelect(null, null);
        }
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
