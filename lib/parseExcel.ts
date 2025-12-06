import * as XLSX from 'xlsx';
import { Deal } from './types';

export function parseExcelToDeal(buffer: Buffer): Deal[] {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // 13행부터 데이터 시작 (헤더는 12행)
    const rawData = XLSX.utils.sheet_to_json(sheet, { range: 12 });

    const deals: Deal[] = [];

    rawData.forEach((row: any) => {
        try {
            // 시군구 파싱 (예: "서울특별시 강동구 고덕동" → city: "서울특별시", region: "강동구", dong: "고덕동")
            const fullRegion = (row['시군구'] || '').toString().trim();
            const parts = fullRegion.split(/\s+/); // 공백으로 분리

            let city = '';
            let region = '';
            let dong = '';

            if (parts.length >= 3) {
                // "서울특별시 강동구 고덕동" 형식
                city = parts[0];
                region = parts[1];
                dong = parts.slice(2).join(' '); // 나머지 부분을 모두 동으로 (공백이 여러 개일 수 있음)
            } else if (parts.length === 2) {
                // "경기도 하남시" 형식 (동이 없는 경우)
                city = parts[0];
                region = parts[1];
                dong = '';
            } else if (parts.length === 1) {
                // 단일 값인 경우
                city = parts[0];
                region = '';
                dong = '';
            }

            // 전월세 구분
            const rentTypeRaw = row['전월세구분'] || '';
            const lease_kind = rentTypeRaw.includes('전세') ? 'JEONSE' : 'WOLSE';

            // 신규/갱신 구분 ('계약구분' 컬럼 사용)
            const contractTypeRaw = row['계약구분'] || '';
            const contract_kind = contractTypeRaw.includes('갱신') ? 'RENEW' : 'NEW';

            // 타입(전용면적) 반올림 ('전용면적(㎡)' 컬럼 사용)
            const area_m2 = parseFloat((row['전용면적(㎡)'] || '0').toString());
            const area_type = Math.round(area_m2 / 3.3);

            // 보증금(만원) → 억 변환 (콤마 제거)
            const depositStr = (row['보증금(만원)'] || '0').toString().replace(/,/g, '');
            const deposit_manwon = parseFloat(depositStr);
            const deposit_uk = Math.round((deposit_manwon / 10000) * 10) / 10;

            // 월세 (콤마 제거)
            const rentStr = (row['월세금(만원)'] || '0').toString().replace(/,/g, '');
            const rent_manwon = lease_kind === 'WOLSE' ? parseFloat(rentStr) : undefined;

            // 계약일 (계약년월 + 계약일 조합)
            // 예: 계약년월 "202512", 계약일 "03" -> "2025-12-03"
            const yearMonth = (row['계약년월'] || '').toString();
            const dayStr = (row['계약일'] || '').toString();
            let contract_date = '';

            if (yearMonth.length === 6 && dayStr.length > 0) {
                const year = yearMonth.substring(0, 4);
                const month = yearMonth.substring(4, 6);
                const day = dayStr.padStart(2, '0');
                contract_date = `${year}-${month}-${day}`;
            } else {
                // fallback: 기존 로직 혹은 현재 날짜
                contract_date = normalizeDate(row['계약일'] || '');
                if (!contract_date || contract_date.length < 10) {
                    // 날짜 파싱 실패 시 스킵하거나 기본값 처리
                    // 여기서는 에러를 피하기 위해 유효하지 않으면 현재 날짜 혹은 스킵 처리
                    // 하지만 DB constraints 때문에 유효한 날짜여야 함.
                    // 로그를 남기고 스킵하는 것이 안전함.
                    console.warn('날짜 파싱 실패:', row);
                    return;
                }
            }

            // period_key 생성 (예: "2025-11-W1")
            const period_key = generatePeriodKey(contract_date);

            // period_text
            const period_text = generatePeriodText(period_key);

            // 계약 유형 라벨
            const contract_type_label = contract_kind === 'NEW' ? '신규' : '갱신';

            // 종전계약 보증금 (콤마 제거)
            const prevDepositStr = (row['종전계약 보증금(만원)'] || '0').toString().replace(/,/g, '');
            const prev_deposit_manwon = parseFloat(prevDepositStr) || undefined;

            const deal: Deal = {
                city,
                region,
                dong,
                complex: row['단지명'] || '', // '단지' -> '단지명'
                lease_kind,
                contract_kind,
                area_m2,
                area_type,
                contract_date,
                period_key,
                deposit_manwon,
                deposit_uk,
                rent_manwon,
                floor: parseInt((row['층'] || '0').toString()),
                period_text,
                contract_type_label,
                renew_right_used: row['갱신요구권 사용'] || '', // '갱신요구권사용' -> '갱신요구권 사용'
                prev_deposit_manwon,
                raw_row: row,
            };

            deals.push(deal);
        } catch (error) {
            console.error('행 파싱 오류:', error);
        }
    });

    return deals;
}

function normalizeDate(dateStr: string): string {
    // "25.11.01" → "2025-11-01" (기존 로직 유지하되 사용 빈도 낮음)
    if (!dateStr) return '';
    const parts = dateStr.split('.');
    if (parts.length === 3) {
        const year = parseInt(parts[0]) + 2000;
        const month = parts[1].padStart(2, '0');
        const day = parts[2].padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    return dateStr;
}

function generatePeriodKey(dateStr: string): string {
    // "2025-11-01" → "2025-11-W1"
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return ''; // 유효하지 않은 날짜

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = date.getDate();

    let week = 1;
    if (day <= 7) week = 1;
    else if (day <= 14) week = 2;
    else if (day <= 21) week = 3;
    else week = 4;

    return `${year}-${month}-W${week}`;
}

function generatePeriodText(periodKey: string): string {
    // "2025-11-W1" → "2025년 11월 1주차"
    if (!periodKey) return '';
    const match = periodKey.match(/(\d{4})-(\d{2})-W(\d+)/);
    if (match) {
        const year = match[1];
        const month = parseInt(match[2]);
        const week = match[3];
        return `${year}년 ${month}월 ${week}주차`;
    }
    return periodKey;
}
