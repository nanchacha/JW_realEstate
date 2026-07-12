import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        let periods: string[] = [];
        let currentPeriod = null;

        // 가장 최근 period_key 하나 조회
        const { data: firstData, error: firstError } = await supabaseServer
            .from('deals')
            .select('period_key')
            .order('period_key', { ascending: false })
            .limit(1);

        if (firstError) throw firstError;

        if (firstData && firstData.length > 0) {
            currentPeriod = firstData[0].period_key;
            periods.push(currentPeriod);

            // 다음으로 작은 period_key를 반복적으로 조회 (스킵 스캔 방식)
            while (true) {
                const { data, error } = await supabaseServer
                    .from('deals')
                    .select('period_key')
                    .lt('period_key', currentPeriod)
                    .order('period_key', { ascending: false })
                    .limit(1);

                if (error) throw error;

                if (data && data.length > 0) {
                    currentPeriod = data[0].period_key;
                    periods.push(currentPeriod);
                } else {
                    break;
                }
            }
        }

        return NextResponse.json({ periods });
    } catch (error: any) {
        console.error('기간 목록 조회 오류:', error);
        return NextResponse.json(
            { error: '기간 목록을 불러오는 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
