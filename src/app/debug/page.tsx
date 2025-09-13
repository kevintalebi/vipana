'use client'

import { useEffect, useState } from 'react'

export default function DebugPage() {
  const [envInfo, setEnvInfo] = useState<any>({})

  useEffect(() => {
    setEnvInfo({
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      window_location_origin: window.location.origin,
      window_location_hostname: window.location.hostname,
      window_location_href: window.location.href,
      is_development: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
      all_env_vars: Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_'))
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Environment Debug Info</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(envInfo, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">1. Check Environment Variable:</h3>
              <p>Make sure <code className="bg-gray-100 px-2 py-1 rounded">NEXT_PUBLIC_SITE_URL</code> is set to <code className="bg-gray-100 px-2 py-1 rounded">https://vipana.ir</code></p>
            </div>
            
            <div>
              <h3 className="font-semibold">2. Update Supabase Configuration:</h3>
              <p>In Supabase Dashboard → Authentication → URL Configuration:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Site URL: <code className="bg-gray-100 px-2 py-1 rounded">https://vipana.ir</code></li>
                <li>Redirect URLs: <code className="bg-gray-100 px-2 py-1 rounded">https://vipana.ir/auth/callback</code></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold">3. Update Google OAuth Console:</h3>
              <p>In Google Cloud Console → APIs & Services → Credentials:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Authorized redirect URIs: <code className="bg-gray-100 px-2 py-1 rounded">https://vipana.ir/auth/callback</code></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
