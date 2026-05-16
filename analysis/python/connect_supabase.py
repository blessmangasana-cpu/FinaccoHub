"""Connect to Supabase from Python for downstream analytics."""

from supabase import create_client
import os

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

if __name__ == '__main__':
    response = supabase.table('rse_equities').select('*').limit(5).execute()
    print(response.data)
