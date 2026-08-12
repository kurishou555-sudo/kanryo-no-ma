const DURATION_MS = 2800;

export default function LoginSplash() {
  return (
    <div
      id="kanryo-splash"
      aria-hidden
      className="splash-overlay pointer-events-none fixed inset-0 z-50 items-center justify-center bg-[var(--background)]"
      style={{
        display: "none",
        animation: `splash-overlay ${DURATION_MS}ms ease-in-out forwards`,
      }}
    >
      <p
        className="splash-text px-8 text-center text-4xl font-bold leading-relaxed text-[var(--foreground)] sm:text-5xl"
        style={{
          animation: `splash-text ${DURATION_MS}ms ease-in-out forwards`,
        }}
      >
        決めて、<span className="text-[var(--accent)]">やる。</span>
        <br />
        を習慣にする。
      </p>
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{if(sessionStorage.getItem('kanryo-welcomed')==='1'){return;}sessionStorage.setItem('kanryo-welcomed','1');}catch(e){}var el=document.getElementById('kanryo-splash');if(!el)return;el.style.display='flex';setTimeout(function(){el.style.display='none';},${DURATION_MS});})();`,
        }}
      />
    </div>
  );
}
