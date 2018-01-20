import { ERROR, CLEAR_ERRORS } from '../actions/types';

export function receiveError(dispatch, error) {
 	let errorMessage;
   	// NOT AUTHENTICATED ERROR
  	if (error.status === 401) {
   		errorMessage = 'Your credentials are incorrect.';
  	} else {
  		errorMessage = error.message ? error.message : error.data.error;
  	}

  	dispatch({
    	type: ERROR,
	    payload: errorMessage,
  	});
}

export function clearErrors() {
  return function(dispatch) {
  	dispatch({
  		type: CLEAR_ERRORS
  	});
  }
}
