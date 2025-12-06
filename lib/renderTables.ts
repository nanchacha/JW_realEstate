import { ReportData, ContractItem } from './types';

export function renderTables(data: ReportData): string {
    const { contracts } = data;

    function buildTable(title: string, items: ContractItem[]): string {
        if (items.length === 0) return '';

        let html = `<h3>${title}</h3>\n`;
        html += `<table border="1" cellpadding="4" cellspacing="0" style="border-collapse: collapse; width: 100%;">\n`;
        html += `  <thead>\n`;
        html += `    <tr style="background-color: #f0f0f0;">\n`;
        html += `      <th>NO</th>\n`;
        html += `      <th>동</th>\n`;
        html += `      <th>단지명</th>\n`;
        html += `      <th>전월세구분</th>\n`;
        html += `      <th>전용면적</th>\n`;
        html += `      <th>보증금(억)</th>\n`;
        html += `      <th>월세(만원)</th>\n`;
        html += `      <th>층</th>\n`;
        html += `      <th>계약일</th>\n`;
        html += `    </tr>\n`;
        html += `  </thead>\n`;
        html += `  <tbody>\n`;

        items.forEach((item) => {
            html += `    <tr>\n`;
            html += `      <td style="text-align: center;">${item.no}</td>\n`;
            html += `      <td>${item.dong}</td>\n`;
            html += `      <td>${item.complex}</td>\n`;
            html += `      <td style="text-align: center;">${item.lease_kind}</td>\n`;
            html += `      <td style="text-align: center;">${Math.floor(item.area_m2)}㎡</td>\n`;
            html += `      <td style="text-align: right;">${item.deposit_uk}</td>\n`;
            html += `      <td style="text-align: right;">${item.rent_manwon || '-'}</td>\n`;
            html += `      <td style="text-align: center;">${item.floor}</td>\n`;
            html += `      <td style="text-align: center;">${item.contract_date}</td>\n`;
            html += `    </tr>\n`;
        });

        html += `  </tbody>\n`;
        html += `</table>\n\n`;

        return html;
    }

    let html = '';

    if (contracts.new.length > 0) {
        html += buildTable('신규 계약', contracts.new);
    }

    if (contracts.renew.length > 0) {
        html += buildTable('갱신 계약', contracts.renew);
    }

    return html;
}
