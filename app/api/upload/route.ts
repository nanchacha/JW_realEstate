import { NextRequest, NextResponse } from 'next/server';
import { parseExcelToDeal } from '@/lib/parseExcel';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'Excel 파일을 업로드해주세요.' },
                { status: 400 }
            );
        }

        // 파일을 Buffer로 변환
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Excel 파싱
        const deals = parseExcelToDeal(buffer);

        if (deals.length === 0) {
            return NextResponse.json(
                { error: '파싱된 데이터가 없습니다.' },
                { status: 400 }
            );
        }

        // 데이터 확인용 로그
        if (deals.length > 0) {
            console.log('First deal to insert:', JSON.stringify(deals[0], null, 2));
        }

        // Supabase에 저장
        const { data, error } = await supabaseServer
            .from('deals')
            .insert(deals)
            .select();

        if (error) {
            const errorLog = `
Time: ${new Date().toISOString()}
Message: ${error.message}
Details: ${error.details}
Hint: ${error.hint}
Code: ${error.code}
Data Sample: ${JSON.stringify(deals[0], null, 2)}
----------------------------------------
`;
            // fs 모듈을 동적으로 import하거나 상단에 추가해야 함. 
            // Next.js Edge Runtime이 아니라면 'fs' 사용 가능.
            // 여기서는 console.error로 충분히 남기고, 파일 쓰기는 fs import가 필요하므로
            // 간단히 console.error를 강화하고, fs를 사용하려면 import를 추가해야 함.
            // route.ts는 Node.js 환경이므로 fs 사용 가능.

            console.error('Supabase Error Log:', errorLog);

            // 파일로 저장 시도 (fs import 필요)
            try {
                const fs = require('fs');
                fs.appendFileSync('error.log', errorLog);
            } catch (fsError) {
                console.error('Failed to write error log:', fsError);
            }

            return NextResponse.json(
                { error: 'DB 저장 중 오류가 발생했습니다.', details: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            count: data?.length || 0,
            message: `${data?.length || 0}건의 거래가 저장되었습니다.`,
        });
    } catch (error: any) {
        console.error('업로드 오류:', error);
        return NextResponse.json(
            { error: '업로드 중 오류가 발생했습니다.', details: error.message },
            { status: 500 }
        );
    }
}
