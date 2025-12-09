export interface TrainingSet {
  weight: number;
  reps: number;
}

export interface TrainingEntry {
  exercise: string;
  sets: TrainingSet[];
  intervalSeconds?: number;
}
