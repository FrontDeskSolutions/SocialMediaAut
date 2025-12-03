
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
    
    try:
        resp = requests.post(url, json=payload, headers=headers)
        print(f"Create Status: {resp.status_code}")
        print(f"Create Response: {resp.text}")
        
        if resp.status_code != 200:
            return
            
        data = resp.json()
        task_id = data.get('data', {}).get('taskId')
        if not task_id:
            print("No taskId returned")
            return
            
        print(f"Task ID: {task_id}")
        
        # 2. Try Query - Attempt 1: GET queryTask
        print("\nAttempting GET queryTask...")
        query_url = f"{BASE_URL}/api/v1/jobs/queryTask"
        resp = requests.get(query_url, params={"taskId": task_id}, headers=headers)
        print(f"GET Status: {resp.status_code}")
        print(f"GET Response: {resp.text}")
        
        # 3. Try Query - Attempt 2: POST queryTask (Common for some APIs)
        if resp.status_code != 200:
            print("\nAttempting POST queryTask...")
            resp = requests.post(query_url, json={"taskId": task_id}, headers=headers)
            print(f"POST Status: {resp.status_code}")
            print(f"POST Response: {resp.text}")

            # 4. Try Query - Attempt 3: GET getTask
            if resp.status_code != 200:
                print("\nAttempting GET getTask...")
                get_url = f"{BASE_URL}/api/v1/jobs/getTask"
                resp = requests.get(get_url, params={"taskId": task_id}, headers=headers)
                print(f"GET getTask Status: {resp.status_code}")
                print(f"GET getTask Response: {resp.text}")
    
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_kie_flow()
