import {
	SAVE_ADDRESS,
	RECEIVE_PLAID_CONFIG,
	RECEIVE_USER_SETUP,
	SAVE_WISHLIST,
	WISHLIST_UPDATING,
	SAVE_PREFERENCES
} from '../actions/types';
const _ = require('lodash');

const INITIAL_STATE = {
	user: {
		email: '',
		profile: {
			firstName: '',
			lastName: ''
		}
	},
	address: {
		streetAddressOne: '',
		streetAddressTwo: '',
		city: '',
		state: '',
		zip: ''
	},
	bank: false,
	wishlist: {
		updating: false,
		id: '',
		items: []
	},
	plaid: {
		public: ''
	},
	preferences: {
		preferredConditions: {
			new: undefined,
			used: undefined
		},
		maxMonthlyOrderFrequency: 0
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
     	case WISHLIST_UPDATING:
 			return { ...state,
 				wishlist: _.assign(state.wishlist, {updating: action.payload})
 			}
     	case SAVE_WISHLIST:
     		return { ...state,
     			wishlist: {
     				id: action.payload.wishlist.id,
     				items: action.payload.wishlist.items
     			}
     		}
     	case SAVE_PREFERENCES:
     		return { ...state,
     			preferences: {
     				preferredConditions: action.payload.preferences.preferredConditions,
     				maxMonthlyOrderFrequency: action.payload.preferences.maxMonthlyOrderFrequency
     			}
     		}
     	case RECEIVE_PLAID_CONFIG:
     		return { ...state,
     			plaid: {
     				public: action.payload.public
     			}
     		}
     	case RECEIVE_USER_SETUP:
     		return { ...state,
     			address: action.payload.address,
     			user: action.payload.user,
     			bank: action.payload.bank,
     			wishlist: {
     				id: _.get(action.payload.wishlist, 'id', ''),
					items: _.get(action.payload.wishlist, 'items', []),
					updating: state.wishlist.updating
     			},
     			preferences: action.payload.preferences
     		}
	}
  return state;
}
