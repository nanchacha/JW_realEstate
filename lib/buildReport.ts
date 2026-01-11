import { supabaseServer } from './supabaseServer';
import { ReportData, Deal, TypeStat, ContractItem } from './types';

export async function buildReport(periodKey: string, city?: string, region?: string): Promise<ReportData> {
    // DB에서 해당 기간의 거래 데이터 조회
    let query = supabaseServer
        .from('deals')
        .select('*')
        .eq('period_key', periodKey)
        .order('contract_date', { ascending: true });

    if (city) {
        query = query.eq('city', city);
    }

    if (region) {
        query = query.eq('region', region);
    }

    const { data: deals, error } = await query;

    if (error || !deals || deals.length === 0) {
        throw new Error('해당 기간의 데이터가 없습니다.');
    }

    // 메타 정보
    // 메타 정보
    const cityVal = deals[0].city || city || '';
    const regionVal = deals[0].region || '';

    let locationText = '';
    if (cityVal && regionVal) {
        // regionVal이 cityVal을 포함하지 않을 때만 앞에 cityVal을 붙임
        if (regionVal.startsWith(cityVal)) {
            locationText = regionVal;
        } else {
            locationText = `${cityVal} ${regionVal}`;
        }
    } else {
        locationText = regionVal || cityVal || '지역 정보 없음';
    }

    const meta = {
        period_key: periodKey,
        period_text: deals[0].period_text || periodKey,
        city: cityVal,
        region: locationText,
    };

    // 요약 통계
    const newDeals = deals.filter((d: Deal) => d.contract_kind === 'NEW');
    const renewDeals = deals.filter((d: Deal) => d.contract_kind === 'RENEW');
    const jeonseDeals = deals.filter((d: Deal) => d.lease_kind === 'JEONSE');
    const wolseDeals = deals.filter((d: Deal) => d.lease_kind === 'WOLSE');

    const summary = {
        total_count: deals.length,
        new_count: newDeals.length,
        renew_count: renewDeals.length,
        jeonse_count: jeonseDeals.length,
        wolse_count: wolseDeals.length,
        new_jeonse_count: newDeals.filter((d: Deal) => d.lease_kind === 'JEONSE').length,
        new_wolse_count: newDeals.filter((d: Deal) => d.lease_kind === 'WOLSE').length,
        renew_jeonse_count: renewDeals.filter((d: Deal) => d.lease_kind === 'JEONSE').length,
        renew_wolse_count: renewDeals.filter((d: Deal) => d.lease_kind === 'WOLSE').length,
    };

    // 타입별 통계 생성
    function getStatsByType(dealList: Deal[], leaseKind: 'JEONSE' | 'WOLSE'): TypeStat[] {
        const filtered = dealList.filter((d) => d.lease_kind === leaseKind);
        const grouped = new Map<number, Deal[]>();

        filtered.forEach((deal) => {
            // area_type 대신 area_m2를 내림하여 그룹화
            const type = Math.floor(deal.area_m2 || 0);
            if (!grouped.has(type)) grouped.set(type, []);
            grouped.get(type)!.push(deal);
        });

        const stats: TypeStat[] = [];
        grouped.forEach((group, type) => {
            const count = group.length;
            const avg_deposit_uk =
                group.reduce((sum, d) => sum + (d.deposit_uk || 0), 0) / count;
            const avg_rent_manwon =
                leaseKind === 'WOLSE'
                    ? group.reduce((sum, d) => sum + (d.rent_manwon || 0), 0) / count
                    : undefined;

            stats.push({
                area_type: type,
                count,
                avg_deposit_uk: Math.round(avg_deposit_uk * 10) / 10,
                avg_rent_manwon: avg_rent_manwon ? Math.round(avg_rent_manwon) : undefined,
            });
        });

        return stats.sort((a, b) => a.area_type - b.area_type);
    }

    const stats = {
        new: {
            jeonse_by_type: getStatsByType(newDeals, 'JEONSE'),
            wolse_by_type: getStatsByType(newDeals, 'WOLSE'),
        },
        renew: {
            jeonse_by_type: getStatsByType(renewDeals, 'JEONSE'),
            wolse_by_type: getStatsByType(renewDeals, 'WOLSE'),
        },
    };

    // 계약 목록 생성
    function buildContractList(dealList: Deal[]): ContractItem[] {
        return dealList.map((deal, idx) => ({
            no: idx + 1,
            dong: deal.dong,
            complex: deal.complex,
            lease_kind: deal.lease_kind === 'JEONSE' ? '전세' : '월세',
            contract_type_label: deal.contract_type_label || '',
            area_type: deal.area_type || 0,
            area_m2: deal.area_m2 || 0,
            deposit_uk: deal.deposit_uk || 0,
            rent_manwon: deal.rent_manwon,
            floor: deal.floor || 0,
            contract_date: deal.contract_date,
            period_text: deal.period_text,
            renew_right_used: deal.renew_right_used,
        }));
    }

    const contracts = {
        new: buildContractList(newDeals),
        renew: buildContractList(renewDeals),
    };

    return {
        meta,
        summary,
        stats,
        contracts,
    };
}
