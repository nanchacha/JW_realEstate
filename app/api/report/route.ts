import { NextRequest, NextResponse } from 'next/server';
import { buildReport } from '@/lib/buildReport';
import { renderPost } from '@/lib/renderPost';
import { renderTables } from '@/lib/renderTables';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const periodKey = searchParams.get('period');

        if (!periodKey) {
            return NextResponse.json(
                { error: 'period 파라미터가 필요합니다. (예: 2025-11-W1)' },
                { status: 400 }
            );
        }

        // 리포트 데이터 생성
        const reportData = await buildReport(periodKey);

        // 텍스트 및 HTML 생성
        const postText = renderPost(reportData);
        const tablesHtml = renderTables(reportData);

        return NextResponse.json({
            success: true,
            data: reportData,
            postText,
            tablesHtml,
        });
    } catch (error: any) {
        console.error('리포트 생성 오류:', error);

        if (error.message === '해당 기간의 데이터가 없습니다.') {
            return NextResponse.json(
                { error: '해당 기간의 데이터가 없습니다. 날짜를 확인해주세요.' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: '리포트 생성 중 오류가 발생했습니다.', details: error.message },
            { status: 500 }
        );
    }
}
