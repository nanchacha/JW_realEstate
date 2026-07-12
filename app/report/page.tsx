'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Infographic from '../components/Infographic';

export default function ReportPage() {
    const [periodKey, setPeriodKey] = useState('');
    const [periods, setPeriods] = useState<string[]>([]);
    const [region, setRegion] = useState('전체');
    const [regions, setRegions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [postText, setPostText] = useState('');
    const [tablesHtml, setTablesHtml] = useState('');
    const [reportData, setReportData] = useState<any>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiBlogText, setAiBlogText] = useState('');

    // 사용 가능한 기간 목록 조회
    useEffect(() => {
        const fetchPeriods = async () => {
            try {
                const response = await fetch('/api/periods');
                const data = await response.json();
                if (data.periods) {
                    setPeriods(data.periods);
                    if (data.periods.length > 0) {
                        setPeriodKey(data.periods[0]);
                    }
                }
            } catch (err) {
                console.error('기간 목록 로딩 실패:', err);
            }
        };
        fetchPeriods();
    }, []);

    // 기간 변경 시 지역 목록 조회
    useEffect(() => {
        if (!periodKey) return;

        const fetchRegions = async () => {
            try {
                const response = await fetch(`/api/regions?period=${periodKey}`);
                const data = await response.json();
                if (data.regions) {
                    setRegions(['전체', ...data.regions]);
                    setRegion('전체');
                }
            } catch (err) {
                console.error('지역 목록 로딩 실패:', err);
            }
        };
        fetchRegions();
    }, [periodKey]);

    const handleGenerate = async () => {
        if (!periodKey.trim()) {
            setError('기간을 선택해주세요.');
            return;
        }

        setLoading(true);
        setError('');
        setPostText('');
        setTablesHtml('');
        setReportData(null);
        setAiBlogText('');

        try {
            const queryParams = new URLSearchParams({
                period: periodKey,
            });

            if (region !== '전체') {
                const parts = region.split(' ');
                const city = parts[0];
                const regionName = parts.slice(1).join(' ');

                queryParams.append('city', city);
                if (regionName) {
                    queryParams.append('region', regionName);
                }
            }
            const response = await fetch(`/api/report?${queryParams}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '리포트 생성 실패');
            }

            setPostText(data.postText);
            setTablesHtml(data.tablesHtml);
            setReportData(data.data);
        } catch (err: any) {
            setError(err.message || '리포트 생성 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text).then(() => {
            alert(`${type}가 클립보드에 복사되었습니다!`);
        });
    };

    const handleAIGenerate = async () => {
        if (!reportData) return;
        setAiLoading(true);
        try {
            const response = await fetch('/api/generate-blog', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    periodText: reportData.deals?.[0]?.period_text || periodKey,
                    region: region === '전체' ? '전체 지역' : region,
                    summary: reportData.summary
                })
            });
            const data = await response.json();
            if (data.success) {
                setAiBlogText(data.text);
            } else {
                alert(data.error || 'AI 글 생성 실패');
            }
        } catch (e) {
            console.error(e);
            alert('오류가 발생했습니다.');
        } finally {
            setAiLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        전월세 리포트 생성
                    </h1>
                    <p className="text-gray-600 text-lg">
                        기간을 선택하여 티스토리 블로그용 리포트를 생성하세요
                    </p>
                </div>

                {/* Input Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                        📅 옵션 선택
                    </h2>

                    <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    기간 선택
                                </label>
                                {periods.length > 0 ? (
                                    <select
                                        value={periodKey}
                                        onChange={(e) => setPeriodKey(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white text-gray-900"
                                    >
                                        {periods.map((period) => (
                                            <option key={period} value={period}>
                                                {period}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        value={periodKey}
                                        onChange={(e) => setPeriodKey(e.target.value)}
                                        placeholder="데이터가 없습니다. 먼저 업로드해주세요."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-gray-900 text-gray-900"
                                    />
                                )}
                                <p className="text-xs text-gray-500 mt-2">
                                    업로드된 데이터에 존재하는 기간만 표시됩니다.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    지역 선택 (시/구)
                                </label>
                                <select
                                    value={region}
                                    onChange={(e) => setRegion(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white text-gray-900"
                                    disabled={!periodKey || regions.length === 0}
                                >
                                    {regions.map((r) => (
                                        <option key={r} value={r}>
                                            {r}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-2">
                                    선택한 기간에 거래가 있는 지역만 표시됩니다.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={loading || !periodKey}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
                        >
                            {loading ? '생성 중...' : '리포트 생성'}
                        </button>
                    </div>

                    {error && (
                        <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
                            <p className="text-red-700 font-medium">❌ {error}</p>
                        </div>
                    )}
                </div>

                {/* Results */}
                {reportData && (
                    <>
                        {/* Summary Card */}
                        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                                📊 요약 정보
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-xl text-center border border-indigo-200">
                                    <div className="text-3xl font-bold text-indigo-600">
                                        {reportData.summary.total_count}
                                    </div>
                                    <div className="text-sm text-indigo-700 mt-1">전체</div>
                                </div>
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl text-center border border-purple-200">
                                    <div className="text-3xl font-bold text-purple-600">
                                        {reportData.summary.new_count}
                                    </div>
                                    <div className="text-sm text-purple-700 mt-1">신규</div>
                                </div>
                                <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-xl text-center border border-pink-200">
                                    <div className="text-3xl font-bold text-pink-600">
                                        {reportData.summary.renew_count}
                                    </div>
                                    <div className="text-sm text-pink-700 mt-1">갱신</div>
                                </div>
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl text-center border border-blue-200">
                                    <div className="text-3xl font-bold text-blue-600">
                                        {reportData.summary.jeonse_count}
                                    </div>
                                    <div className="text-sm text-blue-700 mt-1">전세</div>
                                </div>
                                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl text-center border border-green-200">
                                    <div className="text-3xl font-bold text-green-600">
                                        {reportData.summary.wolse_count}
                                    </div>
                                    <div className="text-sm text-green-700 mt-1">월세</div>
                                </div>
                            </div>
                        </div>

                        {/* AI Action Area */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl shadow-lg p-8 mb-8 border border-blue-100 flex flex-col items-center justify-center text-center">
                            <h2 className="text-2xl font-bold text-indigo-900 mb-2">✨ AI 블로그 & 인포그래픽 자동화</h2>
                            <p className="text-indigo-700 mb-6">요약된 데이터를 바탕으로 티스토리 블로그 글 초안과 예쁜 인포그래픽을 즉시 생성합니다.</p>
                            
                            <button
                                onClick={handleAIGenerate}
                                disabled={aiLoading}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 px-10 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl disabled:opacity-50 transition-all flex items-center gap-2"
                            >
                                {aiLoading ? 'AI가 블로그 글을 작성 중입니다...' : '📝 AI 블로그 글 초안 작성하기'}
                            </button>
                        </div>

                        {/* AI Blog Result */}
                        {aiBlogText && (
                            <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-indigo-200">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-semibold text-indigo-900 flex items-center gap-2">
                                        🤖 AI 생성 블로그 초안
                                    </h2>
                                    <button
                                        onClick={() => copyToClipboard(aiBlogText, 'AI 블로그 초안')}
                                        className="bg-indigo-100 text-indigo-700 py-2 px-6 rounded-lg font-bold shadow-sm hover:bg-indigo-200 transition-all"
                                    >
                                        📋 초안 복사하기
                                    </button>
                                </div>
                                <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 prose prose-indigo max-w-none">
                                    <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">{aiBlogText}</pre>
                                </div>
                            </div>
                        )}

                        {/* Infographic Section */}
                        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100 flex flex-col items-center">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-6 w-full text-left">
                                🎨 자동 생성 인포그래픽
                            </h2>
                            <Infographic data={reportData} region={region} periodKey={periodKey} />
                        </div>

                        {/* Post Text Card */}
                        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-semibold text-gray-800">
                                    📝 블로그 텍스트
                                </h2>
                                <button
                                    onClick={() => copyToClipboard(postText, '텍스트')}
                                    className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-2 px-6 rounded-lg font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                                >
                                    📋 복사하기
                                </button>
                            </div>
                            <pre className="bg-gray-50 p-6 rounded-xl overflow-x-auto text-sm border border-gray-200 whitespace-pre-wrap text-gray-900">
                                {postText}
                            </pre>
                        </div>

                        {/* HTML Tables Card */}
                        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-semibold text-gray-800">
                                    🎨 HTML 테이블
                                </h2>
                                <button
                                    onClick={() => copyToClipboard(tablesHtml, 'HTML')}
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-6 rounded-lg font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                                >
                                    📋 복사하기
                                </button>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-4 text-gray-900">
                                <div dangerouslySetInnerHTML={{ __html: tablesHtml }} />
                            </div>
                            <details className="cursor-pointer">
                                <summary className="text-sm text-gray-600 font-medium hover:text-gray-800 transition-colors">
                                    HTML 코드 보기
                                </summary>
                                <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-xs mt-4 border border-gray-300 text-gray-900">
                                    {tablesHtml}
                                </pre>
                            </details>
                        </div>
                    </>
                )}

                {/* Navigation */}
                <div className="text-center">
                    <Link
                        href="/"
                        className="inline-block bg-white text-indigo-600 py-3 px-8 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border border-indigo-200"
                    >
                        🏠 메인으로 돌아가기
                    </Link>
                </div>
            </div>
        </div>
    );
}
