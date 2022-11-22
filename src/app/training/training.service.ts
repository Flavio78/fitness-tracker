import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Store } from '@ngrx/store';
import { map, Subject, Subscription, take } from 'rxjs';
import * as UI from '../shared/ui.actions';
import { UIService } from '../shared/ui.service';
import { Exercise } from './exercise.module';
import * as Training from './training.actions';
import * as fromTraining from './training.reducer';

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
    // I had to change the State because, coming from the app reducer,
    // does not know anything about the training reducer
    private store: Store<fromTraining.State>
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
            this.store.dispatch(new Training.SetAvailableTrainings(exercises));
          },
          error: (error) => {
            console.log('sub fetch exes error', error);
            this.store.dispatch(new UI.StopLoading());
            this.uiService.showSnackbar(
              'Fetching exercise failed, please try again later',
              null,
              3000
            );
            //this.exercisesChanged.next(null);
            this.store.dispatch(new Training.SetAvailableTrainings([]));
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
    this.store.dispatch(new Training.StartTraining(selectedId));
  }

  completeExercise() {
    this.store
      .select(fromTraining.getActiveTraining)
      .pipe(take(1)) // take(1) because we are not interested in all the updated of activeTraining
      // Otherwise we will always get informed whenever active training changes here and database would be updated
      .subscribe((ex) => {
        this.addDataToDatabase({
          ...ex,
          date: new Date(),
          state: 'completed',
        });
        this.store.dispatch(new Training.StopTraining());
      });
  }

  cancelExercise(progress: number) {
    this.store
      .select(fromTraining.getActiveTraining)
      .pipe(take(1))
      .subscribe((ex) => {
        this.addDataToDatabase({
          ...ex,
          duration: ex.duration * (progress / 100),
          calories: ex.calories * (progress / 100),
          date: new Date(),
          state: 'cancelled',
        });
        this.store.dispatch(new Training.StopTraining());
      });
  }

  fetchCompletedOrCancelledExercises() {
    // differently from fetch of available exercises we don't need the ID here so we don't need snapshotChanges
    this.fbSubs.push(
      this.db
        .collection(this.FINISHED_EXERCISES)
        .valueChanges()
        .subscribe({
          next: (exercises) => {
            this.store.dispatch(
              new Training.SetFinishedTrainings(exercises as Exercise[])
            );
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
