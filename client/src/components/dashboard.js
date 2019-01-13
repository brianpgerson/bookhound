import React, { Component } from 'react';
import { Link, browserHistory } from 'react-router';
import { Field, reduxForm } from 'redux-form';
import Modal from 'react-modal';
import { connect } from 'react-redux';
const moment = require('moment');
import { getUserSetup, refreshWishlistItems, setShowPurchases, refreshWishlist } from '../actions/setup-actions';
import { openModal, closeModal } from '../actions/modal-actions';
import RefundModal from './refund-modal';

const REFUND = 'refund';

class Dashboard extends Component {

  constructor(props) {
    super(props);
    this.props.getUserSetup();
  }

  openModal(item) {
    this.props.openModal(REFUND, item);
  }

  closeModal() {
    this.props.closeModal(REFUND);
  }

  refreshWishlist(wishlistUrl) {
    this.props.refreshWishlistItems({wishlistUrl: wishlistUrl});
  }

  setShowPurchases() {
    this.props.setShowPurchases(!this.props.setup.showPurchases)
  } 

  itemRows({wishlist, purchases}) {
    const items = wishlist ? wishlist.items : purchases;
    if (items.length === 0) {
      return (wishlist ? (<li>No items in this wishlist yet! Add some then click 'Refresh'</li>) :
                          <li className="whisper">No purchases yet</li>);
    }
    return _.map(items, (item) => {
      if (item.unavailable) {
        return (<li><a href={item.link} target='_blank'>{item.title}</a>: Not available with your current preferences!</li>)
      }
      return (
        <li>
          <p><a href={item.link} target='_blank'>{item.title}</a>: ${this.toCurrency(item.price)} 
          <span className="whisper"> + ${this.toCurrency(item.shipping)} shipping</span></p>
        </li>

      );
    });
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

  renderAddress(address) {
    if (address.streetAddressOne) {
      return (
        <div className='col-md-4'>
          <h4>Current Shipping Address</h4>
          <p><strong>Street Address One: </strong>{address.streetAddressOne}</p>
          { address.streetAddressTwo ?
              <p><strong>Street Address Two: </strong>{address.streetAddressTwo}</p> : '' }
          <p><strong>City: </strong>{address.city}</p>
          <p><strong>State: </strong>{address.state}</p>
          <p><strong>Zip: </strong>{address.zip}</p>
          <p><Link to='address'><button className='btn btn-default'>Update Address</button></Link></p>
        </div>
      );
    } else {
      return (
        <div className='col-md-4'>
          <h4>Current Shipping Address</h4>
          <p className='bad-text'>You haven't set a shipping address yet!</p>
          <p><Link to='address'><button className='btn btn-default'>Add Address</button></Link></p>
        </div>
      );
    }
  }

  refund(item) {
    console.log(item.id);
  }

  toCurrency(amt) {
    return parseFloat((amt/100).toFixed(2));
  }

  renderBank(bank, charges) {
    if (bank.connected) {
      return (
        <div className='col-md-4'>
          <h4>Bank Account Information</h4>
          <p className='good-text'>Your bank account is currently connected</p>

          <p><strong>Current Balance: </strong>${this.toCurrency(bank.balance)}</p>
          <p><strong>Charges</strong></p>
          <ul className="scroller-medium">
            {
              charges && charges.length > 0 ?
              _.map(charges, (item) => {
                item.balance = bank.balance;
                let refundThing = item.refund.amount === item.amount ?
                      (<span className="whisper">  (refunded ${this.toCurrency(item.refund.amount)})</span>) :
                      (<span onClick={() => this.openModal(item)} className="whisper cursor"> ?</span>)
                return (
                  <li className="margin-bottom-small">
                    <strong>{moment(item.createdAt).format('MMM D, Y')}:</strong>........${this.toCurrency(item.amount)} 
                    { refundThing }
                  </li>);
              }) : <span className="whisper">No charges yet!</span>
            }
          </ul>
          <p><Link to='bank'><button className='btn btn-default'>Update Bank</button></Link></p>
        </div>
      )
    } else {
      return <div className='col-md-4'>
        <h4>Bank Account Information</h4>
        <p className='bad-text'>You haven't connected a bank account yet!</p>
        <p><Link to='bank'><button className='btn btn-default'>Connect Bank</button></Link></p>
      </div>
    }
  }

  renderPreferredConditions(prefs) {
    const msg = _.keys(_.pickBy(prefs)).join(' and ');
    return (<span className='bold'>{msg}</span>);
  }

  renderPurchases(purchases) {
    return (
      <div>
        <p><strong>Purchases</strong> 
        <span className="whisper cursor" 
              onClick={() => {this.setShowPurchases()}}> (switch to wishlist)</span></p> 
        <ul className='wishlist'>
          {this.itemRows({purchases})}
        </ul>
      </div>);
  }

  renderItems(wishlist) {
    return (
      <div>
        <p><strong>Items</strong> 
        <span className="whisper cursor" 
              onClick={() => {this.setShowPurchases()}}> (switch to purchases)</span></p> 
        <ul className='wishlist'>
          {this.itemRows({wishlist})}
        </ul>
      </div>);
  }

  renderWishlist(wishlist, purchases) {
    if (wishlist && wishlist.url && !wishlist.updating) {
      const wishlistUrl = wishlist.url;
      return (
        <div className='col-md-6'>
          <h4>Wishlist Information</h4>
          {this.props.setup.showPurchases ? this.renderPurchases(purchases) : this.renderItems(wishlist)}
          <p><strong>Preferences</strong></p>
          <ul className="wishlist">
            <li><p>Wishlist URL: <a href={'https://' + wishlistUrl} target='_blank'>{wishlistUrl}</a></p></li>
            <li><p>Max orders per month: {wishlist.maxMonthlyOrderFrequency}</p></li>
            <li><p>Preferred Conditions: { this.renderPreferredConditions(wishlist.preferredConditions) }</p></li>
          </ul>
          <p>
            <Link to='wishlist'><button className='btn btn-default'>Change Wishlist</button></Link>
            <button onClick={() => {this.refreshWishlist(wishlistUrl)}} className='btn btn-default'>Refresh Items</button>
          </p>
        </div>
      )
    } else if (_.get(wishlist, 'updating')) {
      return <div className='col-md-4'>
        <h4>WishList Information</h4>
        <p className='bad-text'>Hang tight! We're updating your wishlist connection</p>
        <p><button disabled className='btn btn-default'>Add Wishlist</button></p>
      </div>
    } else {
      return <div className='col-md-4'>
        <h4>WishList Information</h4>
        <p className='bad-text'>You haven't added a wishlist yet!</p>
        <p><Link to='wishlist'><button className='btn btn-default'>Add Wishlist</button></Link></p>
      </div>
    }
  }

  render() {
    const {user, address, bank, charges, wishlist, purchases, preferences} = this.props.setup;
    return (
      <div>
        <RefundModal type={REFUND} />
        <div className='container'>
        <section className='row pad-bottom'>
          <h1>Welcome to your Dashboard, {user.profile.firstName}</h1>
          <p>Here's where you can see your current settings and update anything that needs changing!</p>
        </section>
        <section className='row pad-bottom'>
          {this.renderAddress(address)}
        </section>
        <section className='row pad-bottom'>
          {this.renderBank(bank, charges)}
        </section>
        <section className='row pad-bottom'>
          {this.renderWishlist(wishlist, purchases)}
        </section>
        <section className='row push-down'>
        </section>
      </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return { 
    setup: state.setup,
  };
}

export default connect(mapStateToProps, { getUserSetup, refreshWishlistItems, setShowPurchases, refreshWishlist, openModal, closeModal })(Dashboard);
