import { ERROR, CLEAR_ERRORS } from '../actions/types';

export function receiveError(dispatch, error) {
 	let errorMessage;
   	// NOT AUTHENTICATED ERROR
  	if (error.status === 401) {
   		errorMessage = 'You are not authorized to do this.';
  	} else {
  		errorMessage = error.message ? error.message : error.statusText;
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
