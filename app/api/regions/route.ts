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

        const { data, error } = await supabaseServer
            .from('deals')
            .select('city, region')
            .eq('period_key', periodKey);

        if (error) {
            throw error;
        }

        // 중복 제거
        const regionsSet = new Set<string>();
        data.forEach((item: any) => {
            const regionStr = `${item.city} ${item.region}`.trim();
            if (regionStr) {
                regionsSet.add(regionStr);
            }
        });

        const regions = Array.from(regionsSet).sort();

        return NextResponse.json({
            success: true,
            regions,
        });
    } catch (error: any) {
        console.error('지역 목록 조회 오류:', error);
        return NextResponse.json(
            { error: '지역 목록 조회 중 오류가 발생했습니다.', details: error.message },
            { status: 500 }
        );
    }
}
