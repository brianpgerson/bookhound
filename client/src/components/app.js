import React, { Component } from 'react';
import FooterTemplate from './template/footer';
import HeaderTemplate from './template/header'

class App extends Component {
  render() {
    return (
      <div>
      <HeaderTemplate logo="BookHound" />

      <div>
        {this.props.children}
      </div>

      <FooterTemplate />
      </div>
    );
  }
}

export default App;
