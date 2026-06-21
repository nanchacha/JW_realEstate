'use client';

import React, { useRef } from 'react';
import html2canvas from 'html2canvas';

interface InfographicProps {
    data: any;
    region: string;
    periodKey: string;
}

export default function Infographic({ data, region, periodKey }: InfographicProps) {
    const printRef = useRef<HTMLDivElement>(null);

    if (!data || !data.summary) return null;

    const summary = data.summary;
    const total = summary.total_count;
    
    // 비율 계산
    const jeonsePercent = total > 0 ? Math.round((summary.jeonse_count / total) * 100) : 0;
    const wolsePercent = total > 0 ? Math.round((summary.wolse_count / total) * 100) : 0;
    const newPercent = total > 0 ? Math.round((summary.new_count / total) * 100) : 0;
    const renewPercent = total > 0 ? Math.round((summary.renew_count / total) * 100) : 0;

    const handleDownloadImage = async () => {
        const element = printRef.current;
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                scale: 2, // 고해상도
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `부동산_인포그래픽_${region}_${periodKey}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('이미지 저장 오류:', err);
            alert('이미지를 생성하는 데 실패했습니다.');
        }
    };

    return (
        <div className="flex flex-col items-center">
            {/* 인포그래픽 영역 (캡처 대상) */}
            <div 
                ref={printRef}
                className="w-full max-w-2xl bg-white p-10 rounded-3xl overflow-hidden relative shadow-sm"
                style={{ fontFamily: "'Pretendard', 'Malgun Gothic', sans-serif" }}
            >
                {/* 배경 꾸미기 */}
                <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-50 rounded-full opacity-50 blur-3xl"></div>
                
                <div className="relative z-10">
                    <div className="text-center mb-10">
                        <p className="text-indigo-600 font-bold text-lg mb-2">실거래가 데이터 기반</p>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
                            {region === '전체' ? '전체 지역' : region} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">전월세 리포트</span>
                        </h1>
                        <p className="text-gray-500 text-xl font-medium">{data.deals?.[0]?.period_text || periodKey}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                        {/* 총 거래량 카드 */}
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col items-center justify-center">
                            <p className="text-gray-500 font-medium mb-2">주간 총 거래량</p>
                            <p className="text-5xl font-black text-gray-800">{total}<span className="text-2xl text-gray-500 ml-1">건</span></p>
                        </div>
                        
                        {/* 신규 vs 갱신 */}
                        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 flex flex-col justify-center">
                            <p className="text-blue-800 font-bold mb-4 text-center">신규 및 갱신 비율</p>
                            <div className="w-full flex h-8 rounded-full overflow-hidden mb-2 shadow-inner">
                                <div style={{ width: `${newPercent}%` }} className="bg-blue-500 flex items-center justify-center text-white text-xs font-bold">{newPercent}%</div>
                                <div style={{ width: `${renewPercent}%` }} className="bg-blue-300 flex items-center justify-center text-blue-900 text-xs font-bold">{renewPercent}%</div>
                            </div>
                            <div className="flex justify-between text-sm px-1">
                                <span className="text-blue-600 font-medium">신규 ({summary.new_count}건)</span>
                                <span className="text-blue-500 font-medium">갱신 ({summary.renew_count}건)</span>
                            </div>
                        </div>
                    </div>

                    {/* 전월세 비율 바 */}
                    <div className="bg-purple-50 rounded-2xl p-8 border border-purple-100 mb-8">
                        <h3 className="text-center text-purple-900 font-bold text-xl mb-6">전세 vs 월세 거래 비중</h3>
                        
                        <div className="relative h-16 bg-white rounded-full overflow-hidden shadow-md border border-purple-200 flex">
                            <div 
                                style={{ width: `${jeonsePercent}%` }} 
                                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full flex flex-col items-center justify-center text-white transition-all"
                            >
                                <span className="font-bold text-lg">전세</span>
                                <span className="text-sm opacity-90">{jeonsePercent}%</span>
                            </div>
                            <div 
                                style={{ width: `${wolsePercent}%` }} 
                                className="bg-gradient-to-r from-pink-400 to-orange-400 h-full flex flex-col items-center justify-center text-white transition-all"
                            >
                                <span className="font-bold text-lg">월세</span>
                                <span className="text-sm opacity-90">{wolsePercent}%</span>
                            </div>
                        </div>
                        
                        <div className="flex justify-between mt-4 px-4">
                            <div className="text-center">
                                <p className="text-2xl font-black text-purple-700">{summary.jeonse_count}건</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-black text-pink-600">{summary.wolse_count}건</p>
                            </div>
                        </div>
                    </div>

                    {/* 푸터 */}
                    <div className="text-center mt-10 pt-6 border-t border-gray-100 flex justify-between items-center px-4">
                        <p className="text-xs text-gray-400 font-medium">Data source: 국토교통부 실거래가 공개시스템</p>
                        <p className="text-sm font-bold text-indigo-300">Auto Blog Report</p>
                    </div>
                </div>
            </div>

            {/* 다운로드 버튼 */}
            <button
                onClick={handleDownloadImage}
                className="mt-6 bg-white border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50 font-bold py-3 px-8 rounded-xl shadow-sm transition-colors flex items-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                인포그래픽 이미지로 저장하기
            </button>
        </div>
    );
}
