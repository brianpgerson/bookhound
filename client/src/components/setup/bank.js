import React, { Component } from 'react';
import { CLIENT_ROOT_URL } from '../../constants/constants';
import { connect } from 'react-redux';
import {browserHistory } from 'react-router';
import { getPlaidConfig, exchangeToken } from '../../actions/bank-actions';
const PlaidLink = require('react-plaid-link');

class Bank extends Component {
  handleOnSuccess(token, metadata) {
    this.props.exchangeToken({token, metadata}).then(function (){
      browserHistory.push('/dashboard');
    });
  }

  componentWillMount() {
    this.props.getPlaidConfig();
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

  renderLink() {
    return this.props.plaidPublicKey ?
      (<PlaidLink publicKey={this.props.plaidPublicKey}
                  product='auth'
                  env='sandbox'
                  apiVersion='v2'
                  selectAccount={true}
                  clientName='bookhound'
                  className='btn btn-primary'
                  style={{}}
                  onSuccess={this.handleOnSuccess.bind(this)}/>) :
      (<button className='btn-primary btn'>Open Link</button>);
   }

  render() {
    const { bank } = this.props;
    return (
      <div>
        <h1 className='text-center'>{bank ? 'Update Your Bank' : 'Connect Your Bank'}</h1>
        <section className='container'>
          <div className='row text-center'>
            <div className='col-md-4 col-md-offset-4 is-white-background form-panel'>
              <div className='row'>
                <div>
                  bookhound uses Plaid to securely and conveniently connect to bank accounts without the need for microdeposits.
                </div>
              </div>
              <hr />
              {this.renderAlert()}
              <div className='row'>
                {this.renderLink()}
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
    plaidPublicKey: state.setup.plaid.public,
    bank: state.setup.bank
  };
}

export default connect(mapStateToProps, { getPlaidConfig, exchangeToken })(Bank);

