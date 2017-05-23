import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { CLIENT_ROOT_URL } from '../../constants/constants';
import { Link, browserHistory } from 'react-router';
import { saveWishlist,
         updateWishlist,
         getUserSetup } from '../../actions/setup-actions';
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

const validate = formProps => {
  const errors = {};

  if (!formProps.wishlistUrl) {
    errors.wishlistUrl = 'Please enter a valid URL';
  }

  return errors;
}

class Wishlist extends Component {

  constructor(props) {
    super(props);
    this.props.getUserSetup();
  }

  handleFormSubmit(formProps) {
    const { wishlist, saveWishlist, updateWishlist } = this.props;
    const isUpdating = _.get(wishlist, 'id', false);
    let next;
    if (isUpdating) {
      updateWishlist(formProps);
      next = '/dashboard';
    } else {
      saveWishlist(formProps);
      next = '/bank';
    }

    browserHistory.push(next);

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
    const { handleSubmit, wishlist } = this.props;
    const isUpdating = _.get(wishlist, 'id', false);
    return (
      <div>
        <h1 className="text-center">{isUpdating ? 'Update Wishlist' : 'Enter a Wishlist'}</h1>
        <section className="container">
          <div className="row">
            <div className="col-md-4 col-md-offset-4 is-white-background form-panel">
              <div className="row">
                <div>
                  This part is important to get right. First, make sure you have a <a href="https://www.amazon.com/gp/help/customer/display.html?nodeId=501094" target="_blank">public wishlist</a> for bookhound to use, and ensure that it has at least a few books. Then, when you're sure it's ready to go, add the URL here. It should look like: <em>www.amazon.com/gp/registry/wishlist/295PIKOOQBKVU</em>.
                </div>
              </div>
              <hr />
              <div className="row">
                <form onSubmit={handleSubmit(this.handleFormSubmit.bind(this))}>
                {this.renderAlert()}
                <div className="form-group">
                  <label>URL to your Amazon Wishlist</label>
                  <Field name="wishlistUrl" className="form-control" component={renderField} type="text" />
                </div>
                <div className="form-group">
                  <button type="submit" className="btn btn-primary">{isUpdating ? 'Update Wishlist' : 'Save Wishlist'}</button>
                </div>
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
    errorMessage: state.error.message,
    wishlist: state.setup.wishlist
  };
}

export default connect(mapStateToProps, { saveWishlist, updateWishlist, getUserSetup, clearErrors })(form(Wishlist));
