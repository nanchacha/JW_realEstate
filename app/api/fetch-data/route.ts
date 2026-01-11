import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { Deal } from '@/lib/types';
import { parseString } from 'xml2js';

interface MolitApiItem {
    aptNm?: string[];           // 아파트명
    aptSeq?: string[];          // 아파트 시퀀스
    buildYear?: string[];       // 건축년도
    contractTerm?: string[];    // 계약기간
    contractType?: string[];    // 계약구분
    dealDay?: string[];         // 계약일
    dealMonth?: string[];       // 계약월
    dealYear?: string[];        // 계약년도
    deposit?: string[];         // 보증금 (콤마 포함)
    excluUseAr?: string[];      // 전용면적
    floor?: string[];           // 층
    jibun?: string[];           // 지번
    monthlyRent?: string[];     // 월세
    preDeposit?: string[];      // 종전계약보증금
    preMonthlyRent?: string[];  // 종전계약월세
    roadnm?: string[];          // 도로명
    sggCd?: string[];           // 시군구코드
    umdNm?: string[];           // 법정동명
    useRRRight?: string[];      // 갱신요구권사용
}

/**
 * 국토교통부 API에서 전월세 데이터를 가져오는 함수
 */
async function fetchMolitData(
    lawdCd: string,
    dealYmd: string
): Promise<MolitApiItem[]> {
    const apiKey = process.env.MOLIT_API_KEY;

    if (!apiKey) {
        throw new Error('MOLIT_API_KEY 환경변수가 설정되지 않았습니다.');
    }

    const baseUrl = 'https://apis.data.go.kr/1613000/RTMSDataSvcAptRent/getRTMSDataSvcAptRent';

    const params = new URLSearchParams({
        serviceKey: apiKey,
        LAWD_CD: lawdCd,
        DEAL_YMD: dealYmd,
        numOfRows: '1000',
        pageNo: '1',
    });

    const url = `${baseUrl}?${params}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const xmlText = await response.text();

        return new Promise((resolve, reject) => {
            parseString(xmlText, { explicitArray: true }, (err, result) => {
                if (err) {
                    console.error('XML 파싱 오류:', err);
                    reject(err);
                    return;
                }

                try {
                    const response = result?.response;
                    const header = response?.header?.[0];
                    const body = response?.body?.[0];

                    const resultCode = header?.resultCode?.[0];
                    const resultMsg = header?.resultMsg?.[0];

                    console.log('API 결과 코드:', resultCode);
                    console.log('API 결과 메시지:', resultMsg);

                    if (resultCode !== '00' && resultCode !== '000') {
                        reject(new Error(`API 오류: ${resultMsg} (코드: ${resultCode})`));
                        return;
                    }

                    const items = body?.items?.[0]?.item || [];
                    console.log(`추출된 데이터 건수: ${items.length}`);

                    resolve(items);
                } catch (parseError) {
                    console.error('응답 파싱 오류:', parseError);
                    reject(parseError);
                }
            });
        });
    } catch (error: any) {
        console.error('국토교통부 API 호출 오류:', error);
        throw error;
    }
}

function parseRegionCode(lawdCd: string): { city: string; region: string } {
    const cityCode = lawdCd.substring(0, 2);
    const regionCode = lawdCd.substring(0, 5);

    const cityMap: { [key: string]: string } = {
        '11': '서울특별시',
        '26': '부산광역시',
        '27': '대구광역시',
        '28': '인천광역시',
        '29': '광주광역시',
        '30': '대전광역시',
        '31': '울산광역시',
        '36': '세종특별자치시',
        '41': '경기도',
        '42': '강원도',
        '43': '충청북도',
        '44': '충청남도',
        '45': '전라북도',
        '46': '전라남도',
        '47': '경상북도',
        '48': '경상남도',
        '50': '제주특별자치도',
    };

    const regionMap: { [key: string]: string } = {
        '11110': '종로구',
        '11140': '중구',
        '11170': '용산구',
        '11200': '성동구',
        '11215': '광진구',
        '11230': '동대문구',
        '11260': '중랑구',
        '11290': '성북구',
        '11305': '강북구',
        '11320': '도봉구',
        '11350': '노원구',
        '11380': '은평구',
        '11410': '서대문구',
        '11440': '마포구',
        '11470': '양천구',
        '11500': '강서구',
        '11530': '구로구',
        '11545': '금천구',
        '11560': '영등포구',
        '11590': '동작구',
        '11620': '관악구',
        '11650': '서초구',
        '11680': '강남구',
        '11710': '송파구',
        '11740': '강동구',
        '41450': '하남시',
        '41130': '성남시',
    };

    const city = cityMap[cityCode] || '알 수 없음';
    const region = regionMap[regionCode] || '알 수 없음';

    return { city, region };
}

function convertMolitDataToDeal(item: MolitApiItem, lawdCd: string): Deal | null {
    try {
        const { city, region } = parseRegionCode(lawdCd);
        const dong = item.umdNm?.[0] || item.jibun?.[0] || '';

        const monthlyRentStr = (item.monthlyRent?.[0] || '0').replace(/,/g, '').trim();
        const monthlyRentValue = parseFloat(monthlyRentStr);
        const lease_kind = monthlyRentValue === 0 ? 'JEONSE' : 'WOLSE';

        const contractTypeVal = (item.contractType?.[0] || '').trim();
        const contract_kind = contractTypeVal.includes('갱신') || contractTypeVal === '갱신' ? 'RENEW' : 'NEW';

        const area_m2 = parseFloat((item.excluUseAr?.[0] || '0').toString());
        const area_type = Math.round(area_m2 / 3.3);

        const depositStr = (item.deposit?.[0] || '0').replace(/,/g, '').trim();
        const deposit_manwon = parseFloat(depositStr);
        const deposit_uk = Math.round((deposit_manwon / 10000) * 10) / 10;

        const rent_manwon = lease_kind === 'WOLSE' ? monthlyRentValue : undefined;

        const year = item.dealYear?.[0] || '';
        const month = (item.dealMonth?.[0] || '').padStart(2, '0');
        const day = (item.dealDay?.[0] || '').padStart(2, '0');
        const contract_date = `${year}-${month}-${day}`;

        const dateObj = new Date(contract_date);
        if (isNaN(dateObj.getTime())) {
            console.warn('유효하지 않은 날짜:', contract_date);
            return null;
        }

        const dateDay = dateObj.getDate();
        let week = 1;
        if (dateDay <= 7) week = 1;
        else if (dateDay <= 14) week = 2;
        else if (dateDay <= 21) week = 3;
        else week = 4;

        const period_key = `${year}-${month}-W${week}`;
        const period_text = `${year}년 ${parseInt(month)}월 ${week}주차`;

        const prevDepositStr = (item.preDeposit?.[0] || '').replace(/,/g, '').trim();
        const prev_deposit_manwon = prevDepositStr ? parseFloat(prevDepositStr) : undefined;

        const floor = parseInt((item.floor?.[0] || '0').toString());
        const complex = item.aptNm?.[0] || '';
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
        console.error('데이터 변환 오류:', error);
        return null;
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { lawdCd, dealYmd } = body;

        if (!lawdCd || !dealYmd) {
            return NextResponse.json(
                { error: '법정동코드(lawdCd)와 계약년월(dealYmd)이 필요합니다.' },
                { status: 400 }
            );
        }

        console.log(`데이터 수집 시작: 법정동코드=${lawdCd}, 계약년월=${dealYmd}`);

        const apiData = await fetchMolitData(lawdCd, dealYmd);

        if (apiData.length === 0) {
            return NextResponse.json({
                success: true,
                count: 0,
                message: '해당 조건의 데이터가 없습니다.',
            });
        }

        console.log(`API에서 받은 데이터: ${apiData.length}건`);

        const deals = apiData
            .map(item => convertMolitDataToDeal(item, lawdCd))
            .filter((deal): deal is Deal => deal !== null);

        console.log(`변환 완료된 데이터: ${deals.length}건`);

        if (deals.length === 0) {
            return NextResponse.json({
                success: true,
                count: 0,
                message: '변환 가능한 데이터가 없습니다.',
            });
        }

        const { data, error } = await supabaseServer
            .from('deals')
            .insert(deals)
            .select();

        if (error) {
            console.error('Supabase 저장 오류:', error);
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
        console.error('데이터 수집 오류:', error);
        return NextResponse.json(
            { error: '데이터 수집 중 오류가 발생했습니다.', details: error.message },
            { status: 500 }
        );
    }
}
