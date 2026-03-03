export interface TrainingSet {
  weight: number | '';
  reps: number | '';
}

export interface TrainingEntry {
  exercise: string;
  sets: TrainingSet[];
  intervalSeconds?: number;
  date?: string;
}

export interface TrainingLog {
  id: string;
  date: string;
  exercise: string;
  sets: TrainingSet[];
  intervalSeconds?: number;
  memo?: string;
}

export interface UserTemplate {
  id: string;
  name: string;
  sets: TrainingSet[];
  intervalSeconds?: number;
}
