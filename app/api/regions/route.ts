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

        let regionsSet = new Set<string>();
        let hasMore = true;
        let page = 0;

        // Supabase의 1000건 제한을 우회하기 위해 페이지네이션으로 전체 스캔
        while (hasMore && page < 50) {
            const { data, error } = await supabaseServer
                .from('deals')
                .select('city, region')
                .eq('period_key', periodKey)
                .range(page * 1000, (page + 1) * 1000 - 1);

            if (error) {
                throw error;
            }

            if (data && data.length > 0) {
                data.forEach((item: any) => {
                    const regionStr = `${item.city} ${item.region}`.trim();
                    if (regionStr && regionStr !== '알 수 없음') {
                        regionsSet.add(regionStr);
                    }
                });
                if (data.length < 1000) {
                    hasMore = false;
                }
            } else {
                hasMore = false;
            }
            page++;
        }

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
