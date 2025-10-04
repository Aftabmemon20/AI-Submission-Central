# github_reader/app.py (Final, more robust version)

from flask import Flask, request, jsonify
import requests
import base64

app = Flask(__name__)

@app.route('/read-repo', methods=['POST'])
def read_repo():
    data = request.get_json()
    if not data or 'github_link' not in data:
        return jsonify({"error": "github_link is required"}), 400

    github_link = data['github_link']

    try:
        # Example: "https://github.com/google/gemini-api-docs" -> "google/gemini-api-docs"
        parts = github_link.strip('/').split('/')
        repo_path = f"{parts[-2]}/{parts[-1]}"

        # --- THIS IS THE CHANGED LINE ---
        # Instead of the generic '/readme', we ask for the specific file. This is more reliable.
        api_url = f"https://api.github.com/repos/{repo_path}/contents/README.md"
        
        headers = {"Accept": "application/vnd.github.v3+json"}
        response = requests.get(api_url, headers=headers)
        response.raise_for_status() 

        repo_data = response.json()
        
        content_encoded = repo_data['content']
        content_decoded = base64.b64decode(content_encoded).decode('utf-8')

        return jsonify({
            "success": True,
            "readme_content": content_decoded
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)