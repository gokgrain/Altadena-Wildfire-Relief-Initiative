import { Settings as SettingsIcon } from 'lucide-react'

export default function Settings() {
  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0a0f]">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center">
              <SettingsIcon size={20} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">설정</h2>
          </div>
          <p className="text-sm text-gray-500">Firebase 연동 및 앱 설정</p>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Firebase 설정</h3>
          <div className="space-y-3">
            <div className="px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <p className="text-xs font-medium text-amber-400 mb-1">⚠️ Firebase 연동 필요</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                <code className="text-gray-400 bg-white/5 px-1 py-0.5 rounded">src/firebase.js</code> 파일에서
                Firebase 프로젝트 설정값을 입력해주세요.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
              <p>1. <a className="text-violet-400">console.firebase.google.com</a> 에서 프로젝트 생성</p>
              <p>2. 프로젝트 설정 → 내 앱 → 웹 앱 추가</p>
              <p>3. SDK 설정 값을 <code className="text-gray-400">firebase.js</code>에 붙여넣기</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
