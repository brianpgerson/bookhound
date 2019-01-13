import React, { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { Field, reduxForm } from 'redux-form';
import { Link } from 'react-router';
import { loginUser } from '../../actions/auth-actions';
import { clearErrors } from '../../actions/error-actions';

const form = reduxForm({
  form: 'login',
});

class Login extends Component {
  handleFormSubmit(formProps) {
    this.props.loginUser(formProps).then(res => {
      if (!this.props.errorMessage && this.props.authenticated) {
        browserHistory.push('/dashboard');
      }
    })
  }

  componentWillUnmount() {
    this.props.clearErrors();
  }

  renderAlert() {
    if (this.props.errorMessage) {
      return (
        <div>
          <span><strong>Error:</strong> {this.props.errorMessage}</span>
        </div>
      );
    }
  }

  render() {
    const { handleSubmit } = this.props;

    return (
      <section className="container">
        <div className="row">
          <h1 className="text-center">Log In</h1>
        </div>
        <div className="row">
          <div className="col-md-6 col-md-offset-3">
            <form onSubmit={handleSubmit(this.handleFormSubmit.bind(this))}>
              {this.renderAlert()}
              <div className="form-group">
                <label>Email</label>
                <Field name="email" className="form-control" component="input" type="text" />
              </div>
              <div className="form-group">
                <label>Password</label>
                <Field name="password" className="form-control" component="input" type="password" />
              </div>
              <div className="form-group">
                <button type="submit" className="btn btn-primary">Login</button>
              </div>
            </form>
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>
        </div>
      </section>
    );
  }
}

function mapStateToProps(state) {
  return {
    errorMessage: state.error.message,
    message: state.auth.message,
    authenticated: state.auth.authenticated,
  };
}

export default connect(mapStateToProps, { loginUser, clearErrors })(form(Login));
