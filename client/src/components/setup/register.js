import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { registerUser } from '../../actions/auth-actions';
import { clearErrors } from '../../actions/error-actions';

const form = reduxForm({
  form: 'register',
  validate
});

const renderField = field => (
    <div>
      <input type={field.type} className="form-control" {...field.input}/>
      {field.meta.touched && field.meta.error && <div className="error">{field.meta.error}</div>}
    </div>
);

function invalidEmail(email) {
  return email.indexOf('@') < 0;
};

function invalidPassword(password) {
  return password.length < 8 || !/\d/.test(password);
}

function validate(formProps) {
  const errors = {};

  if (!formProps.firstName) {
    errors.firstName = 'Please enter a first name';
  }

  if (!formProps.lastName) {
    errors.lastName = 'Please enter a last name';
  }

  if (!formProps.email) {
    errors.email = 'Please enter an email';
  }

  if (!!formProps.email && invalidEmail(formProps.email)) {
    errors.email = 'Please enter a valid email';
  }

  if (!formProps.password) {
    errors.password = 'Please enter a password';
  }

  if (!!formProps.password && invalidPassword(formProps.password)) {
    errors.password = 'Please enter a valid password: at least 8 charactors long and containing at least one number';
  }

  return errors;
}

class Register extends Component {
  handleFormSubmit(formProps) {
    this.props.registerUser(formProps).then(res => browserHistory.push('/address'));
  }

  componentWillUnmount() {
    this.props.clearErrors();
  }

  renderAlert() {
    if(this.props.errorMessage) {
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
       <div>
        <h1 className="text-center">Sign Up</h1>
        <section className="container">
          <div className="row">
            <div className="col-md-4 col-md-offset-4 is-white-background form-panel">
              <div className="row">
                <div>
                  Welcome to bookhound!
                </div>
              </div>
              <hr />
              <div className="row">
                <div>
                  <form onSubmit={handleSubmit(this.handleFormSubmit.bind(this))}>
                  {this.renderAlert()}
                  <div className="form-group">
                    <label>First Name</label>
                    <Field name="firstName" className="form-control" component={renderField} type="text" />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <Field name="lastName" className="form-control" component={renderField} type="text" />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <Field name="email" className="form-control" component={renderField} type="text" />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <Field name="password" className="form-control" component={renderField} type="password" />
                  </div>
                  <div className="form-group">
                    <button type="submit" className="btn btn-primary">Register</button>
                  </div>
                </form>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="row push-down">
        </section>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    errorMessage: state.error.message,
    message: state.auth.message
  };
}

export default connect(mapStateToProps, { registerUser, clearErrors })(form(Register));
