import { supabase } from './supabase';
import { TrainingLog } from '../types/training';

export async function saveTrainingLog(log: Omit<TrainingLog, 'id' | 'date'>): Promise<TrainingLog> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const date = new Date().toISOString();

  // 1. Get or Create Exercise ID (Global Master, but anyone can add?)
  // Policy says: "Authenticated users can create exercises"
  let exerciseId: string;

  const { data: existingExercise } = await supabase
    .from('exercises')
    .select('id')
    .eq('name', log.exercise)
    .single();

  if (existingExercise) {
    exerciseId = existingExercise.id;
  } else {
    // Attempt to create
    // Note: If distinct check fails (race condition), might need retry, but simple for now
    const { data: newExercise, error: createError } = await supabase
      .from('exercises')
      .insert({ name: log.exercise })
      .select('id')
      .single();

    if (createError) {
      // If error is uniqueness violation, try fetching again (someone else made it)
      if (createError.code === '23505') { // unique_violation
        const { data: retryExercise } = await supabase
          .from('exercises')
          .select('id')
          .eq('name', log.exercise)
          .single();
        if (!retryExercise) throw createError;
        exerciseId = retryExercise.id;
      } else {
        throw createError;
      }
    } else {
      exerciseId = newExercise.id;
    }
  }

  // 2. Insert History Rows
  const rows = log.sets.map((set) => ({
    user_id: user.id,
    exercise_id: exerciseId,
    date: date, // Same timestamp for all sets in this batch
    weight: set.weight,
    reps: set.reps,
    memo: log.memo
  }));

  const { error: insertError } = await supabase
    .from('training_history')
    .insert(rows);

  if (insertError) throw insertError;

  // Return constructed log
  return {
    id: `${date}_${exerciseId}`, // Synthetic ID
    date,
    exercise: log.exercise,
    sets: log.sets,
    memo: log.memo
  };
}

export async function getTrainingLogs(): Promise<TrainingLog[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('training_history')
    .select(`
      id,
      date,
      weight,
      reps,
      memo,
      exercises (
        id,
        name
      )
    `)
    .eq('user_id', user.id)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching logs:', error);
    return [];
  }

  // Group by Date + Exercise
  // Type assertion for the join result
  type HistoryRow = {
    id: string;
    date: string;
    weight: number;
    reps: number;
    memo?: string;
    exercises: { id: string; name: string } | null; // One-to-one join
  };

  const rows = data as unknown as HistoryRow[];
  const grouped = new Map<string, TrainingLog>();

  rows.forEach(row => {
    // Use date + exercise_id as key
    if (!row.exercises) return;

    const key = `${row.date}_${row.exercises.id}`;

    if (!grouped.has(key)) {
      grouped.set(key, {
        id: key, // Synthetic ID
        date: row.date,
        exercise: row.exercises.name,
        sets: [],
        memo: row.memo
      });
    }

    const entry = grouped.get(key)!;
    entry.sets.push({ weight: row.weight, reps: row.reps });
  });

  return Array.from(grouped.values());
}

export async function deleteTrainingLog(id: string): Promise<void> {
  // ID is expected to be `${date}_${exerciseId}`
  const [date, exerciseId] = id.split('_');
  if (!date || !exerciseId) return; // invalid id

  const { error } = await supabase
    .from('training_history')
    .delete()
    .eq('date', date)
    .eq('exercise_id', exerciseId);

  if (error) throw error;
}

export async function clearAllLogs(): Promise<void> {
  const { error } = await supabase
    .from('training_history')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete allow rows

  if (error) throw error;
}
