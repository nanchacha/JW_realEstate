/**
 * API 데이터를 Deal 형식으로 변환
 */
function convertMolitDataToDeal(item: MolitApiItem, lawdCd: string): Deal | null {
    try {
        // 지역 정보
        const { city, region } = parseRegionCode(lawdCd);
        const dong = item.umdNm?.[0] || item.jibun?.[0] || '';

        // 전월세 구분 (monthlyRent가 0이면 전세, 아니면 월세)
        const monthlyRentStr = (item.monthlyRent?.[0] || '0').replace(/,/g, '').trim();
        const monthlyRentValue = parseFloat(monthlyRentStr);
        const lease_kind = monthlyRentValue === 0 ? 'JEONSE' : 'WOLSE';

        // 계약구분 (신규/갱신) - contractType 또는 계약기간으로 판단
        const contractTypeVal = (item.contractType?.[0] || '').trim();
        const contract_kind = contractTypeVal.includes('갱신') || contractTypeVal === '갱신' ? 'RENEW' : 'NEW';

        // 전용면적
        const area_m2 = parseFloat((item.excluUseAr?.[0] || '0').toString());
        const area_type = Math.round(area_m2 / 3.3);

        // 보증금
        const depositStr = (item.deposit?.[0] || '0').replace(/,/g, '').trim();
        const deposit_manwon = parseFloat(depositStr);
        const deposit_uk = Math.round((deposit_manwon / 10000) * 10) / 10;

        // 월세
        const rent_manwon = lease_kind === 'WOLSE' ? monthlyRentValue : undefined;

        // 계약일
        const year = item.dealYear?.[0] || '';
        const month = (item.dealMonth?.[0] || '').padStart(2, '0');
        const day = (item.dealDay?.[0] || '').padStart(2, '0');
        const contract_date = `${year}-${month}-${day}`;

        // 날짜 유효성 검사
        const dateObj = new Date(contract_date);
        if (isNaN(dateObj.getTime())) {
            console.warn('유효하지 않은 날짜:', contract_date, item);
            return null;
        }

        // period_key 생성
        const dateDay = dateObj.getDate();
        let week = 1;
        if (dateDay <= 7) week = 1;
        else if (dateDay <= 14) week = 2;
        else if (dateDay <= 21) week = 3;
        else week = 4;

        const period_key = `${year}-${month}-W${week}`;
        const period_text = `${year}년 ${parseInt(month)}월 ${week}주차`;

        // 종전계약 보증금
        const prevDepositStr = (item.preDeposit?.[0] || '').replace(/,/g, '').trim();
        const prev_deposit_manwon = prevDepositStr ? parseFloat(prevDepositStr) : undefined;

        // 층
        const floor = parseInt((item.floor?.[0] || '0').toString());

        // 아파트명
        const complex = item.aptNm?.[0] || '';

        // 갱신요구권 사용
        const renewRightUsed = (item.useRRRight?.[0] || '').trim();

        return {
            city,
            region,
            dong,
            complex,
            lease_kind,
            contract_kind,
            area_m2,
            area_type,
            contract_date,
            period_key,
            deposit_manwon,
            deposit_uk,
            rent_manwon,
            floor,
            period_text,
            contract_type_label: contract_kind === 'NEW' ? '신규' : '갱신',
            renew_right_used: renewRightUsed,
            prev_deposit_manwon,
        };
    } catch (error) {
        console.error('데이터 변환 오류:', error, item);
        return null;
    }
}
