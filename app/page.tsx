import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-8">
      <div className="max-w-5xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
            전월세
            <br />
            <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
              자동 리포트 생성
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-purple-200 max-w-2xl mx-auto leading-relaxed">
            국토교통부 실거래가 데이터를 <strong>자동 분석</strong>하여
            <br />
            티스토리 블로그용 리포트를 즉시 생성하세요
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Auto Fetch Card */}
          <Link
            href="/fetch"
            className="group bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer"
          >
            <div className="text-6xl mb-4">🔄</div>
            <h2 className="text-3xl font-bold text-white mb-4 group-hover:text-yellow-300 transition-colors">
              자동 수집
            </h2>
            <p className="text-purple-200 text-lg leading-relaxed">
              국토교통부 API에서 자동으로 전월세 데이터를 수집합니다.
            </p>
            <div className="mt-6 text-yellow-300 font-semibold flex items-center group-hover:translate-x-2 transition-transform">
              수집하기 →
            </div>
          </Link>

          {/* Upload Card */}
          <Link
            href="/upload"
            className="group bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer"
          >
            <div className="text-6xl mb-4">📤</div>
            <h2 className="text-3xl font-bold text-white mb-4 group-hover:text-yellow-300 transition-colors">
              Excel 업로드
            </h2>
            <p className="text-purple-200 text-lg leading-relaxed">
              국토교통부에서 다운로드한 실거래가 Excel 파일을 업로드하세요.
              자동으로 파싱하여 데이터베이스에 저장합니다.
            </p>
            <div className="mt-6 text-yellow-300 font-semibold flex items-center group-hover:translate-x-2 transition-transform">
              시작하기 →
            </div>
          </Link>

          {/* Report Card */}
          <Link
            href="/report"
            className="group bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer"
          >
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-3xl font-bold text-white mb-4 group-hover:text-yellow-300 transition-colors">
              리포트 생성
            </h2>
            <p className="text-purple-200 text-lg leading-relaxed">
              주차별로 리포트를 생성하고, 티스토리 블로그에 바로 복사할 수
              있는 텍스트와 HTML 테이블을 받으세요.
            </p>
            <div className="mt-6 text-yellow-300 font-semibold flex items-center group-hover:translate-x-2 transition-transform">
              생성하기 →
            </div>
          </Link>
        </div>

        {/* Features List */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">
            ✨ 주요 기능
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="text-4xl mb-3">🚀</div>
              <h4 className="text-lg font-semibold text-white mb-2">
                자동 파싱
              </h4>
              <p className="text-purple-200 text-sm">
                Excel 데이터를 자동으로 분석하고 정리합니다
              </p>
            </div>
            <div className="text-center p-4">
              <div className="text-4xl mb-3">📈</div>
              <h4 className="text-lg font-semibold text-white mb-2">
                통계 생성
              </h4>
              <p className="text-purple-200 text-sm">
                평형별 평균 가격 등 유용한 통계를 자동 계산
              </p>
            </div>
            <div className="text-center p-4">
              <div className="text-4xl mb-3">📋</div>
              <h4 className="text-lg font-semibold text-white mb-2">
                원클릭 복사
              </h4>
              <p className="text-purple-200 text-sm">
                생성된 리포트를 클릭 한 번으로 복사
              </p>
            </div>
          </div>
        </div>

        {/* Tech Stack & Settings */}
        <div className="mt-12 text-center space-y-4">
          <div>
            <Link
              href="/settings/regions"
              className="text-gray-400 hover:text-white underline decoration-gray-600 hover:decoration-white transition-all text-sm"
            >
              ⚙️ 법정동 코드 관리
            </Link>
          </div>
          <p className="text-purple-300 text-sm">
            Powered by{' '}
            <span className="font-semibold text-white">
              Next.js + Supabase + Vercel
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
