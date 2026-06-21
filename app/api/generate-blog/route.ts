import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { periodText, region, summary } = body;

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: '서버에 GEMINI_API_KEY가 설정되어 있지 않습니다. .env.local 파일을 확인해주세요.' },
                { status: 500 }
            );
        }

        const ai = new GoogleGenAI({ apiKey });

        const prompt = `
당신은 친절하고 전문적인 부동산 데이터 분석가이자 블로거입니다.
다음은 '${region}' 지역의 '${periodText}' 전월세 실거래가 요약 데이터입니다.

[요약 데이터]
- 총 거래 건수: ${summary.total_count}건
- 신규 계약: ${summary.new_count}건
- 갱신 계약: ${summary.renew_count}건
- 전세 거래: ${summary.jeonse_count}건
- 월세 거래: ${summary.wolse_count}건

이 데이터를 바탕으로, 티스토리 블로그에 올릴 수 있는 깔끔하고 읽기 쉬운 시황 리포트 글을 작성해주세요.
- 제목을 포함해주세요 (예: 📊 [지역명] 00월 0주차 전월세 실거래가 리포트)
- 적절한 이모지를 사용하여 시각적으로 지루하지 않게 작성해주세요.
- 신규/갱신 비율이나 전월세 비율 등을 바탕으로 짧은 인사이트나 코멘트를 추가해주세요.
- 독자에게 친절한 인사말과 마무리 멘트를 포함해주세요.
- Markdown 형식을 사용하여 제목(##), 강조(**) 등을 예쁘게 구성해주세요.
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const generatedText = response.text;

        return NextResponse.json({ success: true, text: generatedText });
    } catch (error: any) {
        console.error('Gemini API Error:', error);
        return NextResponse.json(
            { error: '블로그 글 생성 중 오류가 발생했습니다.', details: error.message },
            { status: 500 }
        );
    }
}
