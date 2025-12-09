export interface TrainingSet {
  weight: number;
  reps: number;
}

export interface TrainingEntry {
  exercise: string;
  sets: TrainingSet[];
  intervalSeconds?: number;
}

export interface TrainingLog {
  id: string;
  date: string;
  exercise: string;
  sets: TrainingSet[];
  intervalSeconds?: number;
  memo?: string;
}
