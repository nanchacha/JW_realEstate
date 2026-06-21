'use client';

import { useState } from 'react';

const REGIONS = [
    { code: '11680', name: '서울시 강남구' },
    { code: '11710', name: '서울시 송파구' },
    { code: '11740', name: '서울시 강동구' },
    { code: '11200', name: '서울시 성동구' },
    { code: '11380', name: '서울시 은평구' },
    { code: '41450', name: '경기도 하남시' },
    { code: '41360', name: '경기도 남양주시' },
    { code: '41310', name: '경기도 구리시' },
];

export default function AutoFetchButton() {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('');

    const handleAutoFetch = async () => {
        setLoading(true);
        setProgress(0);
        
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const dealYmd = `${year}${month}`;
        
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < REGIONS.length; i++) {
            const region = REGIONS[i];
            setStatusText(`${region.name} 수집 중... (${i + 1}/${REGIONS.length})`);
            
            try {
                const response = await fetch('/api/fetch-data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lawdCd: region.code, dealYmd }),
                });
                
                const data = await response.json();
                if (!response.ok) {
                    console.error(`${region.name} 오류:`, data.error);
                    failCount++;
                } else {
                    successCount++;
                }
            } catch (err) {
                console.error(`${region.name} 수집 중 오류:`, err);
                failCount++;
            }
            setProgress(((i + 1) / REGIONS.length) * 100);
        }
        
        setStatusText(`완료! (성공: ${successCount}지역, 실패: ${failCount}지역)`);
        setTimeout(() => {
            setLoading(false);
            setTimeout(() => {
                setStatusText('');
                setProgress(0);
            }, 3000);
        }, 1000);
    };

    return (
        <div className="mt-12 mb-8 flex flex-col items-center justify-center">
            <button
                onClick={handleAutoFetch}
                disabled={loading}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-white font-bold py-5 px-12 rounded-full shadow-[0_0_20px_rgba(250,204,21,0.4)] transform hover:scale-105 transition-all duration-300 text-2xl disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none border-2 border-yellow-200"
            >
                {loading ? '데이터 수집 진행 중...' : '🔥 이번 주 데이터 자동수집'}
            </button>
            
            {loading && (
                <div className="w-full max-w-lg mt-8 bg-white/10 p-6 rounded-2xl border border-white/20 backdrop-blur-md">
                    <div className="flex justify-between text-yellow-300 text-base mb-3 font-semibold">
                        <span>{statusText}</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-black/30 rounded-full h-4 overflow-hidden">
                        <div 
                            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-4 rounded-full transition-all duration-500 ease-out" 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            )}
            
            {!loading && statusText && (
                <div className="mt-6 text-xl text-yellow-300 font-bold animate-fade-in drop-shadow-md">
                    ✅ {statusText}
                </div>
            )}
        </div>
    );
}
