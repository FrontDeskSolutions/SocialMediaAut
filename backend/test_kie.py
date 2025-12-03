
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
            "prompt": "A futuristic city with neon lights, digital art, 4k",
            "output_format": "png",
            "image_size": "1:1"
        }
    }
    
    task_id = None
    
    try:
        resp = requests.post(url, json=payload, headers=headers)
        print(f"Create Status: {resp.status_code}")
        
        if resp.status_code == 200:
            data = resp.json()
            task_id = data.get('data', {}).get('taskId')
            record_id = data.get('data', {}).get('recordId')
            print(f"Task ID: {task_id}")
            print(f"Record ID: {record_id}")
        else:
            print(resp.text)
            return

        if not task_id:
            return
            
        # Try various query endpoints
        endpoints = [
            ("/api/v1/jobs/queryTask", "GET", {"taskId": task_id}),
            ("/api/v1/jobs/queryTask", "POST", {"taskId": task_id}),
            ("/api/v1/jobs/getTask", "GET", {"taskId": task_id}),
            ("/api/v1/jobs/record-detail", "GET", {"taskId": task_id}),
            ("/api/v1/jobs/detail", "GET", {"taskId": task_id}),
            ("/api/v1/query/task", "GET", {"taskId": task_id}),
            ("/api/v1/task/query", "POST", {"taskId": task_id}),
        ]

        for path, method, params in endpoints:
            print(f"\nTrying {method} {path}...")
            try:
                full_url = f"{BASE_URL}{path}"
                if method == "GET":
                    r = requests.get(full_url, params=params, headers=headers)
                else:
                    r = requests.post(full_url, json=params, headers=headers)
                
                print(f"Status: {r.status_code}")
                if r.status_code == 200:
                    print(f"SUCCESS! Response: {r.text}")
                    break
            except Exception as e:
                print(f"Failed: {e}")
                
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_kie_flow()
