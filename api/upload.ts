import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // In production on Vercel, direct Supabase storage upload is used.
  // If a request reaches this fallback endpoint, the 'portfolio' bucket is not yet configured in Supabase.
  return res.status(400).json({
    error: "Supabase Storage bucket 'portfolio' was not found. Please create a public bucket named 'portfolio' in your Supabase Dashboard (Storage > New bucket), or run the storage setup SQL in Supabase SQL editor.",
  })
}
