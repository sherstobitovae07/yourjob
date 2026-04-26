import requests
import json

try:
    r = requests.post('http://127.0.0.1:8002/api/v1/auth/login', 
                     json={'email':'final2@example.com','password':'password123'})
    print('Status:', r.status_code)
    print('Response:', json.dumps(r.json(), indent=2, ensure_ascii=False))
except Exception as e:
    print('Error:', str(e))
