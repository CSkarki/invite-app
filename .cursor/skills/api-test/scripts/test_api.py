#!/usr/bin/env python3
"""
API Test Script for Turnify B2B Return Portal FastAPI Backend

Tests all endpoints to verify functionality.
"""

import requests
import argparse
import json
import sys
from datetime import datetime
from typing import Dict, Any, Optional

# API Configuration
API_BASE_URL = "http://localhost:8000/api/v1"

class Colors:
    """ANSI color codes for terminal output"""
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

class APITester:
    def __init__(self, verbose=False):
        self.verbose = verbose
        self.passed = 0
        self.failed = 0
        self.tests = []

    def print_header(self):
        """Print test header"""
        print("=" * 70)
        print(f"{Colors.BOLD}🧪 API Testing Suite - Turnify B2B Return Portal{Colors.ENDC}")
        print("=" * 70)
        print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Base URL: {API_BASE_URL}\n")

    def print_footer(self):
        """Print test summary"""
        total = self.passed + self.failed
        success_rate = (self.passed / total * 100) if total > 0 else 0

        print("\n" + "=" * 70)
        print(f"{Colors.BOLD}📊 Test Summary{Colors.ENDC}")
        print("-" * 70)
        print(f"Total Tests:   {total}")
        print(f"{Colors.GREEN}Passed:        {self.passed}{Colors.ENDC}")
        if self.failed > 0:
            print(f"{Colors.RED}Failed:        {self.failed}{Colors.ENDC}")
        print(f"Success Rate:  {success_rate:.1f}%")
        print("=" * 70)

    def test_endpoint(self, name: str, method: str, endpoint: str,
                     expected_status: int = 200,
                     data: Optional[Dict] = None,
                     params: Optional[Dict] = None,
                     headers: Optional[Dict] = None) -> bool:
        """
        Test a single endpoint

        Args:
            name: Test name
            method: HTTP method (GET, POST, PUT, DELETE)
            endpoint: API endpoint path
            expected_status: Expected HTTP status code
            data: Request body (for POST/PUT)
            params: Query parameters
            headers: Request headers

        Returns:
            bool: Test passed or failed
        """
        url = f"{API_BASE_URL}{endpoint}"

        print(f"\n{Colors.BLUE}▶{Colors.ENDC} Testing: {name}")
        if self.verbose:
            print(f"  URL: {method} {url}")
            if params:
                print(f"  Params: {params}")
            if data:
                print(f"  Data: {json.dumps(data, indent=2)}")

        try:
            # Make request
            start_time = datetime.now()

            if method == "GET":
                response = requests.get(url, params=params, headers=headers, timeout=10)
            elif method == "POST":
                response = requests.post(url, json=data, params=params, headers=headers, timeout=10)
            elif method == "PUT":
                response = requests.put(url, json=data, params=params, headers=headers, timeout=10)
            elif method == "DELETE":
                response = requests.delete(url, params=params, headers=headers, timeout=10)
            else:
                raise ValueError(f"Unsupported method: {method}")

            elapsed_ms = (datetime.now() - start_time).total_seconds() * 1000

            # Check status code
            if response.status_code == expected_status:
                print(f"  {Colors.GREEN}✅ PASSED{Colors.ENDC} - Status: {response.status_code} ({elapsed_ms:.0f}ms)")
                self.passed += 1

                if self.verbose and response.headers.get('content-type') == 'application/json':
                    result = response.json()
                    print(f"  Response: {json.dumps(result, indent=2)[:200]}...")

                return True
            else:
                print(f"  {Colors.RED}❌ FAILED{Colors.ENDC} - Expected {expected_status}, got {response.status_code}")
                self.failed += 1

                if response.headers.get('content-type') == 'application/json':
                    error = response.json()
                    print(f"  Error: {error.get('error', {}).get('message', 'Unknown error')}")

                return False

        except requests.exceptions.ConnectionError:
            print(f"  {Colors.RED}❌ FAILED{Colors.ENDC} - Cannot connect to backend")
            print(f"  Make sure FastAPI is running on localhost:8000")
            self.failed += 1
            return False
        except requests.exceptions.Timeout:
            print(f"  {Colors.RED}❌ FAILED{Colors.ENDC} - Request timed out")
            self.failed += 1
            return False
        except Exception as e:
            print(f"  {Colors.RED}❌ FAILED{Colors.ENDC} - {str(e)}")
            self.failed += 1
            return False

    def test_health_endpoints(self):
        """Test all health check endpoints"""
        print(f"\n{Colors.BOLD}🏥 Health Check Endpoints{Colors.ENDC}")
        print("-" * 70)

        self.test_endpoint(
            "Main Health Check",
            "GET",
            "/../../health"  # Goes up to main health endpoint
        )

        self.test_endpoint(
            "API v1 Health",
            "GET",
            "/health"
        )

        self.test_endpoint(
            "Auth Service Health",
            "GET",
            "/auth/health"
        )

        self.test_endpoint(
            "OMS Service Health",
            "GET",
            "/oms/health"
        )

    def test_returns_endpoints(self):
        """Test returns endpoints"""
        print(f"\n{Colors.BOLD}📦 Returns Endpoints{Colors.ENDC}")
        print("-" * 70)

        self.test_endpoint(
            "Get Returns (with user_id)",
            "GET",
            "/returns",
            params={"user_id": 1, "limit": 5}
        )

        self.test_endpoint(
            "Get Returns Analytics",
            "GET",
            "/returns/analytics",
            params={"user_id": 1}
        )

    def test_purchase_orders_endpoints(self):
        """Test purchase orders endpoints"""
        print(f"\n{Colors.BOLD}🛒 Purchase Orders Endpoints{Colors.ENDC}")
        print("-" * 70)

        self.test_endpoint(
            "Get Purchase Orders",
            "GET",
            "/purchase-orders",
            params={"user_id": 1, "limit": 5}
        )

    def test_users_endpoints(self):
        """Test users endpoints"""
        print(f"\n{Colors.BOLD}👥 Users Endpoints{Colors.ENDC}")
        print("-" * 70)

        self.test_endpoint(
            "Get Users (Paginated)",
            "GET",
            "/users",
            params={"page": 1, "limit": 5}
        )

    def test_auth_endpoints(self):
        """Test authentication endpoints"""
        print(f"\n{Colors.BOLD}🔐 Authentication Endpoints{Colors.ENDC}")
        print("-" * 70)

        # This will fail without valid credentials, but tests the endpoint exists
        self.test_endpoint(
            "Shopify Login (expect 401 - no valid credentials)",
            "POST",
            "/auth/shopify/login",
            expected_status=401,  # Expected to fail
            data={"email": "test@example.com", "password": "invalid"}
        )

def main():
    """Main function"""
    parser = argparse.ArgumentParser(
        description="Test FastAPI backend endpoints"
    )
    parser.add_argument(
        '--health-only',
        action='store_true',
        help='Test only health endpoints'
    )
    parser.add_argument(
        '--verbose',
        '-v',
        action='store_true',
        help='Show detailed request/response info'
    )
    parser.add_argument(
        '--endpoint',
        choices=['health', 'returns', 'orders', 'users', 'auth'],
        help='Test specific endpoint group only'
    )

    args = parser.parse_args()

    # Create tester
    tester = APITester(verbose=args.verbose)
    tester.print_header()

    # Run tests based on arguments
    if args.health_only:
        tester.test_health_endpoints()
    elif args.endpoint:
        if args.endpoint == 'health':
            tester.test_health_endpoints()
        elif args.endpoint == 'returns':
            tester.test_returns_endpoints()
        elif args.endpoint == 'orders':
            tester.test_purchase_orders_endpoints()
        elif args.endpoint == 'users':
            tester.test_users_endpoints()
        elif args.endpoint == 'auth':
            tester.test_auth_endpoints()
    else:
        # Run all tests
        tester.test_health_endpoints()
        tester.test_returns_endpoints()
        tester.test_purchase_orders_endpoints()
        tester.test_users_endpoints()
        tester.test_auth_endpoints()

    # Print summary
    tester.print_footer()

    # Exit with appropriate code
    sys.exit(0 if tester.failed == 0 else 1)

if __name__ == "__main__":
    main()
