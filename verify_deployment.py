import urllib.request
import time
import urllib.error

def check_service(name, url):
    print(f"Checking {name} at {url}...")
    try:
        with urllib.request.urlopen(url, timeout=5) as response:
            print(f"✅ {name} is up! Status Code: {response.getcode()}")
            return True
    except urllib.error.HTTPError as e:
        # 404 is fine for docs sometimes, but better to check if it's running
        print(f"✅ {name} is reachable but returned {e.code}")
        return True
    except Exception as e:
        print(f"❌ {name} failed: {e}")
        return False

print("Waiting for services...")
time.sleep(2)

backend_ok = check_service("Backend", "http://localhost:8000/docs")
frontend_ok = check_service("Frontend", "http://localhost:5173")

if backend_ok and frontend_ok:
    print("\n🚀 All systems operational!")
else:
    print("\n⚠️  Some services failed.")
