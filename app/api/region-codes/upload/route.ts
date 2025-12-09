import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { text } = body;

        if (!text) {
            return NextResponse.json(
                { error: '파일 내용이 비어있습니다.' },
                { status: 400 }
            );
        }

        const lines = text.split('\n');
        const codesToInsert = new Map<string, { code: string, city: string, region: string }>();

        for (const line of lines) {
            if (!line.trim()) continue;

            // 탭으로 구분 (데이터 구조: 법정동코드 \t 법정동명 \t 폐지여부)
            const parts = line.split('\t');
            if (parts.length < 3) continue;

            const codeFull = parts[0].trim();
            const nameFull = parts[1].trim();
            const status = parts[2].trim();

            // 1. 폐지여부가 '존재'인 경우만 처리
            if (status !== '존재') continue;

            // 2. 법정동명이 '시'로 끝나는 경우만 처리 (구/군 제외)
            if (!nameFull.endsWith('시')) continue;

            // 3. 법정동코드 앞 5자리 추출
            const code5 = codeFull.substring(0, 5);

            // 4. 시/도, 시/군/구 분리
            // 예: "경기도 수원시" -> city: "경기도", region: "수원시"
            // 예: "서울특별시" -> city: "서울특별시", region: "서울특별시" (화면 표시 등을 위해 동일하게 설정)
            const nameParts = nameFull.split(' ');
            let city = nameParts[0];
            let region = nameParts.length > 1 ? nameParts.slice(1).join(' ') : nameParts[0];

            // 중복 제거 (Map 사용)
            if (!codesToInsert.has(code5)) {
                codesToInsert.set(code5, { code: code5, city, region });
            }
        }

        const insertData = Array.from(codesToInsert.values());

        if (insertData.length === 0) {
            return NextResponse.json({
                success: true,
                message: '저장할 데이터가 없습니다. (조건에 맞는 행이 없음)',
                count: 0
            });
        }

        // DB 저장 (upsert)
        const { error } = await supabaseServer
            .from('region_codes')
            .upsert(insertData, { onConflict: 'code' });

        if (error) {
            throw error;
        }

        return NextResponse.json({
            success: true,
            message: '성공적으로 업로드되었습니다.',
            count: insertData.length
        });
    } catch (error: any) {
        console.error('법정동코드 업로드 오류:', error);
        return NextResponse.json(
            { error: '업로드 처리 중 오류가 발생했습니다.', details: error.message },
            { status: 500 }
        );
    }
}
