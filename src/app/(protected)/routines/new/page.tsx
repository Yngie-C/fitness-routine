import { redirect } from 'next/navigation';

export default function NewRoutineRedirect() {
  redirect('/settings/routines/new');
}
