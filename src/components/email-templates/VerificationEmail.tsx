import * as React from 'react';

interface VerificationEmailProps {
  verificationUrl: string;
  email: string;
}

export function VerificationEmail({ verificationUrl, email }: VerificationEmailProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ color: '#8b5cf6' }}>Welcome to Lunary! 🌙</h1>
      <p>Hi there!</p>
      <p>Thanks for signing up with {email}. Please verify your email address to get started with your cosmic journey.</p>
      
      <div style={{ textAlign: 'center', margin: '32px 0' }}>
        <a 
          href={verificationUrl}
          style={{
            backgroundColor: '#8b5cf6',
            color: 'white',
            padding: '12px 24px',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: 'bold'
          }}
        >
          Verify Email Address
        </a>
      </div>
      
      <p>Or copy and paste this link in your browser:</p>
      <p style={{ wordBreak: 'break-all', color: '#666' }}>{verificationUrl}</p>
      
      <p>This link will expire in 24 hours for security.</p>
      
      <hr style={{ margin: '32px 0', border: 'none', borderTop: '1px solid #eee' }} />
      <p style={{ fontSize: '14px', color: '#666' }}>
        If you didn't sign up for Lunary, you can safely ignore this email.
      </p>
    </div>
  );
}
