'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

type Template = {
  id: string;
  name: string;
  description: string | null;
  experience_level: string | null;
  exercises: Array<{
    exercise: {
      name_ko: string;
    } | null;
  }>;
};

const levelConfig = {
  beginner: {
    label: '초급',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  intermediate: {
    label: '중급',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  advanced: {
    label: '고급',
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
} as const;

export function TemplatePicker() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [copyingId, setCopyingId] = useState<string | null>(null);

  useEffect(() => {
    if (open && templates.length === 0) {
      fetchTemplates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/routines/templates');
      if (!response.ok) {
        throw new Error('템플릿을 불러오는데 실패했습니다');
      }
      const data = await response.json();
      setTemplates(data.routines || []);
    } catch (error) {
      toast.error('템플릿을 불러오는데 실패했습니다');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = async (templateId: string) => {
    if (copyingId) return;
    setCopyingId(templateId);
    try {
      const response = await fetch(
        `/api/v1/routines/templates/${templateId}/copy`,
        { method: 'POST' }
      );
      if (!response.ok) {
        throw new Error('Failed to copy template');
      }
      toast.success('루틴이 추가되었습니다!');
      setOpen(false);
      router.push('/settings/routines');
    } catch {
      toast.error('루틴 복사에 실패했습니다.');
    } finally {
      setCopyingId(null);
    }
  };

  const beginnerTemplates = templates.filter(
    (t) => t.experience_level === 'beginner'
  );
  const intermediateTemplates = templates.filter(
    (t) => t.experience_level === 'intermediate'
  );
  const advancedTemplates = templates.filter(
    (t) => t.experience_level === 'advanced'
  );

  const renderTemplateList = (filteredTemplates: Template[]) => {
    if (loading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (filteredTemplates.length === 0) {
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-sm text-muted-foreground">
              사용 가능한 템플릿이 없습니다
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-3">
        {filteredTemplates.map((template) => {
          const exerciseCount = template.exercises.length;
          const level = template.experience_level as keyof typeof levelConfig;
          const config = levelConfig[level];

          const isCopying = copyingId === template.id;
          const isDisabled = copyingId !== null;

          return (
            <Card
              key={template.id}
              className={`transition-colors ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-accent/50'}`}
              onClick={() => handleTemplateSelect(template.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {isCopying && <Loader2 className="h-4 w-4 animate-spin" />}
                  <h3 className="font-semibold">{template.name}</h3>
                  {config && (
                    <Badge variant="secondary" className={config.className}>
                      {config.label}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {exerciseCount}개 운동
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {template.exercises
                    .slice(0, 3)
                    .map((ex) => ex.exercise?.name_ko)
                    .filter(Boolean)
                    .join(' · ')}
                  {exerciseCount > 3 && ` 외 ${exerciseCount - 3}개`}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <div>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 text-muted-foreground"
          >
            <FileText className="h-4 w-4" />
            템플릿에서 시작하기
          </Button>
        </div>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh]">
        <SheetHeader className="mb-4">
          <SheetTitle>루틴 템플릿 선택</SheetTitle>
        </SheetHeader>
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">
              전체
            </TabsTrigger>
            <TabsTrigger value="beginner" className="flex-1">
              초급
            </TabsTrigger>
            <TabsTrigger value="intermediate" className="flex-1">
              중급
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex-1">
              고급
            </TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto max-h-[calc(85vh-140px)]">
            <TabsContent value="all" className="mt-0">
              {renderTemplateList(templates)}
            </TabsContent>

            <TabsContent value="beginner" className="mt-0">
              {renderTemplateList(beginnerTemplates)}
            </TabsContent>

            <TabsContent value="intermediate" className="mt-0">
              {renderTemplateList(intermediateTemplates)}
            </TabsContent>

            <TabsContent value="advanced" className="mt-0">
              {renderTemplateList(advancedTemplates)}
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
