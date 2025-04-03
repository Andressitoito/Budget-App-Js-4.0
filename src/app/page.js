// src/app/page.js
'use client';

import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

export default function LandingPage() {
  const [joinOrg, setJoinOrg] = useState(false);
  const [orgId, setOrgId] = useState('');
  const [orgName, setOrgName] = useState('');
  const [username, setUsername] = useState('');
  const [verifyToken, setVerifyToken] = useState('');
  const router = useRouter();

  const login = useGoogleLogin({
    flow: 'implicit',
    redirect_uri: 'http://localhost:3000/auth/callback',
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userData = await res.json();

        const payload = {
          username,
          given_name: userData.given_name,
          family_name: userData.family_name,
          picture: userData.picture,
          organizationId: joinOrg ? orgId : null,
          organizationName: joinOrg ? null : orgName,
          token: verifyToken,
        };

        const endpoint = joinOrg ? '/api/organizations/join_organization' : '/api/organizations/create_new_organization';
        const createRes = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const result = await createRes.json();
        if (!createRes.ok) throw new Error(result.error || `Failed to ${joinOrg ? 'join' : 'create'} organization`);

        router.push(`/dashboard?orgId=${result.orgId}`);
      } catch (error) {
        toast.error(error.message);
      }
    },
    onError: () => toast.error('Google login failed'),
  });

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-blue-700 mb-6">Budget Smarter, Together</h1>
      <p className="text-lg text-gray-700 mb-8 text-center max-w-md">
        Take control of your finances with Budget App Js 4.0—collaborate, track, and optimize your budget effortlessly.
      </p>
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <div className="mb-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full p-2 border rounded-md mb-4"
          />
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={joinOrg}
              onChange={(e) => setJoinOrg(e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="text-gray-700">Join an Organization</span>
          </label>
        </div>
        {joinOrg ? (
          <div className="space-y-4">
            <input
              type="text"
              value={orgId}
              onChange={(e) => setOrgId(e.target.value)}
              placeholder="Organization ID"
              className="w-full p-2 border rounded-md"
            />
            <input
              type="text"
              value={verifyToken}
              onChange={(e) => setVerifyToken(e.target.value)}
              placeholder="Verify Token"
              className="w-full p-2 border rounded-md"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Organization Name"
              className="w-full p-2 border rounded-md"
            />
            <input
              type="text"
              value={verifyToken}
              onChange={(e) => setVerifyToken(e.target.value)}
              placeholder="Verify Token"
              className="w-full p-2 border rounded-md"
            />
          </div>
        )}
        <button
          onClick={() => login()}
          className="mt-6 w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 flex items-center justify-center"
        >
          <span className="mr-2">Login with Google</span>
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12.24 10.32V14h3.76c-.15 1-.62 1.89-1.32 2.62l2.08 1.6c1.24-1.15 2-2.77 2-4.62 0-.75-.13-1.47-.34-2.14h-6.18z" />
            <path fill="currentColor" d="M12 18c-1.66 0-3.15-.64-4.28-1.67l-2.08 1.6C7.08 19.56 9.43 21 12 21c2.37 0 4.49-.92 6.06-2.4l-2.08-1.6C14.82 17.64 13.45 18 12 18z" />
            <path fill="currentColor" d="M5.64 13.33C5.24 12.56 5 11.7 5 10.82s.24-1.74.64-2.51L3.56 6.71C2.59 8.24 2 9.98 2 11.82s.59 3.58 1.56 5.11l2.08-1.6z" />
            <path fill="currentColor" d="M12 6c1.38 0 2.63.56 3.54 1.47l2.08-1.6C15.87 4.36 14 3 12 3c-2.57 0-4.92 1.44-6.36 3.07l2.08 1.6C8.85 6.64 10.34 6 12 6z" />
          </svg>
        </button>
      </div>
    </div>
  );
}