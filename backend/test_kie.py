
import requests
import time
import json

API_KEY = "2e7a36b0711d1ea25c2477e04df6e6d9"
BASE_URL = "https://api.kie.ai"

def test_kie_flow():
    # 1. Create Task
    print("Creating task...")
    url = f"{BASE_URL}/api/v1/jobs/createTask"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    payload = {
        "model": "google/nano-banana",
        "input": {
            "prompt": "test image",
            "output_format": "png",
            "image_size": "1:1"
        }
    }
    
    task_id = None
    
    try:
        resp = requests.post(url, json=payload, headers=headers)
        if resp.status_code == 200:
            data = resp.json()
            task_id = data.get('data', {}).get('taskId')
            print(f"Task ID: {task_id}")
        else:
            print(f"Create Failed: {resp.status_code} {resp.text}")
            return

        if not task_id:
            return
            
        # Try various query endpoints
        endpoints = [
            # Standard Kie patterns
            ("/api/v1/jobs/query", "GET", {"taskId": task_id}),
            ("/api/v1/jobs/query", "POST", {"taskId": task_id}),
            ("/api/v1/jobs/status", "GET", {"taskId": task_id}),
            ("/api/v1/jobs/check", "GET", {"taskId": task_id}),
            
            # Service specific (nano-banana)
            ("/api/v1/nano-banana/record-detail", "GET", {"taskId": task_id}),
            ("/api/v1/nano-banana/query", "GET", {"taskId": task_id}),
            ("/api/v1/google/nano-banana/record-detail", "GET", {"taskId": task_id}),
            
            # Generic
            ("/api/v1/task/query", "GET", {"taskId": task_id}),
            ("/api/v1/task/detail", "GET", {"taskId": task_id}),
            ("/api/v1/query/task", "POST", {"taskId": task_id}),
            
            # Last resort guesses
            ("/api/v1/jobs/get", "GET", {"taskId": task_id}),
            ("/api/v1/jobs/result", "GET", {"taskId": task_id}),
        ]

        for path, method, params in endpoints:
            print(f"Trying {method} {path}...", end=" ")
            try:
                full_url = f"{BASE_URL}{path}"
                if method == "GET":
                    r = requests.get(full_url, params=params, headers=headers)
                else:
                    r = requests.post(full_url, json=params, headers=headers)
                
                print(f"{r.status_code}")
                if r.status_code == 200:
                    print(f"SUCCESS! Response: {r.text}")
                    return
            except Exception as e:
                print(f"Ex: {e}")
                
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_kie_flow()
