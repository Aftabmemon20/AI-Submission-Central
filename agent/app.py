import os
import json
import enum
import requests
import traceback
import re
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS, cross_origin
from dotenv import load_dotenv
from cerebras.cloud.sdk import Cerebras

# Service URLs - will use environment variables when deployed to Render
GITHUB_READER_URL = os.getenv('GITHUB_READER_URL', 'http://github-reader:5001')
VIDEO_PARSER_URL = os.getenv('VIDEO_PARSER_URL', 'http://video-parser:5002')
CEREBRAS_API_KEY = os.getenv('CEREBRAS_API_KEY')

db = SQLAlchemy()
cors = CORS()

class Hackathon(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    judge_id = db.Column(db.String(100), nullable=False, index=True)
    criteria = db.Column(db.Text, nullable=True)

class Submission(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    hackathon_id = db.Column(db.Integer, db.ForeignKey('hackathon.id'), nullable=False, index=True)
    project_name = db.Column(db.String(100), nullable=False)
    github_link = db.Column(db.String(200), nullable=False)
    video_link = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(50), default="NEW")
    score_innovation = db.Column(db.Float, nullable=True)
    score_impact = db.Column(db.Float, nullable=True)
    justification = db.Column(db.Text, nullable=True)

def create_app():
    load_dotenv()
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///hackathon.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    cors.init_app(app, resources={r"/*": {"origins": "*"}})

    with app.app_context():
        db.create_all()

        @app.route('/api/hackathons/create', methods=['POST', 'OPTIONS'])
        @cross_origin()
        def create_hackathon():
            if request.method == 'OPTIONS': 
                return jsonify(status='ok'), 200
            
            data = request.get_json()
            if not data or 'name' not in data or 'judge_id' not in data: 
                return jsonify({"error": "Missing name or judge_id"}), 400
            
            new_hackathon = Hackathon(
                name=data['name'], 
                judge_id=data['judge_id'], 
                criteria=data.get('criteria', 'Evaluate based on innovation and impact.')
            )
            db.session.add(new_hackathon)
            db.session.commit()
            
            return jsonify({
                "message": "Hackathon created!", 
                "hackathon": {
                    "id": new_hackathon.id, 
                    "name": new_hackathon.name
                }
            }), 201

        @app.route('/api/hackathons', methods=['GET'])
        @cross_origin()
        def get_hackathons_by_judge():
            judge_id = request.args.get('judge_id')
            if not judge_id: 
                return jsonify({"error": "Judge ID is required"}), 400
            
            hackathons = Hackathon.query.filter_by(judge_id=judge_id).order_by(Hackathon.id.desc()).all()
            return jsonify([{
                "id": h.id, 
                "name": h.name, 
                "criteria": h.criteria
            } for h in hackathons])

        @app.route('/api/dashboard/<int:hackathon_id>')
        @cross_origin()
        def dashboard_for_hackathon(hackathon_id):
            submissions = Submission.query.filter_by(hackathon_id=hackathon_id).order_by(Submission.id.desc()).all()
            return jsonify([{
                "id": s.id, 
                "project_name": s.project_name, 
                "github_link": s.github_link,
                "video_link": s.video_link,
                "status": s.status, 
                "score_innovation": s.score_innovation, 
                "score_impact": s.score_impact, 
                "justification": s.justification
            } for s in submissions])

        @app.route('/api/hackathons/verify', methods=['POST', 'OPTIONS'])
        @cross_origin()
        def verify_hackathon():
            if request.method == 'OPTIONS': 
                return jsonify(status='ok'), 200
            
            data = request.get_json()
            try:
                hackathon_id = int(data.get('hackathon_id'))
            except (ValueError, TypeError):
                return jsonify({"valid": False, "message": "Invalid Hackathon ID format"}), 400
            
            hackathon = Hackathon.query.get(hackathon_id)
            if hackathon: 
                return jsonify({"valid": True, "hackathonName": hackathon.name})
            else: 
                return jsonify({"valid": False, "message": "Invalid Hackathon ID"}), 404

        @app.route('/submit', methods=['POST', 'OPTIONS'])
        @cross_origin()
        def submit_project():
            if request.method == 'OPTIONS': 
                return jsonify(status='ok'), 200
            
            data = request.get_json()
            
            # Validate required fields
            if not data:
                return jsonify({"error": "No data provided"}), 400
            
            required_fields = ['hackathon_id', 'github_link', 'video_link']
            missing_fields = [field for field in required_fields if not data.get(field)]
            if missing_fields:
                return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400
            
            # Validate hackathon_id
            try:
                hackathon_id = int(data.get('hackathon_id'))
            except (ValueError, TypeError):
                return jsonify({"error": "Invalid Hackathon ID format"}), 400
            
            hackathon = Hackathon.query.get(hackathon_id)
            if not hackathon: 
                return jsonify({"error": "Invalid Hackathon ID"}), 404
            
            # Create new submission
            new_submission = Submission(
                hackathon_id=hackathon_id, 
                project_name=data.get('project_name', 'Untitled'), 
                github_link=data['github_link'], 
                video_link=data['video_link'],
                status="PROCESSING"
            )
            db.session.add(new_submission)
            db.session.commit()
            
            try:
                # Call GitHub reader service - UPDATED URL
                github_response = requests.post(
                    f"{GITHUB_READER_URL}/read-repo", 
                    json={"github_link": data['github_link']},
                    timeout=30
                )
                github_response.raise_for_status()
                readme_content = github_response.json().get("readme_content", "")
                
                # Call video parser service - UPDATED URL
                video_response = requests.post(
                    f"{VIDEO_PARSER_URL}/parse-video", 
                    json={"video_link": data['video_link']},
                    timeout=30
                )
                video_response.raise_for_status()
                video_summary = video_response.json().get("video_summary", {})
                video_title = video_summary.get('title', 'N/A')
                video_description = video_summary.get('description', 'N/A')
                
                # Prepare judge criteria
                judge_criteria = hackathon.criteria or "Evaluate based on innovation and impact."
                
                # Create AI evaluation prompt
                prompt_for_ai = f"""You are an expert hackathon judge. Evaluate this project based on the following criteria.

Judge's Criteria: {judge_criteria}

Project Information:
- README Content: {readme_content}
- Video Title: {video_title}
- Video Description: {video_description}

Please evaluate this project and respond with ONLY a valid JSON object in this exact format:
{{
    "score_innovation": <float between 0-10>,
    "score_impact": <float between 0-10>,
    "justification": "<detailed explanation of your evaluation>",
    "decision": "<ACCEPTED or REJECTED>"
}}"""
                
                # Call Cerebras AI for evaluation - UPDATED to use API key
                client = Cerebras(api_key=CEREBRAS_API_KEY)
                chat_completion = client.chat.completions.create(
                    messages=[{"role": "user", "content": prompt_for_ai}], 
                    model="llama-4-scout-17b-16e-instruct"
                )
                ai_evaluation_str = chat_completion.choices[0].message.content
                
                # Parse AI response
                try:
                    # Extract JSON from response
                    json_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', ai_evaluation_str, re.DOTALL)
                    if not json_match:
                        raise ValueError("No valid JSON found in AI response")
                    
                    json_str = json_match.group(0)
                    evaluation_data = json.loads(json_str)
                    
                    # Validate and extract scores
                    score_innovation = float(evaluation_data.get('score_innovation', 0))
                    score_impact = float(evaluation_data.get('score_impact', 0))
                    
                    # Clamp scores between 0 and 10
                    score_innovation = max(0.0, min(10.0, score_innovation))
                    score_impact = max(0.0, min(10.0, score_impact))
                    
                    new_submission.score_innovation = score_innovation
                    new_submission.score_impact = score_impact
                    new_submission.justification = evaluation_data.get('justification', 'No justification provided')
                    
                    decision = evaluation_data.get('decision', '').upper()
                    if decision == "ACCEPTED":
                        new_submission.status = "AI_ACCEPTED"
                    elif decision == "REJECTED":
                        new_submission.status = "AI_REJECTED"
                    else:
                        new_submission.status = "AI_PENDING"
                        new_submission.justification += f" (Note: Unclear decision: {decision})"
                    
                except (json.JSONDecodeError, ValueError, KeyError, TypeError) as parse_error:
                    new_submission.status = "AI_ERROR"
                    new_submission.justification = f"AI returned invalid format. Response: {ai_evaluation_str[:500]}"
                    print(f"Parse error: {parse_error}")
                
                db.session.commit()
                return jsonify({
                    "message": "Project submitted successfully!",
                    "submission_id": new_submission.id,
                    "status": new_submission.status
                }), 201

            except requests.exceptions.RequestException as req_error:
                # Handle service call errors
                db.session.rollback()
                new_submission.status = "SERVICE_ERROR"
                new_submission.justification = f"Failed to communicate with evaluation services: {str(req_error)}"
                db.session.commit()
                return jsonify({
                    "error": f"Service communication error: {str(req_error)}",
                    "submission_id": new_submission.id
                }), 500
                
            except Exception as e:
                # Handle all other errors
                db.session.rollback()
                new_submission.status = "SYSTEM_ERROR"
                new_submission.justification = f"An unexpected error occurred: {str(e)}"
                db.session.commit()
                print(f"System error: {traceback.format_exc()}")
                return jsonify({
                    "error": f"An unexpected error occurred: {str(e)}",
                    "submission_id": new_submission.id
                }), 500

        @app.route('/health', methods=['GET'])
        def health():
            """Health check endpoint for Render"""
            return jsonify({
                'status': 'healthy',
                'service': 'agent',
                'database': 'connected'
            }), 200

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)