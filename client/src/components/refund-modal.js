import React, { Component } from 'react';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import { initiateRefund } from '../actions/bank-actions';
import { openModal, closeModal } from '../actions/modal-actions';

const REFUND = 'refund';

class RefundModal extends Component {
    constructor(props) {
        super(props);
    }

    isOpen() {
        return this.props.modal.open && this.props.modal.type === this.props.type;
    }

    getRefundAmount(charge) {
        if (this.isOpen()) {
            let chargeAmount = parseInt(charge.amount, 10);
            let amount = chargeAmount - Math.round(chargeAmount * 0.008);
            return (amount /100).toFixed(2);
        }
    }

    refundMessage(item) {
        return item.refundAmount > 0 ? (<div>
            <p>You can refund this charge for the amount of ${item.refundAmount} (We unfortunately cannot refund the Stripe fee of 0.80% at this time).</p>
            <p>Once you initiate the refund, you will not be able to undo the request. The refund will be sent to the same account you've connected to bookhound.</p>
        </div>) : (<p>You need a positive balance to initate a refund!</p>)
    }

    issueRefund(charge) {
        this.props.initiateRefund(charge);
        this.props.closeModal(REFUND)
    }

    render () {
        let {item, closeModal} = this.props.modal;
        item.refundAmount = item.refundAmount || this.getRefundAmount(item);
        return (
            <div>
                <Modal isOpen={this.isOpen()}
                       onRequestClose={closeModal}
                    //    style={customStyles}
                       className="default-modal"
                       overlayClassName="default-overlay"
                       contentLabel="Refund Request">

                    <h2 >Refund Charge?</h2>
                    { this.refundMessage(item) }
                    <div className="flex-between">
                        {item.amount > 0 ? (<button className="btn btn-danger" onClick={() =>this.issueRefund(item)}>Yes, Refund</button>) : ''}
                        <button className="btn btn-default" onClick={this.props.closeModal}>Nevermind!</button>
                    </div>
                </Modal>
            </div>
        );a
    }
}
function mapStateToProps(state) {
    return { 
        modal: state.modal,
    };
}

export default connect(mapStateToProps, {openModal, closeModal, initiateRefund })(RefundModal);
