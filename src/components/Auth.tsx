'use client';

import { useState } from 'react';
import { betterAuthClient } from '@/lib/auth-client';
import { useAccount } from 'jazz-tools/react';

interface AuthFormData {
  email: string;
  password: string;
  name?: string;
}

export function AuthComponent() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    name: '',
  });

  const account = useAccount();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        await betterAuthClient.signUp.email(
          {
            email: formData.email,
            password: formData.password,
            name: formData.name || 'User',
          },
          {
            onSuccess: async () => {
              // Update the profile's name after successful signup
              if (account?.me?.profile && formData.name) {
                account.me.profile.name = formData.name;
              }
            },
          }
        );
      } else {
        await betterAuthClient.signIn.email({
          email: formData.email,
          password: formData.password,
        });
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await betterAuthClient.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // If user is authenticated, show sign out option
  if (account?.me) {
    return (
      <div className="w-full max-w-md mx-auto bg-zinc-900 rounded-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Welcome back!</h2>
          <p className="text-zinc-400">
            Signed in as: <span className="text-purple-400">{account.me.profile?.name || 'User'}</span>
          </p>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-zinc-900 rounded-lg p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          {isSignUp ? 'Create Account' : 'Sign In'}
        </h2>
        <p className="text-zinc-400">
          {isSignUp 
            ? 'Join Lunary to sync your cosmic journey' 
            : 'Welcome back to your cosmic journey'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-2">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required={isSignUp}
              value={formData.name}
              onChange={handleInputChange}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your name"
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-2">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={formData.password}
            onChange={handleInputChange}
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter your password"
            minLength={6}
          />
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          {loading ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              {isSignUp ? 'Creating Account...' : 'Signing In...'}
            </>
          ) : (
            isSignUp ? 'Create Account' : 'Sign In'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError(null);
            setFormData({ email: '', password: '', name: '' });
          }}
          className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
        >
          {isSignUp 
            ? 'Already have an account? Sign in' 
            : "Don't have an account? Sign up"
          }
        </button>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-zinc-500">
          🔒 Your data is securely encrypted and synced across devices
        </p>
      </div>
    </div>
  );
}
