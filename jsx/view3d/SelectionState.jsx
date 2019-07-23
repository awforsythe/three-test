class SelectionState {
  constructor(onChange, onSelect) {
    this.hovered = null;
    this.selected = null;
    this.onChange = onChange;
    this.onSelect = onSelect;
  }

  handleHover = (node) => {
    if (node !== this.hovered) {
      this.hovered = node;
      this.onChange(this.hovered, this.selected);
    }
  };

  handleClick = (node) => {
    if (node !== this.selected) {
      this.onSelect(node ? node.handle : null);
    }
  };

  setSelected(node) {
    if (node !== this.selected) {
      this.selected = node;
      this.onChange(this.hovered, this.selected);
    }
  }
}

export default SelectionState;
