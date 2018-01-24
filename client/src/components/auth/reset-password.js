import React, { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { Field, reduxForm } from 'redux-form';
import { resetPassword } from '../../actions/auth-actions';

const form = reduxForm({
  form: 'resetPassword',
  validate,
});

function validate(formProps) {
  const errors = {};

  if (!formProps.password) {
    errors.password = 'Please enter a new password';
  }

  if (!formProps.passwordConfirm) {
    errors.passwordConfirm = 'Please confirm new password';
  }

  if (formProps.password !== formProps.passwordConfirm) {
    errors.password = 'Passwords must match';
  }

  return errors;
}

const renderField = field => (
  <div>
    <input className="form-control" {...field.input} type={field.type}/>
    {field.meta.touched && field.meta.error && <div className="error">{field.meta.error}</div>}
  </div>
);

class ResetPassword extends Component {
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

  handleFormSubmit({ password }) {
    const resetToken = this.props.params.resetToken;
    this.props.resetPassword(resetToken, { password });

  }

  renderAlert() {
    if (this.props.errorMessage) {
      return (
        <div className="alert alert-danger">
          <strong>Oops!</strong> {this.props.errorMessage}
        </div>
      );
    } else if (this.props.message) {
      return (
        <div className="alert alert-success">
          <strong>Success!</strong> {this.props.message}
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
                  <form onSubmit={handleSubmit(this.handleFormSubmit.bind(this))}>
                    <fieldset className="form-group">
                      <label>New Password:</label>
                      <Field name="password" component={renderField} type="password" />
                    </fieldset>

                    <fieldset className="form-group">
                      <label>Confirm New Password:</label>
                      <Field name="passwordConfirm" type="password" component={renderField} />
                    </fieldset>

                    {this.renderAlert()}
                    <button action="submit" className="btn btn-primary">Change Password</button>
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
  return { errorMessage: state.auth.error, message: state.auth.resetMessage };
}

export default connect(mapStateToProps, { resetPassword })(form(ResetPassword));
