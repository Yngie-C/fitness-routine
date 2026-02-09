'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingSchema, type OnboardingFormData } from '@/lib/validations/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Dumbbell, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { completeOnboarding } from './actions';

const TEMPLATE_ROUTINES = {
  beginner: [
    {
      id: 'beginner-1',
      name: '초보자 풀바디 루틴',
      description: '주 3회, 전신을 골고루 운동하는 기본 루틴',
      exercises: ['스쿼트', '벤치프레스', '데드리프트', '숄더프레스'],
    },
    {
      id: 'beginner-2',
      name: '초보자 홈 트레이닝',
      description: '장비 없이 집에서 할 수 있는 루틴',
      exercises: ['푸시업', '플랭크', '스쿼트', '런지'],
    },
  ],
  intermediate: [
    {
      id: 'intermediate-1',
      name: '중급자 PPL 루틴',
      description: '주 6회, Push-Pull-Legs 분할 루틴',
      exercises: ['벤치프레스', '로우', '스쿼트', '인클라인 프레스'],
    },
    {
      id: 'intermediate-2',
      name: '중급자 상하체 분할',
      description: '주 4회, 상체와 하체를 번갈아 운동',
      exercises: ['데드리프트', '벤치프레스', '스쿼트', '풀업'],
    },
  ],
  advanced: [
    {
      id: 'advanced-1',
      name: '고급자 전문 분할',
      description: '주 5-6회, 부위별 집중 운동',
      exercises: ['스쿼트', '데드리프트', '벤치프레스', '오버헤드 프레스'],
    },
    {
      id: 'advanced-2',
      name: '고급자 파워리프팅',
      description: 'Big 3 중심의 강도 높은 루틴',
      exercises: ['스쿼트', '벤치프레스', '데드리프트'],
    },
  ],
};

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState<string | undefined>();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      weight_unit: 'kg',
      experience_level: 'beginner',
    },
  });

  const experienceLevel = watch('experience_level');
  const weightUnit = watch('weight_unit');

  const progressPercentage = (step / 3) * 100;

  const handleNext = () => {
    if (step < 3) {
      setStep((prev) => (prev + 1) as Step);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as Step);
    }
  };

  const onSubmit = async (data: OnboardingFormData) => {
    setIsLoading(true);
    try {
      await completeOnboarding({
        ...data,
        template_routine_id: selectedRoutine,
      });
      toast.success('환영합니다!', {
        description: '온보딩이 완료되었습니다',
      });
    } catch (error) {
      toast.error('오류가 발생했습니다', {
        description: error instanceof Error ? error.message : '다시 시도해주세요',
      });
      setIsLoading(false);
    }
  };

  const handleSkipRoutine = async () => {
    setIsLoading(true);
    try {
      const formData = watch();
      await completeOnboarding({
        name: formData.name,
        weight_unit: formData.weight_unit,
        experience_level: formData.experience_level,
      });
      toast.success('환영합니다!', {
        description: '온보딩이 완료되었습니다',
      });
    } catch (error) {
      toast.error('오류가 발생했습니다', {
        description: error instanceof Error ? error.message : '다시 시도해주세요',
      });
      setIsLoading(false);
    }
  };

  const recommendedRoutines = TEMPLATE_ROUTINES[experienceLevel];

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2">
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-center text-sm text-muted-foreground">
            {step} / 3
          </p>
        </div>

        {step === 1 && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Dumbbell className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">피트니스 루틴에 오신 것을 환영합니다!</CardTitle>
              <CardDescription>
                체계적인 운동 관리로 목표를 달성하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>✓ 나만의 운동 루틴 만들기</p>
                <p>✓ 운동 기록 및 진행 상황 추적</p>
                <p>✓ 상세한 통계 및 분석</p>
                <p>✓ 오프라인에서도 사용 가능</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleNext} className="w-full">
                시작하기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>기본 정보를 입력해주세요</CardTitle>
              <CardDescription>
                맞춤형 경험을 제공하기 위해 필요한 정보입니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">이름</Label>
                  <Input
                    id="name"
                    placeholder="홍길동"
                    {...register('name')}
                    aria-invalid={errors.name ? 'true' : 'false'}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive" role="alert">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight_unit">무게 단위</Label>
                  <Select
                    value={weightUnit}
                    onValueChange={(value) => setValue('weight_unit', value as 'kg' | 'lb')}
                  >
                    <SelectTrigger id="weight_unit">
                      <SelectValue placeholder="단위 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">킬로그램 (kg)</SelectItem>
                      <SelectItem value="lb">파운드 (lb)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.weight_unit && (
                    <p className="text-sm text-destructive" role="alert">
                      {errors.weight_unit.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience_level">경험 수준</Label>
                  <Select
                    value={experienceLevel}
                    onValueChange={(value) =>
                      setValue('experience_level', value as 'beginner' | 'intermediate' | 'advanced')
                    }
                  >
                    <SelectTrigger id="experience_level">
                      <SelectValue placeholder="경험 수준 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">초보자 (운동 경험 1년 미만)</SelectItem>
                      <SelectItem value="intermediate">중급자 (1-3년)</SelectItem>
                      <SelectItem value="advanced">고급자 (3년 이상)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.experience_level && (
                    <p className="text-sm text-destructive" role="alert">
                      {errors.experience_level.message}
                    </p>
                  )}
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                이전
              </Button>
              <Button onClick={handleNext}>
                다음
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>첫 루틴을 선택하세요</CardTitle>
              <CardDescription>
                경험 수준에 맞는 추천 루틴입니다 (나중에 변경 가능)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendedRoutines.map((routine) => (
                <Card
                  key={routine.id}
                  className={`cursor-pointer transition-all ${
                    selectedRoutine === routine.id
                      ? 'border-primary ring-2 ring-primary'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedRoutine(routine.id)}
                >
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">{routine.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {routine.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex flex-wrap gap-1">
                      {routine.exercises.map((exercise, idx) => (
                        <span
                          key={idx}
                          className="rounded-full bg-muted px-2 py-0.5 text-xs"
                        >
                          {exercise}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button
                onClick={handleSubmit(onSubmit)}
                className="w-full"
                disabled={isLoading || !selectedRoutine}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    완료 중...
                  </>
                ) : (
                  '완료'
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={handleSkipRoutine}
                className="w-full"
                disabled={isLoading}
              >
                건너뛰기
              </Button>
              <Button
                variant="outline"
                onClick={handleBack}
                className="w-full"
                disabled={isLoading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                이전
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
