import React from 'react';
import io from 'socket.io-client';

import { expectJson } from './util.jsx';

const ModelsContext = React.createContext();

class ModelsProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      error: null,
      models: [],
    };
  }

  componentDidMount() {
    this.fetchModels();
  }

  fetchModels() {
    if (this.state.isLoading) return;
    this.setState({ isLoading: true });
    fetch('/api/models')
      .then(expectJson)
      .then(models => this.setState({ isLoading: false, error: null, models }))
      .catch(error => this.setState({ isLoading: false, error }));
  }

  render() {
    const { children } = this.props;
    return (
      <ModelsContext.Provider value={{ ...this.state }}>
        {children}
      </ModelsContext.Provider>
    );
  }
}

export { ModelsContext, ModelsProvider };
