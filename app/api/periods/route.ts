import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET() {
    try {
        const { data, error } = await supabaseServer
            .from('deals')
            .select('period_key')
            .order('period_key', { ascending: false });

        if (error) {
            throw error;
        }

        // 중복 제거
        const periods = Array.from(new Set(data.map((d) => d.period_key)));

        return NextResponse.json({ periods });
    } catch (error: any) {
        console.error('기간 목록 조회 오류:', error);
        return NextResponse.json(
            { error: '기간 목록을 불러오는 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
