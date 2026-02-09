import { z } from 'zod/v4';

export const profileSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요').max(50, '이름은 50자 이내로 입력해주세요'),
  weight_unit: z.enum(['kg', 'lb']),
  language: z.enum(['ko', 'en']),
  experience_level: z.enum(['beginner', 'intermediate', 'advanced']),
});

export const onboardingSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요').max(50),
  weight_unit: z.enum(['kg', 'lb']),
  experience_level: z.enum(['beginner', 'intermediate', 'advanced']),
  template_routine_id: z.string().uuid().optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
export type OnboardingFormData = z.infer<typeof onboardingSchema>;
