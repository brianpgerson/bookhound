import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getPlaidConfig, exchangeToken } from '../../actions/setup-actions';
const PlaidLink = require('react-plaid-link');

class Bank extends Component {
  handleOnSuccess(token, metadata) {
    this.props.exchangeToken({token, metadata});
  }

  componentWillMount() {
    this.props.getPlaidConfig();
  }

  renderLink() {
    return this.props.plaidPublicKey ?
      (<PlaidLink publicKey={this.props.plaidPublicKey}
                product="auth"
                env="tartan"
                selectAccount={true}
                clientName="bookhound"
                className="btn btn-primary"
                style={{}}
                onSuccess={this.handleOnSuccess.bind(this)}/>) :
      (<button className="btn-primary btn">Open Linky</button>);
   }

  render() {
    return (
      <div>
         <section className="container">
          <div className="row">
            <h1 className="text-center">Connect Your Bank</h1>
            <p className="text-center col-md-4 col-md-offset-4">
            bookhound uses Plaid to securely and conveniently connect to bank accounts without the need for microdeposits.
            </p>
          </div>
        </section>
          <section className="container">
            <div className="row flex-center">
              {this.renderLink()}
            </div>
        </section>
       </div>
    );
  }
}

function mapStateToProps(state) {
  return { plaidPublicKey: state.setup.plaid.public };
}

export default connect(mapStateToProps, { getPlaidConfig, exchangeToken })(Bank);

