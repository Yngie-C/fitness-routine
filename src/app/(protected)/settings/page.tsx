'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, type ProfileFormData } from '@/lib/validations/profile';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, LogOut, User, ListChecks, Dumbbell, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [userEmail, setUserEmail] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      weight_unit: 'kg',
      language: 'ko',
      experience_level: 'beginner',
    },
  });

  const weightUnit = watch('weight_unit');
  const language = watch('language');
  const experienceLevel = watch('experience_level');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/auth/login');
          return;
        }

        setUserEmail(user.email || '');

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Profile fetch error:', error);
          toast.error('프로필을 불러오는데 실패했습니다');
          return;
        }

        if (profile) {
          setValue('name', profile.name || '');
          setValue('weight_unit', profile.weight_unit || 'kg');
          setValue('language', profile.language || 'ko');
          setValue('experience_level', profile.experience_level || 'beginner');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('오류가 발생했습니다');
      } finally {
        setIsFetching(false);
      }
    };

    fetchProfile();
  }, [router, setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          weight_unit: data.weight_unit,
          language: data.language,
          experience_level: data.experience_level,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        toast.error('프로필 업데이트 실패', {
          description: error.message,
        });
        return;
      }

      toast.success('프로필이 업데이트되었습니다');
    } catch (error) {
      toast.error('오류가 발생했습니다');
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success('로그아웃되었습니다');
      router.push('/auth/login');
      router.refresh();
    } catch (error) {
      toast.error('로그아웃 중 오류가 발생했습니다');
      console.error('Logout error:', error);
    }
  };

  if (isFetching) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl space-y-6 p-4 pb-24">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">설정</h1>
        <p className="text-muted-foreground">
          프로필 및 앱 설정을 관리하세요
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>데이터 관리</CardTitle>
          <CardDescription>루틴과 운동종목을 관리하세요</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Link
            href="/settings/routines"
            className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <ListChecks className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">루틴 관리</div>
                <div className="text-sm text-muted-foreground">나만의 운동 루틴을 만들고 관리하세요</div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
          <Separator />
          <Link
            href="/settings/exercises"
            className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Dumbbell className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="font-medium">운동종목 관리</div>
                <div className="text-sm text-muted-foreground">운동을 검색하고 커스텀 운동을 추가하세요</div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <CardTitle>프로필</CardTitle>
              <CardDescription>{userEmail}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">언어</Label>
              <Select
                value={language}
                onValueChange={(value) => setValue('language', value as 'ko' | 'en')}
              >
                <SelectTrigger id="language">
                  <SelectValue placeholder="언어 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ko">한국어</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectItem value="beginner">초보자</SelectItem>
                  <SelectItem value="intermediate">중급자</SelectItem>
                  <SelectItem value="advanced">고급자</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                '저장'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>계정</CardTitle>
          <CardDescription>로그아웃 및 계정 관리</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            로그아웃
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>앱 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>버전</span>
            <span className="font-medium">0.1.0</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span>빌드</span>
            <span className="font-medium">Beta</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
