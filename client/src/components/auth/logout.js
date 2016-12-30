import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../actions/auth-actions';

class Logout extends Component {
  componentWillMount() {
    this.props.logoutUser();
  }

  render() {
    return (
    	<section className="container">
    		<div className="row">
    			<div className="text-center">Sorry to see you go!</div>
    		</div>
    	</section>
	);
  }
}

export default connect(null, actions)(Logout);
