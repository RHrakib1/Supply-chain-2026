import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-white tracking-tight">LogiLink SaaS</h1>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Multi-Tenant Enterprise Logistics Control Center
          </p>
        </div>

        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full flex justify-center",
              card: "bg-slate-950/90 border border-white/10 backdrop-blur-xl shadow-2xl rounded-3xl p-6",
              headerTitle: "text-white font-bold",
              headerSubtitle: "text-slate-400 text-xs",
              socialButtonsBlockButton: "bg-slate-900 border border-white/10 text-white hover:bg-white/5",
              formButtonPrimary: "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-lg shadow-indigo-500/20",
              formFieldLabel: "text-slate-300 text-xs font-bold uppercase tracking-wider",
              formFieldInput: "bg-slate-900 border border-white/10 text-white rounded-xl text-xs focus:border-indigo-500",
              footerActionLink: "text-indigo-400 hover:text-indigo-300 font-bold",
            },
          }}
        />
      </div>
    </div>
  );
}
