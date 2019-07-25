import React from 'react';
import io from 'socket.io-client';

import { expectJson } from './util.jsx';

const LinksContext = React.createContext();

class LinksProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      error: null,
      links: [],
    };
    this.socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
  }

  componentDidMount() {
    this.fetchLinks();
    this.socket.on('link insert', this.onLinkInsert);
    this.socket.on('link delete', this.onLinkDelete);
  }

  componentWillUnmount() {
    this.socket.off('link insert', this.onLinkInsert);
    this.socket.off('link delete', this.onLinkDelete);
  }

  fetchLinks() {
    if (this.state.isLoading) return;
    this.setState({ isLoading: true });
    fetch('/api/links')
      .then(expectJson)
      .then(links => this.setState({ isLoading: false, error: null, links }))
      .catch(error => this.setState({ isLoading: false, error }));
  }

  onLinkInsert = (link) => {
    const { links } = this.state;
    const index = links.findIndex(x => x.id === link.id);
    if (index >= 0) {
      this.fetchLinks();
    } else {
      this.setState({
        links: [link].concat(links),
      });
    }
  };

  onLinkDelete = (linkId) => {
    const { links } = this.state;
    const index = links.findIndex(x => x.id === linkId);
    if (index >= 0) {
      this.setState({
        links: links.slice(0, index).concat(links.slice(index + 1)),
      });
    } else {
      this.fetchLinks();
    }
  };

  render() {
    const { children } = this.props;
    return (
      <LinksContext.Provider value={{ ...this.state }}>
        {children}
      </LinksContext.Provider>
    );
  }
}

export { LinksContext, LinksProvider };
