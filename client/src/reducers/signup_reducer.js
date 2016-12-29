import { SAVE_ADDRESS } from '../actions/types';

const INITIAL_STATE = {
	address: {
		streetAddressOne: '',
		streetAddressTwo: '',
		city: '',
		state: '',
		zip: ''
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
	}

  return state;
}
