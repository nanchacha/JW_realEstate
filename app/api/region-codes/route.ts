import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET() {
    try {
        const { data, error } = await supabaseServer
            .from('region_codes')
            .select('*')
            .order('city', { ascending: true })
            .order('region', { ascending: true });

        if (error) {
            throw error;
        }

        return NextResponse.json({ codes: data || [] });
    } catch (error: any) {
        console.error('법정동코드 조회 오류:', error);
        return NextResponse.json(
            { error: '법정동코드를 불러오는 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}
