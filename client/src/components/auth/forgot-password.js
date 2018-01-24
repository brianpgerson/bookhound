import React, { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { Field, reduxForm } from 'redux-form';
import { getForgotPasswordToken } from '../../actions/auth-actions';

const form = reduxForm({
  form: 'forgotPassword',
});

class ForgotPassword extends Component {
  static contextTypes = {
    router: React.PropTypes.object,
  }

  componentWillMount() {
    if (this.props.authenticated) {
      browserHistory.push('/dashboard');
    }
  }

  componentWillUpdate(nextProps) {
    if (nextProps.authenticated) {
      browserHistory.push('/dashboard');
    }
  }

  handleFormSubmit(formProps) {
    this.props.getForgotPasswordToken(formProps).then(res => {
      browserHistory.push('/');
    })
  }

  renderAlert() {
    if (this.props.errorMessage) {
      return (
        <div>
          <span><strong>Oops!</strong> {this.props.errorMessage}</span>
        </div>
      );
    }
  }

  render() {
    const { handleSubmit } = this.props;

    return (
      <div>
        <h1 className="text-center">Reset Your Password</h1>
          <section className="container">
            <div className="row">
              <div className="col-md-6 col-md-offset-3 is-white-background form-panel">
                <div className="row">
                  <div className="form-group">
                    Enter your email and we'll send you a link to reset your password with.
                  </div>
                </div>
                <div className="row">
                  <form onSubmit={handleSubmit(this.handleFormSubmit.bind(this))}>
                    <div>
                      {this.renderAlert()}
                      <label>Email</label>
                      <Field name="email" className="form-control form-group" component="input" type="text" />
                    </div>
                    <button type="submit" className="btn btn-primary">Reset Password</button>
                  </form>
                </div>
              </div>  
          </div>
        </section>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    errorMessage: state.auth.error,
    message: state.auth.message,
    authenticated: state.auth.authenticated,
  };
}

export default connect(mapStateToProps, { getForgotPasswordToken })(form(ForgotPassword));
