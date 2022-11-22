//FIXME rename module into model
import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromRoot from '../app.reducer';
import { Exercise } from './exercise.model';
import {
  SET_AVAILABLE_TRAININGS,
  SET_FINISHED_TRAININGS,
  START_TRAINING,
  STOP_TRAINING,
  TrainingActions,
} from './training.actions';

export interface TrainingState {
  availableExercises: Exercise[];
  finishExercises: Exercise[];
  activeTraining: Exercise;
}

/*
    we want this state lazily too just like the module.
    Our app state doesn't know about the training state,
    but the training state knows about the app state.
    And whenever we load this module lazily, it will merge behind the scene with NgRx
    I add my training slice in here; this will be my new global state after this module has been lazily loaded
*/
export interface State extends fromRoot.State {
  training: TrainingState;
}

const initialState: TrainingState = {
  availableExercises: [],
  finishExercises: [],
  activeTraining: null,
};

export function trainingReducer(
  state = initialState,
  action: TrainingActions
): TrainingState {
  switch (action.type) {
    case SET_AVAILABLE_TRAININGS:
      return { ...state, availableExercises: action.payload };
    case SET_FINISHED_TRAININGS:
      return { ...state, finishExercises: action.payload };
    case START_TRAINING:
      return {
        ...state,
        activeTraining: {
          ...state.availableExercises.find((ex) => ex.id === action.payload),
        },
      };
    case STOP_TRAINING:
      return { ...state, activeTraining: null };
    default:
      break;
  }
  return state;
}

// 'training' identifier must be the same as in training.module
export const getTrainingState =
  createFeatureSelector<TrainingState>('training');

export const getAvailableExercises = createSelector(
  getTrainingState,
  (state: TrainingState) => state.availableExercises
);
export const getFinishedExercises = createSelector(
  getTrainingState,
  (state: TrainingState) => state.finishExercises
);

export const getActiveTraining = createSelector(
  getTrainingState,
  (state: TrainingState) => state.activeTraining
);

export const getIsTraining = createSelector(
  getTrainingState,
  (state: TrainingState) => state.activeTraining != null
);
