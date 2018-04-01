import { OPEN_MODAL, CLOSE_MODAL } from '../actions/types';

const INITIAL_STATE = { 
    type: '',
    open: false,
    item: {
        amount: undefined,
        createdAt: undefined
    }
};

export default function (state = INITIAL_STATE, action) {
  switch (action.type) {
    case OPEN_MODAL:
      return { ...state, 
            type: action.payload.type,
            open: true,
            item: action.payload.item
        };
    case CLOSE_MODAL:
    return { ...state, 
            type: action.payload.type,
            open: false
        };
  }

  return state;
}
