
import requests
import time
import os
from dotenv import load_dotenv

load_dotenv("/app/backend/.env")
API_KEY = os.environ.get("KIE_AI_API_KEY")
BASE_URL = "https://api.kie.ai"

def test_kie_lifecycle():
    if not API_KEY:
        print("Error: KIE_AI_API_KEY not found")
        return

    # 1. Create Task (Nano Banana Pro)
    print("1. Creating Task (nano-banana-pro)...")
    create_url = f"{BASE_URL}/api/v1/jobs/createTask"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    payload = {
        "model": "nano-banana-pro",
        "input": {
            "prompt": "A futuristic cyberpunk banana city, neon lights, highly detailed, 4k",
            "aspect_ratio": "1:1",
            "resolution": "1K",
            "output_format": "png"
        }
    }
    
    try:
        resp = requests.post(create_url, json=payload, headers=headers)
        print(f"Create Status: {resp.status_code}")
        print(f"Create Body: {resp.text}")
        
        if resp.status_code != 200:
            return

        data = resp.json()
        task_id = data.get('data', {}).get('taskId')
        print(f"Task ID: {task_id}")
        
        if not task_id:
            return

        # 2. Poll recordInfo
        print("\n2. Polling recordInfo...")
        query_url = f"{BASE_URL}/api/v1/jobs/recordInfo"
        
        for i in range(10):
            time.sleep(5) # Wait 5s
            print(f"Polling attempt {i+1}...")
            
            q_resp = requests.get(query_url, params={"taskId": task_id}, headers=headers)
            print(f"Poll Status: {q_resp.status_code}")
            
            if q_resp.status_code == 200:
                q_data = q_resp.json()
                state = q_data.get('data', {}).get('state')
                print(f"State: {state}")
                
                if state == 'success':
                    result_json = q_data.get('data', {}).get('resultJson')
                    print(f"Result: {result_json}")
                    return
                elif state == 'fail':
                    print("Failed!")
                    return
            else:
                print(f"Poll Error: {q_resp.text}")
                
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_kie_lifecycle()
