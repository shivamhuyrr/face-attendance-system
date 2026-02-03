import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

print(f"URL: {url}")
# print(f"Key: {key}") # Don't print key for security

try:
    supabase = create_client(url, key)
    
    print("Listing Buckets...")
    buckets = supabase.storage.list_buckets()
    print(buckets)
    
    print("Attempting to upload to 'faces' bucket...")
    res = supabase.storage.from_("faces").upload("debug_test.txt", b"Hello World")
    print(f"Upload Result: {res}")
    
    public_url = supabase.storage.from_("faces").get_public_url("debug_test.txt")
    print(f"Public URL: {public_url}")
    
except Exception as e:
    print("ERROR DETAILS:")
    print(e)
    # Check if it has response attribute
    if hasattr(e, 'response'):
         print(f"Status Code: {e.response.status_code}")
         print(f"Content: {e.response.text}")
