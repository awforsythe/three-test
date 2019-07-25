import React from 'react';
import io from 'socket.io-client';

import { expectJson } from './util.jsx';

const NodesContext = React.createContext();

class NodesProvider extends React.Component {
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
    this.fetchNodes();
    this.socket.on('node insert', this.onNodeInsert);
    this.socket.on('node update', this.onNodeUpdate);
    this.socket.on('node delete', this.onNodeDelete);
  }

  componentWillUnmount() {
    this.socket.off('node insert', this.onNodeInsert);
    this.socket.off('node update', this.onNodeUpdate);
    this.socket.off('node delete', this.onNodeDelete);
  }

  fetchNodes() {
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
      this.fetchNodes();
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
      this.fetchNodes();
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
      this.fetchNodes();
    }
  };

  render() {
    const { children } = this.props;
    return (
      <NodesContext.Provider value={{ ...this.state }}>
        {children}
      </NodesContext.Provider>
    );
  }
}

export { NodesContext, NodesProvider };
