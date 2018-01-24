import React, { Component } from 'react';
import {browserHistory } from 'react-router';
import { connect } from 'react-redux';

export default function(ComposedComponent) {
  class Authentication extends Component {
    static contextTypes = {
      router: React.PropTypes.object
    }

    componentWillMount() {
      if(!this.props.authenticated) {
        browserHistory.push('/login');
      }
    }

    componentWillUpdate(nextProps) {
      if(!nextProps.authenticated) {
        browserHistory.push('/login');
      }
    }

    render() {
      return <ComposedComponent {...this.props} />
    }
  }

  function mapStateToProps(state) {
    return { authenticated: state.auth.authenticated };
  }

  return connect(mapStateToProps)(Authentication);
}
