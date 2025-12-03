
import os
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv("/app/backend/.env")

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

try:
    print("Testing Chat...")
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": "Hello"}],
        max_tokens=10
    )
    print(f"Success: {response.choices[0].message.content}")
except Exception as e:
    print(f"Error: {e}")
