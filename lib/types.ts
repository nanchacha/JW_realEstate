export interface Deal {
    id?: number;
    city: string;
    region: string;
    dong: string;
    complex: string;
    lease_kind: 'JEONSE' | 'WOLSE';
    contract_kind: 'NEW' | 'RENEW';
    area_m2?: number;
    area_type?: number;
    contract_date: string;
    period_key: string;
    deposit_manwon?: number;
    deposit_uk?: number;
    rent_manwon?: number;
    floor?: number;
    period_text?: string;
    contract_type_label?: string;
    renew_right_used?: string;
    prev_deposit_manwon?: number;
    raw_row?: any;
    created_at?: string;
}

export interface ReportData {
    meta: {
        period_key: string;
        period_text: string;
        city: string;
        region: string;
    };
    summary: {
        total_count: number;
        new_count: number;
        renew_count: number;
        jeonse_count: number;
        wolse_count: number;
        new_jeonse_count: number;
        new_wolse_count: number;
        renew_jeonse_count: number;
        renew_wolse_count: number;
    };
    stats: {
        new: {
            jeonse_by_type: TypeStat[];
            wolse_by_type: TypeStat[];
        };
        renew: {
            jeonse_by_type: TypeStat[];
            wolse_by_type: TypeStat[];
        };
    };
    contracts: {
        new: ContractItem[];
        renew: ContractItem[];
    };
}

export interface TypeStat {
    area_type: number;
    count: number;
    avg_deposit_uk: number;
    avg_rent_manwon?: number;
}

export interface ContractItem {
    no: number;
    dong: string;
    complex: string;
    lease_kind: string;
    contract_type_label: string;
    area_type: number;
    area_m2: number; // 전용면적(㎡)
    deposit_uk: number;
    rent_manwon?: number;
    floor: number;
    contract_date: string;
    period_text?: string;
    renew_right_used?: string;
}

export interface RegionCode {
    id?: number;
    code: string;
    city: string;
    region: string;
    created_at?: string;
}

