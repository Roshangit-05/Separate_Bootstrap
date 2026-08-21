"""
Centralized REST API Client Helper
Handles all HTTP communication with Project 1 Backend API:
- Request headers and Bearer Token injection
- GET, POST, PUT, DELETE helpers
- Friendly error handling for connection failures, Render cold starts, and 401s
"""

from typing import Optional, Dict, Any, Tuple
import requests
from flask import session, current_app


class RestApiClient:
    """Client helper for Project 1 REST API."""

    def __init__(self, base_url: Optional[str] = None, timeout: int = 15):
        self.base_url = (base_url or "").rstrip("/")
        self.timeout = timeout

    def _get_base_url(self) -> str:
        if self.base_url:
            return self.base_url
        return current_app.config.get("API_BASE_URL", "http://127.0.0.1:5000").rstrip("/")

    def _get_timeout(self) -> int:
        return current_app.config.get("API_TIMEOUT", self.timeout)

    def _get_headers(self, custom_headers: Optional[Dict[str, str]] = None) -> Dict[str, str]:
        """Construct headers including JSON Content-Type and Bearer auth token if present in session."""
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        token = session.get("jwt_token")
        if token:
            headers["Authorization"] = f"Bearer {token}"
            
        if custom_headers:
            headers.update(custom_headers)
        return headers

    def _handle_response(self, response: requests.Response) -> Tuple[bool, Any, str, int]:
        """
        Parse HTTP response into a standard tuple:
        (success: bool, data: Any, message: str, status_code: int)
        """
        status_code = response.status_code
        try:
            res_json = response.json()
        except ValueError:
            res_json = {}

        message = res_json.get("message", "")
        data = res_json.get("data", res_json)
        
        # Check HTTP status
        if 200 <= status_code < 300:
            return True, data, message or "Success", status_code
        elif status_code == 401:
            # Token expired or invalid
            return False, data, message or "Session expired. Please log in again.", status_code
        elif status_code == 403:
            return False, data, message or "You do not have permission to perform this action.", status_code
        elif status_code == 404:
            return False, data, message or "The requested resource was not found.", status_code
        elif status_code == 400:
            # Check for validation dictionary errors
            errors = res_json.get("errors")
            if errors and isinstance(errors, dict):
                first_err = next(iter(errors.values()))
                return False, errors, first_err, status_code
            return False, data, message or "Invalid request data.", status_code
        else:
            return False, data, message or f"Backend server error ({status_code}).", status_code

    def _request(
        self, 
        method: str, 
        endpoint: str, 
        json_data: Optional[Dict[str, Any]] = None, 
        params: Optional[Dict[str, Any]] = None
    ) -> Tuple[bool, Any, str, int]:
        """Execute HTTP request with robust error trapping."""
        url = f"{self._get_base_url()}/{endpoint.lstrip('/')}"
        headers = self._get_headers()
        timeout = self._get_timeout()

        try:
            response = requests.request(
                method=method,
                url=url,
                json=json_data,
                params=params,
                headers=headers,
                timeout=timeout
            )
            return self._handle_response(response)

        except requests.exceptions.ConnectionError:
            return (
                False, 
                None, 
                "Cannot connect to the REST API backend. If hosted on Render, it may be waking up from cold-start (30-50s). Please check that the backend is running.",
                503
            )
        except requests.exceptions.Timeout:
            return (
                False, 
                None, 
                "Request timed out waiting for the REST API backend. The service may be busy or waking up.",
                504
            )
        except requests.exceptions.RequestException as e:
            return (
                False, 
                None, 
                f"An unexpected network error occurred: {str(e)}", 
                500
            )

    # Convenience HTTP Methods
    def get(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> Tuple[bool, Any, str, int]:
        return self._request("GET", endpoint, params=params)

    def post(self, endpoint: str, json_data: Optional[Dict[str, Any]] = None) -> Tuple[bool, Any, str, int]:
        return self._request("POST", endpoint, json_data=json_data)

    def put(self, endpoint: str, json_data: Optional[Dict[str, Any]] = None) -> Tuple[bool, Any, str, int]:
        return self._request("PUT", endpoint, json_data=json_data)

    def delete(self, endpoint: str) -> Tuple[bool, Any, str, int]:
        return self._request("DELETE", endpoint)


# Instantiate default singleton client
api = RestApiClient()
