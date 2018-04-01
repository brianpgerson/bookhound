import * as _ from 'lodash';
import {OPEN_MODAL,
        CLOSE_MODAL} from './types';


export function openModal(type, item) {
    return (dispatch) => {
        dispatch({
            type: OPEN_MODAL,
            payload: {
                type: type,
                item: item
            }
        });
    }; 
};

export function closeModal (type) {
    return (dispatch) => {
        dispatch({
            type: CLOSE_MODAL,
            payload: {
                type: type
            }
        });
      }; 
};
