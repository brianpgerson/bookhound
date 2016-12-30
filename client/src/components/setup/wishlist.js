import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { Link } from 'react-router';
import { saveWishlist } from '../../actions/setup-actions';
import { clearErrors } from '../../actions/error-actions';

const form = reduxForm({
  form: 'wishlist',
  validate
});

const renderField = field => (
    <div>
      <input className="form-control" {...field.input}/>
      {field.touched && field.error && <div className="error">{field.error}</div>}
    </div>
);

function validate(formProps) {
  const errors = {};

  if (!formProps.wishlistUrl) {
    errors.wishlistUrl = 'Please enter a valid URL';
  }

  return errors;
}

class Wishlist extends Component {
  handleFormSubmit(formProps) {
    this.props.saveWishlist(formProps);
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
      <div>
        <section className="container">
          <div className="row">
            <h1 className="text-center">Enter a Wishlist</h1>
            <p className="text-center col-md-6 col-md-offset-3">
              This part is important to get right. First, make sure you have a <a href="https://www.amazon.com/gp/help/customer/display.html?nodeId=501094" target="_blank">public wishlist</a> for bookhound to use, and ensure that it has at least a few books. Then, when you're sure it's ready to go, add the URL here. It should look like: <em>https://www.amazon.com/gp/registry/wishlist/295PIKOOQBKVU</em>.
            </p>
          </div>
        </section>
        <section className="container">
          <div className="row">
            <div className="col-md-6 col-md-offset-3">
              <form onSubmit={handleSubmit(this.handleFormSubmit.bind(this))}>
                {this.renderAlert()}
                <div className="form-group">
                  <label>URL to your Amazon Wishlist</label>
                  <Field name="wishlistUrl" className="form-control" component={renderField} type="text" />
                </div>
                <div className="form-group">
                  <button type="submit" className="btn btn-primary">Save Wishlist</button>
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
  };
}

export default connect(mapStateToProps, { saveWishlist, clearErrors })(form(Wishlist));
