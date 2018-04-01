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
            let amount = parseInt(charge.amount, 10);
            // lets say total charge is 2.88. 
            // 288 - 30c stripe flat fee = 258
            // 2.9% fee = 288 * .29 = 8.352
            // total = 258 - 8.352 = 249.65
            return ((amount - 30 - (amount * 0.029)) / 100).toFixed(2);
        }
    }

    issueRefund(charge) {
        this.props.initiateRefund(charge);
        this.props.closeModal(REFUND)
    }

    render () {
        let {item, closeModal} = this.props.modal;
        return (
            <div>
                <Modal isOpen={this.isOpen()}
                       onRequestClose={closeModal}
                    //    style={customStyles}
                       className="default-modal"
                       overlayClassName="default-overlay"
                       contentLabel="Refund Request">

                    <h2 >Refund Charge?</h2>
                    <div>
                        <p>You can refund this charge for the amount of ${this.getRefundAmount(item)} (We unfortunately cannot refund Stripe fees at this time).</p>
                        <p>Once you initiate the refund, you will not be able to undo the request. The refund will be sent to the same account you've connected to bookhound.</p>
                    </div>
                    <div className="flex-between">
                        <button className="btn btn-danger" onClick={() =>this.issueRefund(item)}>Yes, Refund</button>
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
