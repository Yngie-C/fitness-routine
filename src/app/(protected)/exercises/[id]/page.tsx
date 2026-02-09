import { redirect } from 'next/navigation';

export default function ExerciseDetailRedirect() {
  redirect('/settings/exercises');
}
