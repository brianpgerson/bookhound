import React, { Component } from 'react';
import { Link } from 'react-router';
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
      return (wishlist ? (<li>No items in this wishlist!</li>) :
                          <li className="whisper">No purchases yet</li>);
    }
    return _.map(items, (item) => {
      if (item.unavailable) {
        return (<li><a href={item.link} target='_blank'>{item.title}</a>: Not available with your current preferences!</li>)
      }
      return (
        <li>
          <p><a href={item.link} target='_blank'>{item.title}</a>: <br/> 
      ${this.toCurrency(item.price)} { wishlist && <span className="whisper"> + ${this.toCurrency(item.shipping)} shipping</span>}</p> 
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
        <div className='col-md-6 panel flex-col pad-25'>
          <h4>Current Shipping Address</h4>
          <p><strong>Street Address One: </strong>{address.streetAddressOne}</p>
          { address.streetAddressTwo ?
              <p><strong>Street Address Two: </strong>{address.streetAddressTwo}</p> : '' }
          <p><strong>City: </strong>{address.city}</p>
          <p><strong>State: </strong>{address.state}</p>
          <p className="margin-bottom-20"><strong>Zip: </strong>{address.zip}</p>
          <p><Link to='address'><button className='btn btn-default'>Update Address</button></Link></p>
        </div>
      );
    } else {
      return (
        <div className='col-md-6 panel flex-col pad-25'>
          <h4>Current Shipping Address</h4>
          <p className='bad-text'>You haven't set a shipping address yet!</p>
          <p><Link to='address'><button className='btn btn-default'>Add Address</button></Link></p>
        </div>
      );
    }
  }

  toCurrency(amt) {
    return parseFloat((amt/100).toFixed(2));
  }

  renderBank(bank, charges) {
    if (bank.connected) {
      return (
        <div className='col-md-6 panel flex-col pad-25'>
          <h4>Bank Account Information</h4>
          <p className='good-text'>Your bank account is currently connected</p>

          <p><strong>Current Balance: </strong>${this.toCurrency(bank.balance)}</p>
          <p><strong>Charges</strong></p>
          <ul className="scroller-medium">
            {
              charges && charges.length > 0 ?
              _.map(_.sortBy(charges, ['createdAt']).reverse(), (item) => {
                item.balance = bank.balance;
                let toRefund = item.refund.amount === item.amount ?
                      (<span className="whisper">  (refunded ${this.toCurrency(item.refund.amount)})</span>) :
                      (<span onClick={() => this.openModal(item)} className="whisper cursor"> ?</span>)
                return (
                  <li className="margin-bottom-small">
                    <strong>{moment(item.createdAt).format('MMM D, Y')}:</strong>........${this.toCurrency(item.amount)} 
                    { toRefund }
                  </li>);
              }) : <span className="whisper">No charges yet!</span>
            }
          </ul>
          <p><Link to='bank'><button className='btn btn-default'>Update Bank</button></Link></p>
        </div>
      )
    } else {
      return <div className='col-md-6 panel flex-col pad-25'>
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

  renderItems(wishlist, purchases) {
    const boughtIdSet = new Set(_.map(purchases, 'productId'));
    console.log(boughtIdSet);
    wishlist.items = wishlist.items.filter(({ productId }) =>!boughtIdSet.has(productId))
    return (
      <div>
        <p><strong>Items</strong> 
        <span className="whisper cursor" 
              onClick={() => {this.setShowPurchases()}}> (switch to purchases)</span></p> 
        <div className='wishlist'>
          {this.itemRows({wishlist})}
        </div>
      </div>);
  }

  renderWishlist(wishlist, purchases) {
    if (wishlist && wishlist.url && !wishlist.updating) {
      const wishlistUrl = wishlist.url;
      return (
        <div className='col-md-6 panel flex-col pad-25'>
          <h4>Wishlist Information</h4>
          {this.props.setup.showPurchases ? this.renderPurchases(purchases) : this.renderItems(wishlist, purchases)}
          <p><strong>Preferences</strong></p>
          <ul className="wishlist">
            <li><p><a href={'https://' + wishlistUrl} target='_blank'>Your Wishlist</a></p></li>
            <li><p>Max orders per month: {wishlist.maxMonthlyOrderFrequency}</p></li>
            <li><p>Preferred Conditions: { this.renderPreferredConditions(wishlist.preferredConditions) }</p></li>
          </ul>
          <p>
            <Link to='wishlist'><button className='btn btn-default'>Change Wishlist</button></Link>
            <button onClick={() => {this.refreshWishlist(wishlistUrl)}} className='btn btn-default margin-left'>Refresh Items</button>
          </p>
        </div>
      )
    } else if (_.get(wishlist, 'updating')) {
      return <div className='col-md-6 panel flex-col pad-25'>
        <h4>Wishlist Information</h4>
        <p className='bad-text'>Hang tight! This could take bit...</p>
        <p><button disabled className='btn btn-default'>Add Wishlist</button></p>
      </div>
    } else {
      return <div className='col-md-6 panel flex-col pad-25'>
        <h4>Wishlist Information</h4>
        <p className='bad-text'>You haven't added a wishlist yet!</p>
        <p><Link to='wishlist'><button className='btn btn-default'>Add Wishlist</button></Link></p>
      </div>
    }
  }

  render() {
    const { user, address, bank, charges, wishlist, purchases, showWelcome } = this.props.setup;
    return (
      <div className="gradient-2">
        <RefundModal type={REFUND} />
        <div className='container'>
          <section className='row pad-bottom pad-left clear-center'>
            <h1 className="is-josefin margin-top-40">Welcome to your Dashboard, {_.upperFirst(user.profile.firstName)}</h1>
            { showWelcome ? 
              (<p className="col-md-6 col-md-offset-3">Thanks for setting everything up! You can check back here anytime you want to see what's going on with your account. In the meantime, we'll start putting aside some spare cash to buy you some nice books very soon.</p> ) : 
              (<p>Here's where you can see your current settings and update anything that needs changing!</p>)
            }
          </section>
          <section className='row pad-bottom flex-center'>
            {this.renderAddress(address)}
          </section>
          <section className='row pad-bottom flex-center'>
            {this.renderBank(bank, charges)}
          </section>
          <section className='row pad-bottom flex-center'>
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
