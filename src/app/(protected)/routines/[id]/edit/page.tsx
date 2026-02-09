import { redirect } from 'next/navigation';

export default function RoutineEditRedirect({ params }: { params: Promise<{ id: string }> }) {
  // Next.js 15에서 params는 Promise
  // 서버 컴포넌트에서 redirect는 동기적으로 동작
  redirect('/settings/routines');
}
