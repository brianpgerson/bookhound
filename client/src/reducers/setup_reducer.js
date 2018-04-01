import {
	SHOW_PURCHASES,
	SAVE_ADDRESS,
	RECEIVE_PLAID_CONFIG,
	RECEIVE_USER_SETUP,
	SAVE_WISHLIST,
	WISHLIST_UPDATING,
} from '../actions/types';
const _ = require('lodash');

const INITIAL_STATE = {
	showPurchases: false,
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
		url: '',
		preferredConditions: {
			new: undefined,
			used: undefined
		},
		maxMonthlyOrderFrequency: 0,
		items: []
	},
	purchases: [],
	charges: []
};

export default function (state = INITIAL_STATE, action) {
  	switch (action.type) {
		case SHOW_PURCHASES: 
			return { ...state, showPurchases: action.payload }
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
     				url: action.payload.wishlist.url,
     				items: action.payload.wishlist.items,
     				preferredConditions: action.payload.wishlist.preferredConditions,
     				maxMonthlyOrderFrequency: action.payload.wishlist.maxMonthlyOrderFrequency
     			}
     		}
    
     	case RECEIVE_USER_SETUP:
     		return { ...state,
     			address: action.payload.address,
     			user: action.payload.user,
     			bank: action.payload.bank,
				purchases: action.payload.purchases,
				charges: action.payload.charges,
     			wishlist: {
     				url: _.get(action.payload.wishlist, 'url', ''),
					items: _.get(action.payload.wishlist, 'items', []),
					preferredConditions: action.payload.wishlist.preferredConditions,
     				maxMonthlyOrderFrequency: action.payload.wishlist.maxMonthlyOrderFrequency,
					updating: state.wishlist.updating
     			},
     		}
	}
  return state;
}
