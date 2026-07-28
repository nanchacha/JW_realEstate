import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { buildReport } from '@/lib/buildReport';
import { renderTables } from '@/lib/renderTables';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { periodKey, city, region } = body;

        if (!periodKey) {
            return NextResponse.json({ error: 'periodKey가 필요합니다.' }, { status: 400 });
        }

        const reportData = await buildReport(periodKey, city, region);

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: '서버에 GEMINI_API_KEY가 설정되어 있지 않습니다. .env.local 파일을 확인해주세요.' },
                { status: 500 }
            );
        }

        const ai = new GoogleGenAI({ apiKey });

        // 샘플 계약 추출 (각 5개)
        const sampleContracts = {
            new: reportData.contracts.new.slice(0, 5),
            renew: reportData.contracts.renew.slice(0, 5)
        };

        const prompt = `
당신은 친절하고 전문적인 부동산 데이터 분석가이자 블로거입니다.
다음은 '${reportData.meta.period_text}' '${reportData.meta.region}' 아파트 전월세 실거래가 상세 데이터입니다.

[요약 데이터]
- 총 거래 건수: ${reportData.summary.total_count}건
- 신규 계약: ${reportData.summary.new_count}건 (전세 ${reportData.summary.new_jeonse_count}, 월세 ${reportData.summary.new_wolse_count})
- 갱신 계약: ${reportData.summary.renew_count}건 (전세 ${reportData.summary.renew_jeonse_count}, 월세 ${reportData.summary.renew_wolse_count})

[상세 통계 (평형별 평균가)]
${JSON.stringify(reportData.stats, null, 2)}

[샘플 계약 내역 (참고용 상위 5건)]
${JSON.stringify(sampleContracts, null, 2)}

위 데이터를 심층적으로 분석하여, 티스토리 블로그에 올릴 수 있는 전문가 수준의 인사이트 리포트와 인포그래픽 요약 데이터를 생성해주세요.
반드시 아래 JSON 형식으로 응답해야 합니다.

{
  "blogHtml": "블로그 HTML 본문 내용 (태그 포함, markdown 형식 제외)",
  "infographicData": {
    "subTitle": "인포그래픽 상단 텍스트 (예: '실거래가 데이터 기반 심층 분석')",
    "mainTitle": "메인 제목의 첫 부분 (예: '구리시 59㎡')",
    "highlightTitle": "강조할 제목 부분 (예: '1.7억 격차의 의미')",
    "metric1_label": "핵심 지표 1 이름 (예: '최대 갭 차이')",
    "metric1_value": "핵심 지표 1 수치 (예: '1.7억원')",
    "metric2_label": "핵심 지표 2 이름 (예: '주요 특징')",
    "metric2_value": "핵심 지표 2 수치 (예: '갱신계약 급증')"
  }
}

[blogHtml 작성 지침]
1. 가장 윗줄에는 인포그래픽이 들어갈 자리임을 표시하는 다음 주석을 삽입하세요:
   <!-- 인포그래픽 이미지 삽입 위치 -->
2. 매력적이고 구체적인 제목을 <h1> 태그로 작성하세요.
3. 데이터를 바탕으로 4가지의 핵심 인사이트를 도출하여 각각 <h3> 태그를 달아 설명해주세요.
4. 단락은 <p> 태그를 사용하고, 강조할 부분은 <b>나 <strong>을 사용하세요.
5. 마지막 결론 섹션을 작성해주세요.
6. 표(table)는 직접 생성하지 마세요.

[infographicData 작성 지침]
- 위 블로그 글에서 도출한 가장 중요하고 흥미로운 인사이트 2가지를 metric1, metric2로 요약하여 작성하세요.
- 글자 수가 너무 길지 않게 간결하게 작성하세요.
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
            }
        });

        let responseText = response.text || '{}';
        let parsed;
        try {
            parsed = JSON.parse(responseText);
        } catch (e) {
            console.error('JSON Parse Error:', e, responseText);
            throw new Error('AI 응답을 파싱할 수 없습니다.');
        }

        let generatedHtml = parsed.blogHtml || '';
        
        // 데이터 테이블 붙이기
        const tablesHtml = renderTables(reportData);
        
        const finalHtml = `${generatedHtml}\n\n<br/>\n\n${tablesHtml}`;

        return NextResponse.json({ 
            success: true, 
            text: finalHtml,
            infographicData: parsed.infographicData 
        });
    } catch (error: any) {
        console.error('Gemini API Error:', error);
        return NextResponse.json(
            { error: '블로그 글 생성 중 오류가 발생했습니다.', details: error.message },
            { status: 500 }
        );
    }
}

