import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Check if users table exists by trying to query it
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (error && error.code === '42P01') {
      // Table doesn't exist, create it
      const { error: createError } = await supabase.rpc('create_users_table', {})
      
      if (createError) {
        // If RPC doesn't exist, create table manually via SQL
        const { error: sqlError } = await supabase.rpc('exec_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS users (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              farcaster_id TEXT UNIQUE NOT NULL,
              points INTEGER DEFAULT 0,
              last_guess_date DATE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `
        })

        if (sqlError) {
          return NextResponse.json({
            success: false,
            message: 'Could not create users table. Please create it manually in Supabase.',
            error: sqlError
          }, { status: 500 })
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Users table created successfully'
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Users table already exists',
      count: data?.length || 0
    })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json({
      success: false,
      message: 'Setup failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 