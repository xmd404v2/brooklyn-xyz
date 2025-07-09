'use client'

import React from 'react'

export function EnvCheck() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  if (!supabaseUrl || !supabaseKey) {
    return (
      <div className="fixed inset-0 bg-red-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 shadow-lg max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Configuration Error</h2>
          <p className="text-gray-700 mb-4">
            Missing required environment variables. Please check your <code>.env.local</code> file.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>SUPABASE_URL:</span>
              <span className={supabaseUrl ? 'text-green-600' : 'text-red-600'}>
                {supabaseUrl ? '✓ Set' : '✗ Missing'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>SUPABASE_ANON_KEY:</span>
              <span className={supabaseKey ? 'text-green-600' : 'text-red-600'}>
                {supabaseKey ? '✓ Set' : '✗ Missing'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>BASE_URL:</span>
              <span className={baseUrl ? 'text-green-600' : 'text-yellow-600'}>
                {baseUrl ? '✓ Set' : '⚠ Default'}
              </span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
            <p className="font-semibold mb-2">Create a .env.local file with:</p>
            <pre className="whitespace-pre-wrap">
{`NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000`}
            </pre>
          </div>
        </div>
      </div>
    )
  }

  return null
} 