import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { data: dealsData, error: dealsError } = await supabaseServer
            .from('deals')
            .select('period_key')
            .limit(50000);

        const uniquePeriods = Array.from(new Set(dealsData?.map(d => d.period_key) || []));

        return NextResponse.json({
            uniquePeriods,
            totalRows: dealsData?.length,
            dealsError,
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message });
    }
}
