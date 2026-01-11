'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface RegionCode {
    code: string;
    city: string;
    region: string;
}

export default function FetchDataPage() {
    const [lawdCd, setLawdCd] = useState('');
    const [dealYmd, setDealYmd] = useState('202512');
    const [regionCodes, setRegionCodes] = useState<RegionCode[]>([]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');
    const [loadError, setLoadError] = useState('');

    // 법정동코드 목록 로드
    useEffect(() => {
        const fetchRegionCodes = async () => {
            try {
                const response = await fetch('/api/region-codes');
                if (!response.ok) {
                    throw new Error('서버 오류');
                }
                const data = await response.json();
                if (data.codes) {
                    setRegionCodes(data.codes);
                    if (data.codes.length > 0) {
                        setLawdCd(data.codes[0].code);
                    }
                }
            } catch (err) {
                console.error('법정동코드 로딩 실패:', err);
                setLoadError('지역 목록 로딩 실패 (DB 확인 필요)');
            }
        };
        fetchRegionCodes();
    }, []);

    const handleFetch = async () => {
        if (!lawdCd || !dealYmd) {
            setError('법정동코드와 계약년월을 입력해주세요.');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await fetch('/api/fetch-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lawdCd, dealYmd }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '데이터 수집 실패');
            }

            setResult(data);
        } catch (err: any) {
            setError(err.message || '데이터 수집 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        🔄 자동 데이터 수집
                    </h1>
                    <p className="text-gray-900 text-lg">
                        국토교통부 API에서 전월세 데이터를 자동으로 가져옵니다
                    </p>
                </div>

                {/* Fetch Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                        📡 데이터 수집 설정
                    </h2>

                    <div className="space-y-6">
                        {/* 법정동코드 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                지역 선택
                            </label>
                            {regionCodes.length > 0 ? (
                                <select
                                    value={lawdCd}
                                    onChange={(e) => setLawdCd(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white text-gray-900"
                                >
                                    {regionCodes.map((rc) => (
                                        <option key={rc.code} value={rc.code}>
                                            {rc.city} {rc.region} ({rc.code})
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={loadError || lawdCd}
                                    onChange={(e) => setLawdCd(e.target.value)}
                                    placeholder={loadError ? "지역 로딩 실패" : "법정동코드 로딩 중..."}
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-gray-900 ${loadError ? 'border-red-300 bg-red-50 text-red-900' : 'border-gray-300'
                                        }`}
                                    disabled
                                />
                            )}
                            <p className="text-xs text-gray-900 mt-2">
                                지역을 선택하세요
                            </p>
                        </div>

                        {/* 계약년월 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                계약년월 (YYYYMM)
                            </label>
                            <input
                                type="text"
                                value={dealYmd}
                                onChange={(e) => setDealYmd(e.target.value)}
                                placeholder="202512"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-900"
                            />
                            <p className="text-xs text-gray-900 mt-2">
                                예: 2025년 12월 = 202512
                            </p>
                        </div>

                        {/* Fetch Button */}
                        <button
                            onClick={handleFetch}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
                        >
                            {loading ? '수집 중...' : '데이터 수집 시작'}
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
                            <p className="text-red-700 font-medium">❌ {error}</p>
                        </div>
                    )}

                    {/* Success Message */}
                    {result && (
                        <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
                            <p className="text-green-700 font-medium">
                                ✅ {result.message}
                            </p>
                            <p className="text-green-600 text-sm mt-2">
                                총 {result.count}건의 거래가 저장되었습니다.
                            </p>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex gap-4 justify-center">
                    <Link
                        href="/upload"
                        className="inline-block bg-white text-indigo-600 py-3 px-8 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border border-indigo-200"
                    >
                        📤 Excel 업로드
                    </Link>
                    <Link
                        href="/report"
                        className="inline-block bg-white text-purple-600 py-3 px-8 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border border-purple-200"
                    >
                        📄 리포트 보기
                    </Link>
                </div>
            </div>
        </div>
    );
}
