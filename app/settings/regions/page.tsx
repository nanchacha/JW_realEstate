'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface RegionCode {
    code: string;
    city: string;
    region: string;
}

export default function RegionSettingsPage() {
    const [regionCodes, setRegionCodes] = useState<RegionCode[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // 입력 폼 상태
    const [newCode, setNewCode] = useState('');
    const [newCity, setNewCity] = useState('');
    const [newRegion, setNewRegion] = useState('');

    // 목록 조회
    const fetchRegionCodes = async () => {
        try {
            const response = await fetch('/api/region-codes');
            const data = await response.json();
            if (data.codes) {
                setRegionCodes(data.codes);
            }
        } catch (err) {
            console.error('법정동코드 로딩 실패:', err);
            setError('목록을 불러오는데 실패했습니다.');
        }
    };

    useEffect(() => {
        fetchRegionCodes();
    }, []);

    // 추가 핸들러
    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCode || !newCity || !newRegion) {
            alert('모든 항목을 입력해주세요.');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/region-codes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: newCode,
                    city: newCity,
                    region: newRegion,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || '추가 실패');
            }

            // 초기화 및 목록 갱신
            setNewCode('');
            setNewCity('');
            setNewRegion('');
            fetchRegionCodes();
            alert('추가되었습니다.');
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 삭제 핸들러
    const handleDelete = async (code: string) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;

        try {
            const response = await fetch(`/api/region-codes?code=${code}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || '삭제 실패');
            }

            fetchRegionCodes();
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">
                        ⚙️ 법정동 코드 관리
                    </h1>
                    <div className="flex gap-4">
                        <Link
                            href="/settings/regions/upload"
                            className="text-indigo-600 hover:text-indigo-800 font-medium bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
                        >
                            📤 일괄 업로드
                        </Link>
                        <Link
                            href="/"
                            className="text-gray-600 hover:text-gray-800 font-medium px-4 py-2"
                        >
                            ← 메인으로
                        </Link>
                    </div>
                </div>

                {/* 추가 폼 */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        새 지역 추가
                    </h2>
                    <form onSubmit={handleAdd} className="grid md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                법정동코드 (5자리)
                            </label>
                            <input
                                type="text"
                                value={newCode}
                                onChange={(e) => setNewCode(e.target.value)}
                                placeholder="예: 41450"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                maxLength={5}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                시/도
                            </label>
                            <input
                                type="text"
                                value={newCity}
                                onChange={(e) => setNewCity(e.target.value)}
                                placeholder="예: 경기도"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                시/군/구
                            </label>
                            <input
                                type="text"
                                value={newRegion}
                                onChange={(e) => setNewRegion(e.target.value)}
                                placeholder="예: 하남시"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                            >
                                {loading ? '추가 중...' : '추가하기'}
                            </button>
                        </div>
                    </form>
                    <p className="text-xs text-gray-500 mt-2">
                        * 법정동코드는 국토교통부 실거래가 API에서 사용하는 5자리 지역코드입니다. (예: 서울 종로구 11110, 경기 하남시 41450)
                    </p>
                </div>

                {/* 목록 */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800">
                            등록된 지역 목록 ({regionCodes.length})
                        </h2>
                    </div>

                    {regionCodes.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">코드</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">시/도</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">시/군/구</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">관리</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {regionCodes.map((rc) => (
                                        <tr key={rc.code} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {rc.code}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {rc.city}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {rc.region}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleDelete(rc.code)}
                                                    className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-full hover:bg-red-100 transition-colors"
                                                >
                                                    삭제
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 text-center text-gray-500">
                            등록된 지역 코드가 없습니다. 위에서 추가해주세요.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
