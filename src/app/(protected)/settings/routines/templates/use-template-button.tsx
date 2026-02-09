'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function UseTemplateButton({ templateId }: { templateId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCopy = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/v1/routines/templates/${templateId}/copy`,
        { method: 'POST' }
      );

      if (!response.ok) {
        throw new Error('Failed to copy template');
      }

      toast.success('루틴이 추가되었습니다!');
      router.push('/settings/routines');
    } catch (error) {
      toast.error('루틴 복사에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      className="w-full"
      variant="outline"
      onClick={handleCopy}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Copy className="h-4 w-4 mr-2" />
      )}
      {isLoading ? '복사 중...' : '이 루틴 사용하기'}
    </Button>
  );
}
