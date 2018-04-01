import {
	RECEIVE_REFUND_CONFIRMATION,
	RECEIVE_PLAID_CONFIG
} from '../actions/types';
const _ = require('lodash');

const INITIAL_STATE = {
    plaid: {
		public: ''
	}
}

export default function (state = INITIAL_STATE, action) {
    switch (action.type) {
        case RECEIVE_PLAID_CONFIG:
     		return { ...state,
     			plaid: {
     				public: action.payload.public
                 }
            }
    }
    
    return state;
}

