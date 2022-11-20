import { Action } from '@ngrx/store';

export interface State {
  isLoading: boolean;
}

const initialState: State = {
  isLoading: false,
};

export const type = {
  START_LOADING: 'START_LOADING',
  STOP_LOADING: 'STOP_LOADING',
};

export function appReducer(state = initialState, action: Action): State {
  switch (action.type) {
    case type.START_LOADING:
      return { isLoading: true };
    case type.STOP_LOADING:
      return { isLoading: false };
    default:
      return state;
  }
}

/*
const featureReducer = createReducer(
  initialState,
  on(featureActions.action, state => ({ ...state, prop: updatedValue })),
);

export function reducer(state: State | undefined, action: Action) {
  return featureReducer(state, action);
}
*/
