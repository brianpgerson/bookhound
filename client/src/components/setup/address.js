import React, { Component } from 'react';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { Field, reduxForm } from 'redux-form';
import * as constants from '../../constants/constants'
import { saveAddress,
         updateAddress,
         getUserSetup } from '../../actions/setup-actions';
import { clearErrors } from '../../actions/error-actions';
import * as _ from 'lodash';

const form = reduxForm({
  form: 'address',
  validate
});

const requiredFields = ['streetAddressOne', 'city', 'zip', 'state'];

const renderField = field => (
    <div>
      <input className="form-control" {...field.input} type={field.type}/>
      {field.meta.touched && field.meta.error && <div className="error">{field.meta.error}</div>}
    </div>
);

const renderSelectField = field => (
  <div>
    <label>{field.label}</label>
    <div>
      <select className="form-control" {...field.input}>
        {field.children}
      </select>
    </div>
    {field.meta.touched && field.meta.error && <div className="error">{field.meta.error}</div>}
  </div>
)

function validate(formProps) {
  const errors = {};

  _.each(requiredFields, (field) => {
    if (!formProps[field]) {
      errors[field] = 'Please fill out this field';
    } else if (field === 'zip' && formProps[field].length < 5) {
      errors[field] = 'Invalid zip code';
    }
  });

  return errors;
}

const numOnly = (val, prevVal) => {
   if (!value) {
    return value
  }
  return value.replace(/[^\d]/g, '');
}

class Address extends Component {

  constructor(props) {
    super(props);
    this.props.getUserSetup();
  }

  handleFormSubmit(formProps) {
    const {saveAddress, updateAddress, address} = this.props;
    let next;
    if (!!address.streetAddressOne) {
      updateAddress(formProps);
      next = '/dashboard'
    } else {
      saveAddress(formProps);
      next = '/wishlist';
    }
      browserHistory.push(next);
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
    const { handleSubmit, address } = this.props;

    return (
      <div>
        <h1 className="text-center margin-bottom-20 no-min-height is-josefin">{!!address.streetAddressOne ? 'Update Your Address' : 'Enter Your Address'}</h1>
        <section className="container">
          <div className="row">
            <div className="col-md-6 col-md-offset-3 is-white-background pad-50 panel">
              <div className="row">
                <div>
                  Let us know where to ship your books. You can always update this later, but for now, try and pick a place where you don't need to know about deliveries in advance. Please note that bookhound only ships to US states and territories currently.
                </div>
              </div>
              <hr />
              <div className="row">
                <div>
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
                          { constants.states.map(function (state) { return <option value={state.abbreviation}>{state.name}</option> })}
                        </Field>
                    </div>
                    <div className="form-group">
                        <label>Zip Code</label>
                        <Field name="zip" className="form-control" component={renderField} type="number" />
                    </div>
                    <div className="form-group">
                        <button type="submit" className="btn btn-primary">Save Address</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="row push-down">
        </section>a
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    errorMessage: state.error.message,
    message: state.auth.message,
    address: state.setup.address
  };
}

export default connect(mapStateToProps, { saveAddress, updateAddress, getUserSetup, clearErrors })(form(Address));
