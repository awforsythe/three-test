import React from 'react';
import io from 'socket.io-client';

import { expectJson } from './util.jsx';

const SceneContext = React.createContext();

class SceneProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      error: null,
      nodes: [],
    };
    this.socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
  }

  componentDidMount() {
    this.fetchScene();
    this.socket.on('node insert', this.onNodeInsert);
    this.socket.on('node update', this.onNodeUpdate);
    this.socket.on('node delete', this.onNodeDelete);
  }

  componentWillUnmount() {
    this.socket.off('node insert', this.onNodeInsert);
    this.socket.off('node update', this.onNodeUpdate);
    this.socket.off('node delete', this.onNodeDelete);
  }

  fetchScene() {
    if (this.state.isLoading) return;
    this.setState({ isLoading: true });
    fetch('/api/nodes')
      .then(expectJson)
      .then(nodes => this.setState({ isLoading: false, error: null, nodes }))
      .catch(error => this.setState({ isLoading: false, error }));
  }

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
