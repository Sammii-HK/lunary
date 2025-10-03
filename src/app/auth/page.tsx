import { AuthComponent } from '@/components/Auth';

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-400 mb-2">🌙 Lunary</h1>
          <p className="text-zinc-400">Your Personal Cosmic Journey</p>
        </div>
        
        <AuthComponent />
      </div>
    </div>
  );
}
