import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Store } from '@ngrx/store';
import { map, Subject, Subscription } from 'rxjs';
import * as fromRoot from '../app.reducer';
import * as UI from '../shared/ui.actions';
import { UIService } from '../shared/ui.service';
import { Exercise } from './exercise.module';
@Injectable()
export class TrainingService {
  private availableExercises: Exercise[] = [];
  exerciseChanged = new Subject<Exercise>();
  exercisesChanged = new Subject<Exercise[]>();
  finishedExerciseChanged = new Subject<Exercise[]>();
  private runningExercise: Exercise;
  private fbSubs: Subscription[] = [];

  private readonly FINISHED_EXERCISES = 'finishedExercises';
  private readonly AVAILABLE_EXERCISES = 'availableExercises';

  constructor(
    private db: AngularFirestore,
    private uiService: UIService,
    private store: Store<fromRoot.State>
  ) {}

  fetchAvailableExercises() {
    this.store.dispatch(new UI.StartLoading());
    this.fbSubs.push(
      this.db
        .collection(this.AVAILABLE_EXERCISES)
        .snapshotChanges()
        .pipe(
          map((docArray) => {
            return docArray.map((doc) => {
              // throw new Error('Forced Error');
              return {
                id: doc.payload.doc.id,
                ...(doc.payload.doc.data() as Exercise),
              };
            });
          })
        )
        .subscribe({
          next: (exercises: Exercise[]) => {
            this.store.dispatch(new UI.StopLoading());
            this.availableExercises = exercises;
            this.exercisesChanged.next([...this.availableExercises]);
          },
          error: (error) => {
            console.log('sub fetch exes error', error);
            this.store.dispatch(new UI.StopLoading());
            this.uiService.showSnackbar(
              'Fetching exercise failed, please try again later',
              null,
              3000
            );
            this.exerciseChanged.next(null);
          },
          complete: () => console.log('sub fetch exes completed'),
        })
    );
  }

  startExercise(selectedId: string) {
    // "update" method adds fields without overwriting the old ones, opposite instead to "get" method
    this.db
      .doc(`${this.AVAILABLE_EXERCISES}/${selectedId}`)
      .update({ lastSelected: new Date() });
    this.runningExercise = this.availableExercises.filter(
      (ex) => ex.id === selectedId
    )[0];
    this.exerciseChanged.next({ ...this.runningExercise });
  }

  completeExercise() {
    this.addDataToDatabase({
      ...this.runningExercise,
      date: new Date(),
      state: 'completed',
    });
    this.runningExercise = null;
    this.exerciseChanged.next(null);
  }

  cancelExercise(progress: number) {
    this.addDataToDatabase({
      ...this.runningExercise,
      date: new Date(),
      duration: this.runningExercise.duration * (progress / 100),
      calories: this.runningExercise.calories * (progress / 100),
      state: 'cancelled',
    });
    this.runningExercise = null;
    this.exerciseChanged.next(null);
  }

  getRunningExercise(): Exercise {
    return { ...this.runningExercise };
  }

  fetchCompletedOrCancelledExercises() {
    // differently from fetch of available exercises we don't need the ID here so we don't need snapshotChanges
    this.fbSubs.push(
      this.db
        .collection(this.FINISHED_EXERCISES)
        .valueChanges()
        .subscribe({
          next: (exercises) => {
            this.finishedExerciseChanged.next(exercises as Exercise[]);
          },
          error: (error) => {
            console.log('sub fetch comp exes error', error);
          },
          complete: () => {
            console.log('sub fetch comp exes completed');
          },
        })
    );
  }

  cancelSubscriptions() {
    this.fbSubs.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  private addDataToDatabase(exercise: Exercise) {
    // if a collection does not exist yet, it will be created automatically
    this.db.collection(this.FINISHED_EXERCISES).add(exercise);
  }
}
