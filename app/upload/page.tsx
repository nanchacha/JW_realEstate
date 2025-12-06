'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function UploadPage() {
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
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
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
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        전월세 리포트
                    </h1>
                    <p className="text-gray-600 text-lg">
                        국토교통부 실거래가 Excel 파일을 업로드하세요
                    </p>
                </div>

                {/* Upload Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                        📊 Excel 파일 업로드
                    </h2>

                    <div className="space-y-6">
                        {/* File Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Excel 파일 선택
                            </label>
                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all cursor-pointer"
                            />
                        </div>

                        {/* Selected File */}
                        {file && (
                            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
                                <p className="text-sm text-indigo-800">
                                    <span className="font-semibold">선택된 파일:</span> {file.name}
                                </p>
                            </div>
                        )}

                        {/* Upload Button */}
                        <button
                            onClick={handleUpload}
                            disabled={!file || uploading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
                        >
                            {uploading ? '업로드 중...' : '업로드'}
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
                <div className="text-center">
                    <Link
                        href="/report"
                        className="inline-block bg-white text-indigo-600 py-3 px-8 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border border-indigo-200"
                    >
                        📄 리포트 보기
                    </Link>
                </div>
            </div>
        </div>
    );
}
