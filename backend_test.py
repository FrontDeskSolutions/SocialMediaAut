#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class SocialMediaDashboardTester:
    def __init__(self, base_url="https://feed-to-social.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                self.log_test(name, False, f"Expected {expected_status}, got {response.status_code}")
                return False, {}

        except requests.exceptions.Timeout:
            self.log_test(name, False, "Request timeout")
            return False, {}
        except requests.exceptions.ConnectionError:
            self.log_test(name, False, "Connection error")
            return False, {}
        except Exception as e:
            self.log_test(name, False, f"Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test health endpoint"""
        success, response = self.run_test(
            "Health Check",
            "GET",
            "health",
            200
        )
        return success

    def test_list_generations(self):
        """Test listing generations"""
        success, response = self.run_test(
            "List Generations",
            "GET", 
            "generations/",
            200
        )
        if success:
            print(f"   Found {len(response)} generations")
        return success, response

    def test_trigger_generation(self, topic="Test Topic"):
        """Test triggering a new generation"""
        success, response = self.run_test(
            "Trigger Generation",
            "POST",
            "webhooks/trigger",
            200,
            data={"topic": topic}
        )
        if success and 'id' in response:
            print(f"   Created generation with ID: {response['id']}")
            return success, response['id']
        return success, None

    def test_get_generation(self, gen_id):
        """Test getting a specific generation"""
        if not gen_id:
            self.log_test("Get Generation", False, "No generation ID provided")
            return False
            
        success, response = self.run_test(
            "Get Generation",
            "GET",
            f"generations/{gen_id}",
            200
        )
        if success:
            print(f"   Generation status: {response.get('status', 'unknown')}")
            print(f"   Slides count: {len(response.get('slides', []))}")
        return success

    def test_update_generation(self, gen_id):
        """Test updating a generation"""
        if not gen_id:
            self.log_test("Update Generation", False, "No generation ID provided")
            return False
            
        update_data = {
            "slides": [
                {
                    "id": "test-slide-1",
                    "title": "Test Slide Title",
                    "content": "Test slide content",
                    "background_prompt": "Abstract minimal background",
                    "background_url": None,
                    "layout": "default"
                }
            ]
        }
        
        success, response = self.run_test(
            "Update Generation",
            "PUT",
            f"generations/{gen_id}",
            200,
            data=update_data
        )
        return success

    def run_all_tests(self):
        """Run comprehensive backend tests"""
        print("🚀 Starting Social Media Dashboard Backend Tests")
        print(f"   Base URL: {self.base_url}")
        print("=" * 60)

        # Test 1: Health Check
        if not self.test_health_check():
            print("❌ Health check failed - stopping tests")
            return False

        # Test 2: List Generations (should work even if empty)
        success, generations = self.test_list_generations()
        if not success:
            print("❌ List generations failed - stopping tests")
            return False

        # Test 3: Trigger Generation
        success, gen_id = self.test_trigger_generation("Backend Test Topic")
        if not success:
            print("❌ Trigger generation failed - continuing with other tests")
            gen_id = None

        # Test 4: Get Generation (if we have an ID)
        if gen_id:
            self.test_get_generation(gen_id)
            
            # Test 5: Update Generation
            self.test_update_generation(gen_id)
        else:
            # Try with existing generation if any
            if generations and len(generations) > 0:
                existing_id = generations[0].get('id')
                if existing_id:
                    print(f"\n🔄 Testing with existing generation: {existing_id}")
                    self.test_get_generation(existing_id)
                    self.test_update_generation(existing_id)

        # Print Summary
        print("\n" + "=" * 60)
        print(f"📊 Backend Tests Summary:")
        print(f"   Tests Run: {self.tests_run}")
        print(f"   Tests Passed: {self.tests_passed}")
        print(f"   Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = SocialMediaDashboardTester()
    success = tester.run_all_tests()
    
    # Save test results
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'total_tests': tester.tests_run,
            'passed_tests': tester.tests_passed,
            'success_rate': (tester.tests_passed/tester.tests_run*100) if tester.tests_run > 0 else 0,
            'results': tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())