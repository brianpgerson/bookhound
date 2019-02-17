import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { browserHistory } from 'react-router';
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
      <input className='form-control' {...field.input} type={field.type}/>
      {field.meta.touched && field.meta.error && <div className='error'>{field.meta.error}</div>}
    </div>
);

const renderCheckbox = field => (
  <label className='form-check-label'>
    <input className='form-check-input' {...field.input} type='checkbox'/> {_.upperFirst(field.input.name)}
    {field.meta.touched && field.meta.error && <div className='error'>{field.meta.error}</div>}
  </label>
)

function validate(formProps) {
  const errors = {};

  if (!formProps.wishlistUrl) {
    errors.wishlistUrl = 'Please enter a valid wishlist ID';
  }

  if (_.isUndefined(formProps.new) && _.isUndefined(formProps.used)) {
    errors.used = 'Please choose at least one preferred condition.';
  }

  if (!formProps.maxMonthlyOrderFrequency || formProps.maxMonthlyOrderFrequency < 1) {
    errors.maxMonthlyOrderFrequency = 'Max order frequency must be at least 1';
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
    const isUpdating = _.has(wishlist, 'url') && !_.isEmpty(wishlist.url);
    let next;

    const wishlistRequest = {
      wishlistUrl: `www.amazon.com/registry/wishlist/${formProps.wishlistUrl}`,
      preferredConditions: {
        new: formProps.new,
        used: formProps.used
      },
      maxMonthlyOrderFrequency: formProps.maxMonthlyOrderFrequency
    };

    if (isUpdating) {
      updateWishlist(wishlistRequest);
      next = '/dashboard';
    } else {
      saveWishlist(wishlistRequest);
      next = '/bank';
    }

    browserHistory.push(next);

  }

  isDisabled(type) {
    var cool = this.props;
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
    const isUpdating = _.get(wishlist, 'url', false);
    return (
      <div>
        <h1 className='text-center is-josefin margin-bottom-20'>{isUpdating ? 'Update Wishlist' : 'Enter a Wishlist'}</h1>
        <section className='container'>
          <div className='row'>
            <div className='col-md-6 col-md-offset-3 is-white-background pad-50 panel'>
              <div className='row'>
                <p>
                  This part is important to get right!
                </p>
                <p>
                  First, make sure you have a <a href='https://www.amazon.com/gp/help/customer/display.html?nodeId=501094' target='_blank'> public wishlist </a> 
                  for bookhound to use, and ensure that it has at least a few books.
                </p>
                <p>
                  (FYI, if you have things that aren't
                  books in the list, for now, bookhound may also purchase those items, so you probably just want a bookhound list
                  to be safe!)
                </p>
                <p>
                  Then, when you're sure it's ready to go, add the wishlist ID here. 
                  It's the 13 characters at the end of your URL. 
                  If your wishlist was at: 
                  <br />
                  <em>www.amazon.com/gp/registry/wishlist/295PIKOOQBKVU</em>
                </p>
                <p>
                  ...it would be "295PIKOOQBKVU". 
                </p>
              </div>
              <hr />
              <div className='row'>
                <form onSubmit={handleSubmit(this.handleFormSubmit.bind(this))}>
                {this.renderAlert()}
                <div className='form-group'>
                  <label>ID for your Amazon Wishlist</label>
                  <Field name='wishlistUrl' className='form-control' component={renderField} type='text' />
                </div>

                <div className='form-group'>
                  <p><strong>Preferred Conditions:</strong></p>
                  <div className='form-check'>
                      <Field name='new' component={renderCheckbox} type='checkbox'/>
                  </div>
                  <div className='form-check'>
                      <Field name='used' component={renderCheckbox} type='checkbox'/> 
                  </div>
                </div> 
                <div className='form-group'>
                  <label>Max # of Orders/Month:</label>
                  <Field name='maxMonthlyOrderFrequency' className='form-control' component={renderField} type='number' />
                </div>

                <div className='form-group'>
                  <button type='submit' className='btn btn-primary'>{isUpdating ? 'Update Wishlist' : 'Save Wishlist'}</button>
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
