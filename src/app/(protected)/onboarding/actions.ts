'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function completeOnboarding(formData: {
  name: string;
  weight_unit: 'kg' | 'lb';
  experience_level: 'beginner' | 'intermediate' | 'advanced';
  template_routine_id?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // 프로필 생성/업데이트
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      name: formData.name,
      weight_unit: formData.weight_unit,
      experience_level: formData.experience_level,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    throw new Error('프로필 저장에 실패했습니다');
  }

  // TODO: template_routine_id가 있으면 루틴 복사 로직 추가
  // 현재는 데이터베이스에 routines 테이블이 아직 없으므로 추후 구현

  redirect('/');
}
