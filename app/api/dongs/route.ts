import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const periodKey = searchParams.get('period');

        if (!periodKey) {
            return NextResponse.json(
                { error: 'period 파라미터가 필요합니다.' },
                { status: 400 }
            );
        }

        // 해당 기간의 동 목록 조회 (중복 제거를 위해 distinct 사용 불가하므로 rpc나 js로 처리해야 함, 
        // 하지만 supabase js client에서 distinct select가 가능함)
        // .select('dong', { count: 'exact', head: false }) -> distinct option is not directly available in simple select
        // We can fetch all dongs and filter in JS or use a postgres function if performance is critical.
        // For now, given the scale, fetching all dongs for the period and creating a Set is fine.

        const { data, error } = await supabaseServer
            .from('deals')
            .select('dong')
            .eq('period_key', periodKey);

        if (error) {
            throw error;
        }

        // 중복 제거 및 정렬
        const dongs = Array.from(new Set(data.map((item: any) => item.dong))).sort();

        return NextResponse.json({
            success: true,
            dongs,
        });
    } catch (error: any) {
        console.error('동 목록 조회 오류:', error);
        return NextResponse.json(
            { error: '동 목록 조회 중 오류가 발생했습니다.', details: error.message },
            { status: 500 }
        );
    }
}
