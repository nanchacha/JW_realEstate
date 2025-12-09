'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RegionUploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string>('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError('');
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('파일을 선택해주세요.');
            return;
        }

        setUploading(true);
        setError('');
        setResult(null);

        try {
            // 파일 내용을 텍스트로 읽기
            const text = await file.text();

            const response = await fetch('/api/region-codes/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '업로드 실패');
            }

            setResult(data);
        } catch (err: any) {
            setError(err.message || '업로드 중 오류가 발생했습니다.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">
                        📤 법정동 코드 일괄 업로드
                    </h1>
                    <Link
                        href="/settings/regions"
                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                        ← 목록으로 돌아가기
                    </Link>
                </div>

                {/* Upload Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">
                        TXT 파일 업로드
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                파일 선택 (.txt)
                            </label>
                            <input
                                type="file"
                                accept=".txt"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all cursor-pointer"
                            />
                        </div>

                        {file && (
                            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
                                <p className="text-sm text-indigo-800">
                                    <span className="font-semibold">선택된 파일:</span> {file.name}
                                </p>
                            </div>
                        )}

                        <button
                            onClick={handleUpload}
                            disabled={!file || uploading}
                            className="w-full bg-indigo-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {uploading ? '업로드 중...' : '업로드 시작'}
                        </button>
                    </div>

                    {error && (
                        <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
                            <p className="text-red-700 font-medium">❌ {error}</p>
                        </div>
                    )}

                    {result && (
                        <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
                            <p className="text-green-700 font-medium">
                                ✅ {result.message}
                            </p>
                            <p className="text-green-600 text-sm mt-2">
                                총 {result.count}건의 코드가 저장되었습니다.
                            </p>
                        </div>
                    )}
                </div>

                {/* Guide */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        ℹ️ 파일 형식 가이드
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        업로드할 TXT 파일의 구조를 알려주시면 파싱 로직을 업데이트하겠습니다.
                        <br />
                        현재는 파일 내용을 서버로 전송하는 기능만 구현되어 있습니다.
                    </p>
                </div>
            </div>
        </div>
    );
}
