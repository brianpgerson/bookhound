import React, { Component } from 'react';
import { connect } from 'react-redux';
import DropdownList from 'react-widgets/lib/DropdownList'
import { Field, reduxForm } from 'redux-form';
import { states } from '../../constants/constants'
import { saveAddress } from '../../actions/signup-actions';
import { clearErrors } from '../../actions/error-actions';
import * as _ from 'lodash';

const form = reduxForm({
  form: 'address',
  validate
});

const requiredFields = ['streetAddressOne', 'city', 'zip', 'state'];

const renderField = field => (
    <div>
      <input className="form-control" {...field.input}/>
      {field.touched && field.error && <div className="error">{field.error}</div>}
    </div>
);

const renderSelectField = ({ input }) => (
  <div>
    <label>{input.label}</label>
    <div>
      <select className="form-control" {...input}>
        {input.children}
      </select>
    </div>
  </div>
)

function validate(formProps) {
  const errors = {};

  _.each(requiredFields, (field) => {
    if (!formProps[field]) {
          errors[field] = 'Please fill out this field';
    }
  });

  return errors;
}

class Address extends Component {
  handleFormSubmit(formProps) {
    this.props.saveAddress(formProps);
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
        <section className="container">
          <div className="row">
            <h1 className="text-center">What's Your Address?</h1>
            <p className="text-center col-md-6 col-md-offset-3">
            Let us know where to ship your books. You can always update this later, but for now, try and pick a place where you don't need to know about deliveries in advance. Please note that bookhound only ships to US states and territories currently</p>
          </div>
        </section>
        <section className="container">
          <div className="row">
            <div className="col-md-6 col-md-offset-3">
              <form onSubmit={handleSubmit(this.handleFormSubmit.bind(this))}>
                {this.renderAlert()}
                <div className="form-group">
                    <label>Street Address 1</label>
                    <Field name="streetAddressOne" className="form-control" component={renderField} type="text" />
                </div>
                <div className="form-group">
                    <label>Street Address 2</label>
                    <Field name="streetAddressTwo" className="form-control" component={renderField} type="text" />
                </div>
                <div className="form-group">
                    <label>City</label>
                    <Field name="city" className="form-control" component={renderField} type="text" />
                </div>
                <div className="form-group">
                    <Field name="state" component={renderSelectField} label="State">
                      { states.map(state => <option value={state.abbreviation}>{state.name}</option>) }
                    </Field>
                </div>
                <div className="form-group">
                    <label>Zip Code</label>
                    <Field name="zip" className="form-control" component={renderField} type="text" />
                </div>
                <div className="form-group">
                    <button type="submit" className="btn btn-primary">Save Address</button>
                </div>
              </form>
            </div>
          </div>
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

export default connect(mapStateToProps, { saveAddress, clearErrors })(form(Address));
