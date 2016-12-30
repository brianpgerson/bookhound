import { SAVE_ADDRESS, RECEIVE_PLAID_CONFIG, RECEIVE_USER_SETUP } from '../actions/types';

const INITIAL_STATE = {
	user: {
		email: ''
	},
	address: {
		streetAddressOne: '',
		streetAddressTwo: '',
		city: '',
		state: '',
		zip: ''
	},
	bank: false,
	wishlist: '',
	plaid: {
		public: ''
	}
};

export default function (state = INITIAL_STATE, action) {
  	switch (action.type) {
    	case SAVE_ADDRESS:
	     	 return { ...state, address:
		      	_.assign({}, {
		      		streetAddressOne: action.payload.streetAddressOne,
					streetAddressTwo: action.payload.streetAddressTwo,
					city: action.payload.city,
					state: action.payload.state,
					zip: action.payload.zip
		      	})
     	};
     	case RECEIVE_PLAID_CONFIG:
     		return { ...state, plaid: {
     			public: action.payload.public
     		}}
     	case RECEIVE_USER_SETUP:
     		return { ...state,
     			address: action.payload.address,
     			user: action.payload.user,
     			bank: action.payload.bank,
     			wishlist: 'https://www.amazon.com/gp/registry/wishlist/' + action.payload.wishlist.id
     		}
	}

  return state;
}
