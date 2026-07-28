'use client';

import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { toPng, toBlob } from 'html-to-image';
import { Home, Building2, Landmark, CheckCircle2, TrendingUp, Info } from 'lucide-react';

export interface InfographicAiData {
    subTitle?: string;
    mainTitle?: string;
    highlightTitle?: string;
    metric1_label?: string;
    metric1_value?: string;
    metric2_label?: string;
    metric2_value?: string;
}

export interface InfographicProps {
    data: any;
    region: string;
    periodKey: string;
    aiData?: InfographicAiData | null;
}

export interface InfographicRef {
    getBase64: () => Promise<string | null>;
}

const Infographic = forwardRef<InfographicRef, InfographicProps>(({ data, region, periodKey, aiData }, ref) => {
    const printRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
        getBase64: async () => {
            const element = printRef.current;
            if (!element) return null;
            try {
                return await toPng(element, { pixelRatio: 2, backgroundColor: '#f8fafc' });
            } catch (err) {
                console.error('Base64 생성 오류:', err);
                return null;
            }
        }
    }));

    if (!data || !data.summary) return null;

    const summary = data.summary;
    const total = summary.total_count;
    
    // 비율 계산
    const jeonsePercent = total > 0 ? Math.round((summary.jeonse_count / total) * 100) : 0;
    const wolsePercent = total > 0 ? Math.round((summary.wolse_count / total) * 100) : 0;

    const handleDownloadImage = async () => {
        const element = printRef.current;
        if (!element) return;
        try {
            const dataUrl = await toPng(element, { pixelRatio: 2, backgroundColor: '#f8fafc' });
            const link = document.createElement('a');
            link.download = `부동산_인포그래픽_${region}_${periodKey}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('이미지 저장 오류:', err);
            alert('이미지를 생성하는 데 실패했습니다.');
        }
    };

    const handleCopyImage = async () => {
        const element = printRef.current;
        if (!element) return;
        try {
            const blob = await toBlob(element, { pixelRatio: 2, backgroundColor: '#f8fafc' });
            if (!blob) throw new Error("Blob 생성 실패");
            const item = new ClipboardItem({ 'image/png': blob });
            await navigator.clipboard.write([item]);
            alert('이미지가 클립보드에 복사되었습니다! 티스토리 에디터에 붙여넣기(Ctrl+V) 하세요.');
        } catch (err) {
            console.error('클립보드 복사 오류:', err);
            alert('클립보드 복사를 지원하지 않는 브라우저이거나 오류가 발생했습니다. 직접 다운로드 후 첨부해주세요.');
        }
    };

    // 평형별 데이터 가공
    const newDealsJeonse = data.stats.new?.jeonse_by_type || [];
    const newDealsWolse = data.stats.new?.wolse_by_type || [];
    const areaMap = new Map();
    
    newDealsJeonse.forEach((d: any) => {
        areaMap.set(d.area_type, { area: d.area_type, jeonseCount: d.count, jeonseAvg: d.avg_deposit_uk, wolseCount: 0, wolseAvgDeposit: 0, wolseAvgRent: 0, total: d.count });
    });
    newDealsWolse.forEach((d: any) => {
        if (areaMap.has(d.area_type)) {
            const item = areaMap.get(d.area_type);
            item.wolseCount = d.count;
            item.wolseAvgDeposit = d.avg_deposit_uk;
            item.wolseAvgRent = d.avg_rent_manwon;
            item.total += d.count;
        } else {
            areaMap.set(d.area_type, { area: d.area_type, jeonseCount: 0, jeonseAvg: 0, wolseCount: d.count, wolseAvgDeposit: d.avg_deposit_uk, wolseAvgRent: d.avg_rent_manwon, total: d.count });
        }
    });

    const top3Areas = Array.from(areaMap.values()).sort((a, b) => b.total - a.total).slice(0, 3);
    const icons = [Home, Building2, Landmark];

    return (
        <div className="flex flex-col items-center w-full">
            <div 
                ref={printRef} 
                className="bg-slate-50 p-12 font-sans text-gray-900 w-[1100px] shadow-sm relative overflow-hidden"
                style={{ minHeight: '620px' }}
            >
                {/* 상단 타이틀 */}
                <div className="mb-10">
                    <h1 className="text-4xl font-extrabold text-slate-800 mb-3 tracking-tight">
                        <span className="text-blue-700">{periodKey.split('-W')[0]}년 {periodKey.split('-W')[1]}주차</span> {region} 아파트 전·월세 실거래 리포트
                    </h1>
                    <p className="text-xl text-slate-600 font-medium">
                        {aiData?.mainTitle || `${periodKey.split('-')[0]}년 ${periodKey.split('-')[1]}월 ${periodKey.split('-W')[1]}주차 ${region} 아파트 거래 현황 : 총 ${total}건 전세 비중 높음, 갱신 계약 활발`}
                    </p>
                </div>

                {/* 메인 2단 레이아웃 */}
                <div className="flex gap-10">
                    
                    {/* 좌측: 거래 현황 및 계약 유형 */}
                    <div className="w-[45%] flex flex-col gap-8">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-6">거래 현황 및 계약 유형</h2>
                            <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 relative">
                                <h3 className="text-center text-xl font-bold mb-4">총 {total}건의 전·월세 거래 발생</h3>
                                
                                <div className="flex justify-center items-center h-48 relative">
                                    {/* 반원(도넛) 차트 CSS 트릭 */}
                                    <div 
                                        className="w-48 h-48 rounded-full flex items-center justify-center relative overflow-hidden"
                                        style={{
                                            background: `conic-gradient(#2563eb 0% ${jeonsePercent}%, #f97316 ${jeonsePercent}% 100%)`
                                        }}
                                    >
                                        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center z-10 shadow-inner">
                                            <Home className="w-16 h-16 text-slate-300" strokeWidth={1.5} />
                                        </div>
                                    </div>
                                    
                                    {/* 라벨 좌우 배치 */}
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 text-center">
                                        <div className="text-slate-500 font-semibold mb-1">전세</div>
                                        <div className="text-2xl font-bold text-blue-600">{summary.jeonse_count}건</div>
                                        <div className="text-sm text-slate-400">({jeonsePercent}%)</div>
                                    </div>
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 text-center">
                                        <div className="text-slate-500 font-semibold mb-1">월세</div>
                                        <div className="text-2xl font-bold text-orange-500">{summary.wolse_count}건</div>
                                        <div className="text-sm text-slate-400">({wolsePercent}%)</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-6">갱신 계약 vs 신규 계약</h2>
                            <div className="flex gap-6">
                                {/* 세로 막대 (총 갱신 vs 신규) */}
                                <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 flex flex-col justify-end h-64 w-[40%] relative">
                                    <div className="flex justify-around items-end h-32 mb-4 gap-4">
                                        <div className="flex flex-col items-center gap-2 w-1/2">
                                            <div className="text-sm font-bold text-blue-800">갱신 계약</div>
                                            <div className="text-lg font-black text-blue-600">{summary.renew_count}건</div>
                                            <div className="w-full bg-blue-500 rounded-t-lg transition-all" style={{ height: `${(summary.renew_count / Math.max(summary.new_count, summary.renew_count)) * 100}px` }}></div>
                                        </div>
                                        <div className="flex flex-col items-center gap-2 w-1/2">
                                            <div className="text-sm font-bold text-emerald-800">신규 계약</div>
                                            <div className="text-lg font-black text-emerald-500">{summary.new_count}건</div>
                                            <div className="w-full bg-emerald-400 rounded-t-lg transition-all" style={{ height: `${(summary.new_count / Math.max(summary.new_count, summary.renew_count)) * 100}px` }}></div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-center text-slate-500 font-medium">기존 계약을 연장하는<br/>갱신 계약이 더 높은 비중</p>
                                </div>
                                
                                {/* 가로 스택 바 (세부 전/월세) */}
                                <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 flex flex-col justify-center h-64 w-[60%] gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-16 text-center text-sm font-bold text-emerald-600">신규<br/>계약</div>
                                        <div className="flex-1 flex flex-col gap-1">
                                            <div className="w-full h-8 flex rounded-md overflow-hidden text-xs font-bold text-white text-center leading-8">
                                                <div className="bg-blue-500" style={{ width: `${summary.new_count ? (summary.new_jeonse_count / summary.new_count) * 100 : 0}%` }}>
                                                    {summary.new_jeonse_count > 0 ? `전세 ${summary.new_jeonse_count}건` : ''}
                                                </div>
                                                <div className="bg-orange-400" style={{ width: `${summary.new_count ? (summary.new_wolse_count / summary.new_count) * 100 : 0}%` }}>
                                                    {summary.new_wolse_count > 0 ? `월세 ${summary.new_wolse_count}건` : ''}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-16 text-center text-sm font-bold text-blue-600">갱신<br/>계약</div>
                                        <div className="flex-1 flex flex-col gap-1">
                                            <div className="w-full h-8 flex rounded-md overflow-hidden text-xs font-bold text-white text-center leading-8">
                                                <div className="bg-blue-600" style={{ width: `${summary.renew_count ? (summary.renew_jeonse_count / summary.renew_count) * 100 : 0}%` }}>
                                                    {summary.renew_jeonse_count > 0 ? `전세 ${summary.renew_jeonse_count}건` : ''}
                                                </div>
                                                <div className="bg-orange-500" style={{ width: `${summary.renew_count ? (summary.renew_wolse_count / summary.renew_count) * 100 : 0}%` }}>
                                                    {summary.renew_wolse_count > 0 ? `월세 ${summary.renew_wolse_count}건` : ''}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 우측: 주요 평형별 신규 계약 평균가 */}
                    <div className="w-[55%] flex flex-col">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">주요 평형별 신규 계약 평균가</h2>
                        <div className="flex flex-col gap-5">
                            {top3Areas.length > 0 ? top3Areas.map((item, idx) => {
                                const IconComp = icons[idx % icons.length];
                                return (
                                    <div key={idx} className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 flex items-center justify-between relative overflow-hidden">
                                        <div className="flex flex-col z-10 w-3/4">
                                            <div className="bg-slate-800 text-white text-sm font-bold px-4 py-1 rounded-full w-max mb-3">
                                                {item.area}㎡ 평형
                                            </div>
                                            
                                            {item.jeonseAvg > 0 && item.wolseAvgDeposit > 0 ? (
                                                <div className="text-3xl font-extrabold tracking-tight mb-2">
                                                    <span className="text-blue-600">전세 {item.jeonseAvg}억</span> <span className="text-slate-300 mx-2">/</span> <span className="text-orange-500">월세 {item.wolseAvgDeposit}억</span><span className="text-xl text-orange-400">({item.wolseAvgRent}만)</span>
                                                </div>
                                            ) : item.jeonseAvg > 0 ? (
                                                <div className="text-3xl font-extrabold tracking-tight mb-2">
                                                    <span className="text-blue-600">신규 전세 평균 {item.jeonseAvg}억</span>
                                                </div>
                                            ) : (
                                                <div className="text-3xl font-extrabold tracking-tight mb-2">
                                                    <span className="text-orange-500">신규 월세 평균 {item.wolseAvgDeposit}억</span><span className="text-xl text-orange-400">({item.wolseAvgRent}만)</span>
                                                </div>
                                            )}
                                            
                                            <p className="text-slate-500 text-sm font-medium">
                                                {idx === 0 ? `${region} 내 가장 인기있는 평형의 신규 진입 평균 가격대` : 
                                                 idx === 1 ? '국민 평형으로 불리는 중형 아파트 신규 계약 평균 시세' : 
                                                 '대형 평형일수록 전세보증금 규모가 크게 상승하는 경향'}
                                            </p>
                                        </div>
                                        <div className="w-1/4 flex justify-center items-center z-10 text-indigo-100/50">
                                            <div className="w-24 h-24 bg-indigo-50 rounded-2xl flex items-center justify-center transform rotate-3 shadow-inner">
                                                <IconComp className="w-12 h-12 text-indigo-400" strokeWidth={1.5} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="bg-white rounded-3xl p-10 text-center text-slate-500 shadow-md border border-slate-100">
                                    신규 계약 데이터가 부족합니다.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 워터마크 */}
                <div className="absolute bottom-6 right-8 flex items-center gap-1 text-slate-400 text-sm font-bold opacity-70">
                    <TrendingUp className="w-4 h-4" />
                    Auto Blog Analytics
                </div>
            </div>

            {/* 버튼 영역 */}
            <div className="flex gap-4 mt-6">
                <button
                    onClick={handleCopyImage}
                    className="bg-indigo-600 border-2 border-indigo-600 text-white hover:bg-indigo-700 hover:border-indigo-700 font-bold py-3 px-8 rounded-xl shadow-md transition-colors flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    클립보드에 이미지 복사하기
                </button>
                <button
                    onClick={handleDownloadImage}
                    className="bg-white border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50 font-bold py-3 px-8 rounded-xl shadow-sm transition-colors flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    이미지 다운로드
                </button>
            </div>
        </div>
    );
});

export default Infographic;
