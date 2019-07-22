import React from 'react';

const SceneContext = React.createContext();

class SceneProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      error: null,
      nodes: [],
    };
  }

  componentDidMount() {
    this.fetchScene();
    setTimeout(() => this.onNodeInsert({
      id: 3,
      model_url: '/models/DamagedHelmet.glb',
      x_pos: 0.0,
      y_pos: 6.0,
      z_pos: 2.5,
    }), 2500);
    setTimeout(() => this.onNodeUpdate({
      id: 3,
      model_url: '/models/DamagedHelmet.glb',
      x_pos: 0.0,
      y_pos: -0.5,
      z_pos: 2.5,
    }), 4500);
    setTimeout(() => this.onNodeDelete(3), 6000);
  }

  componentWillUnmount() {
  }

  fetchScene() {
    if (this.state.isLoading) return;
    this.setState({ isLoading: true });
    setTimeout(this.onFetchSceneFinish, 600);
  }

  onFetchSceneFinish = () => {
    this.setState({
      isLoading: true,
      nodes: [
        {
          id: 1,
          model_url: '/models/DamagedHelmet.glb',
          x_pos: 0.0,
          y_pos: 1.0,
          z_pos: 0.0,
        },
        {
          id: 2,
          model_url: '/models/DamagedHelmet.glb',
          x_pos: 2.0,
          y_pos: 0.5,
          z_pos: 0.0,
        },
      ]
    });
  };

  onNodeInsert = (node) => {
    const { nodes } = this.state;
    const index = nodes.findIndex(x => x.id === node.id);
    if (index >= 0) {
      this.fetchScene();
    } else {
      this.setState({
        nodes: [node].concat(nodes),
      });
    }
  };

  onNodeUpdate = (node) => {
    const { nodes } = this.state;
    const index = nodes.findIndex(x => x.id === node.id);
    if (index >= 0) {
      this.setState({
        nodes: nodes.slice(0, index).concat([node]).concat(nodes.slice(index + 1)),
      });
    } else {
      this.fetchScene();
    }
  };

  onNodeDelete = (nodeId) => {
    const { nodes } = this.state;
    const index = nodes.findIndex(x => x.id === nodeId);
    if (index >= 0) {
      this.setState({
        nodes: nodes.slice(0, index).concat(nodes.slice(index + 1)),
      });
    } else {
      this.fetchScene();
    }
  };

  render() {
    const { children } = this.props;
    return (
      <SceneContext.Provider value={{ ...this.state }}>
        {children}
      </SceneContext.Provider>
    );
  }
}

export { SceneContext, SceneProvider };
