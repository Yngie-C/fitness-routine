import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod/v4';
import { db } from '@/lib/db';
import { routines } from '@/lib/db/schema';
import { createClient } from '@/lib/supabase/server';
import { eq } from 'drizzle-orm';

const reorderSchema = z.object({
  routine_ids: z.array(z.string().uuid()).min(1),
});

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = z.safeParse(reorderSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { routine_ids } = validation.data;

    // Update sort_order for each routine
    await db.transaction(async (tx: any) => {
      for (let i = 0; i < routine_ids.length; i++) {
        await tx
          .update(routines)
          .set({ sort_order: i, updated_at: new Date().toISOString() })
          .where(eq(routines.id, routine_ids[i]));
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to reorder routines:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
