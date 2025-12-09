import { NextRequest, NextResponse } from 'next/server';
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

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { code, city, region } = body;

        if (!code || !city || !region) {
            return NextResponse.json(
                { error: '필수 항목(코드, 시도, 시군구)이 누락되었습니다.' },
                { status: 400 }
            );
        }

        const { error } = await supabaseServer
            .from('region_codes')
            .insert([{ code, city, region }]);

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('법정동코드 추가 오류:', error);
        return NextResponse.json(
            { error: '법정동코드 추가 중 오류가 발생했습니다.', details: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const code = searchParams.get('code');

        if (!code) {
            return NextResponse.json(
                { error: '삭제할 코드가 필요합니다.' },
                { status: 400 }
            );
        }

        const { error } = await supabaseServer
            .from('region_codes')
            .delete()
            .eq('code', code);

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('법정동코드 삭제 오류:', error);
        return NextResponse.json(
            { error: '법정동코드 삭제 중 오류가 발생했습니다.', details: error.message },
            { status: 500 }
        );
    }
}
