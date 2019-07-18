class Container {
  constructor(div) {
    this.div = div;
    this.onResize = [];

    this.width = this.div.clientWidth;
    this.height = this.div.clientHeight;
    this.aspect = this.width / this.height;
  }

  recompute() {
    if (this.width !== this.div.clientWidth || this.height !== this.div.clientHeight) {
      this.width = this.div.clientWidth;
      this.height = this.div.clientHeight;
      this.aspect = this.width / this.height;

      for (const func of this.onResize) {
        func(this.width, this.height, this.aspect);
      }
    }
  }
}

export default Container;
