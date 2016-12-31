import React, { Component } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import * as setupActions from '../actions/setup-actions';

class Dashboard extends Component {

  constructor(props) {
    super(props);

    this.props.getUserSetup();
  }

  renderAddress(address) {
    if (address.streetAddressOne) {
      return (
        <div className="col-md-4">
          <h4>Current Shipping Address</h4>
          <p><strong>Street Address One: </strong>{address.streetAddressOne}</p>
          { address.streetAddressTwo ?
              <p><strong>Street Address Two: </strong>{address.streetAddressTwo}</p> : '' }
          <p><strong>City: </strong>{address.city}</p>
          <p><strong>State: </strong>{address.state}</p>
          <p><strong>Zip: </strong>{address.zip}</p>
          <p><Link to="address"><button className="btn btn-default">Update Address</button></Link></p>
        </div>
      );
    } else {
      return (
        <div className="col-md-4">
          <h4>Current Shipping Address</h4>
          <p className="bad-text">You haven't set a shipping address yet!</p>
          <p><Link to="address"><button className="btn btn-default">Add Address</button></Link></p>
        </div>
      );
    }
  }

  renderBank(bank) {
    if (bank) {
      return (
        <div className="col-md-4">
          <h4>Bank Account Information</h4>
          <p className="good-text">Your bank account is currently connected</p>
          <p><Link to="bank"><button className="btn btn-default">Update Bank</button></Link></p>
        </div>
      )
    } else {
      return <div className="col-md-4">
        <h4>Bank Account Information</h4>
        <p className="bad-text">You haven't connected a bank account yet!</p>
        <p><Link to="bank"><button className="btn btn-default">Connect Bank</button></Link></p>
      </div>
    }
  }

  renderWishlist(wishlist) {
    if (wishlist) {
      return (
        <div className="col-md-4">
          <h4>Wishlist Information</h4>
          <p className="good-text">Your wishlist is connected</p>
          <p><a href={wishlist} target="_blank">{wishlist}</a></p>
          <p><Link to="wishlist"><button className="btn btn-default">Update Wishlist</button></Link></p>
        </div>
      )
    } else {
      return <div className="col-md-4">
        <h4>WishList Information</h4>
        <p className="bad-text">You haven't added a wishlist yet!</p>
        <p><Link to="wishlist"><button className="btn btn-default">Add Wishlist</button></Link></p>
      </div>
    }
  }

  render() {
    const {user, address, bank, wishlist} = this.props.setup;
    return (
      <div>
        <div className="container">
        <section className="row pad-bottom">
          <h1>Welcome to your Dashboard, {user.profile.firstName}</h1>
          <p>Here's where you can see your current settings and update anything that needs changing!</p>
        </section>
        <section className="row pad-bottom">
          {this.renderAddress(address)}
        </section>
        <section className="row pad-bottom">
          {this.renderBank(bank)}
        </section>
        <section className="row pad-bottom">
          {this.renderWishlist(wishlist)}
        </section>
        <section className="row push-down">
        </section>
      </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return { setup: state.setup };
}

export default connect(mapStateToProps, setupActions)(Dashboard);
