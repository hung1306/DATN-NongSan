const Loading = () => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-white/60 to-gray-100/40 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-4 p-6 rounded-xl shadow-xl bg-white/95 border border-gray-100">
        <svg
          className="w-20 h-20"
          viewBox="0 0 50 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ animation: "spin 1.6s linear infinite" }}
        >
          <defs>
            <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
          <circle
            cx="25"
            cy="25"
            r="20"
            stroke="url(#g)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="31.4 62.8"
          />
        </svg>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Đang tải...</span>

          <div className="flex items-end gap-2">
            <span
              className="w-2.5 h-2.5 bg-primary rounded-full inline-block"
              style={{ animation: "bounce .9s ease-in-out infinite", animationDelay: "0s" }}
            />
            <span
              className="w-2.5 h-2.5 bg-primary rounded-full inline-block"
              style={{ animation: "bounce .9s ease-in-out infinite", animationDelay: ".12s" }}
            />
            <span
              className="w-2.5 h-2.5 bg-primary rounded-full inline-block"
              style={{ animation: "bounce .9s ease-in-out infinite", animationDelay: ".24s" }}
            />
          </div>
        </div>

        <span className="text-xs text-gray-400">Vui lòng chờ trong giây lát...</span>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: .35; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Loading;