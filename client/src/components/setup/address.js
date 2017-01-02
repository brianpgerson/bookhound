import React, { Component } from 'react';
import { connect } from 'react-redux';
import DropdownList from 'react-widgets/lib/DropdownList'
import { Field, reduxForm } from 'redux-form';
import { states } from '../../constants/constants'
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

  constructor(props) {
    super(props);
    this.props.getUserSetup();
  }

  handleFormSubmit(formProps) {
    const {saveAddress, updateAddress, address} = this.props;
    if (!!address.streetAddressOne) {
      updateAddress(formProps);
    } else {
      saveAddress(formProps);
    }
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
        <h1 className="text-center">{!!address.streetAddressOne ? 'Update Your Address' : 'Enter Your Address'}</h1>
        <section className="container">
          <div className="row">
            <div className="col-md-4 col-md-offset-4 is-white-background form-panel">
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
    message: state.auth.message,
    address: state.setup.address
  };
}

export default connect(mapStateToProps, { saveAddress, updateAddress, getUserSetup, clearErrors })(form(Address));
