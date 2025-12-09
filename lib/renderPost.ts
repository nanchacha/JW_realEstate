import { ReportData } from './types';

export function renderPost(data: ReportData): string {
    const { meta, summary, stats, contracts } = data;

    let text = '';

    // period_text에서 월과 주차 추출 ("2025년 12월 1주차" -> "12월 1주차")
    const periodMatch = meta.period_text.match(/\d+월\s+\d+주차/);
    const periodDisplay = periodMatch ? periodMatch[0] : meta.period_text;

    // 지역 표시 (city + region 조합)
    const locationDisplay = `${meta.city} ${meta.region}`.trim();

    // 제목
    text += `${periodDisplay} ${locationDisplay} 아파트 전·월세 실거래 정리\n\n`;

    // 서론
    text += `국토교통부 실거래가 공개자료를 기준으로 ${meta.period_text} ${locationDisplay} 아파트 전·월세 거래를 정리했습니다.\n\n`;

    // 요약
    text += `총 ${summary.total_count}건의 거래가 있었으며, `;
    text += `신규 계약 ${summary.new_count}건(전세 ${summary.new_jeonse_count}건, 월세 ${summary.new_wolse_count}건), `;
    text += `갱신 계약 ${summary.renew_count}건(전세 ${summary.renew_jeonse_count}건, 월세 ${summary.renew_wolse_count}건)입니다.\n`;
    text += `전체적으로는 전세 ${summary.jeonse_count}건, 월세 ${summary.wolse_count}건입니다.\n\n`;

    // 신규 계약 통계
    if (stats.new.jeonse_by_type.length > 0 || stats.new.wolse_by_type.length > 0) {
        text += `### 신규 계약 통계\n\n`;

        if (stats.new.jeonse_by_type.length > 0) {
            text += `**전세**\n`;
            stats.new.jeonse_by_type.forEach((stat) => {
                text += `- ${stat.area_type}㎡: ${stat.count}건, 평균 ${stat.avg_deposit_uk}억\n`;
            });
            text += `\n`;
        }

        if (stats.new.wolse_by_type.length > 0) {
            text += `**월세**\n`;
            stats.new.wolse_by_type.forEach((stat) => {
                text += `- ${stat.area_type}㎡: ${stat.count}건, 평균 ${stat.avg_deposit_uk}억/${stat.avg_rent_manwon}만원\n`;
            });
            text += `\n`;
        }
    }

    // 갱신 계약 통계
    if (stats.renew.jeonse_by_type.length > 0 || stats.renew.wolse_by_type.length > 0) {
        text += `### 갱신 계약 통계\n\n`;

        if (stats.renew.jeonse_by_type.length > 0) {
            text += `**전세**\n`;
            stats.renew.jeonse_by_type.forEach((stat) => {
                text += `- ${stat.area_type}㎡: ${stat.count}건, 평균 ${stat.avg_deposit_uk}억\n`;
            });
            text += `\n`;
        }

        if (stats.renew.wolse_by_type.length > 0) {
            text += `**월세**\n`;
            stats.renew.wolse_by_type.forEach((stat) => {
                text += `- ${stat.area_type}㎡: ${stat.count}건, 평균 ${stat.avg_deposit_uk}억/${stat.avg_rent_manwon}만원\n`;
            });
            text += `\n`;
        }
    }

    text += `상세 거래 내역은 아래 표를 참조하세요.\n\n`;

    return text;
}
