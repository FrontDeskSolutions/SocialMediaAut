
import os
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv("/app/backend/.env")

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

try:
    print("Testing DALL-E 3...")
    response = client.images.generate(
        model="dall-e-3",
        prompt="A simple white circle on black background",
        size="1024x1024",
        quality="standard",
        n=1,
    )
    print(f"Success: {response.data[0].url}")
except Exception as e:
    print(f"Error: {e}")
