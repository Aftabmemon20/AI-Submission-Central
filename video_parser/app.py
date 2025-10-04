# video_parser/app.py (The new, intelligent version)

from flask import Flask, request, jsonify
import yt_dlp

app = Flask(__name__)

@app.route('/parse-video', methods=['POST'])
def parse_video():
    data = request.get_json()
    video_url = data.get('video_link')

    if not video_url:
        return jsonify({"error": "video_link is required"}), 400

    # These options tell yt-dlp to NOT download the video,
    # but to only extract its metadata.
    ydl_opts = {
        'quiet': True,
        'extract_flat': True,
        'force_generic_extractor': True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # Extract the info from the YouTube URL
            info = ydl.extract_info(video_url, download=False)
            
            # Create a summary from the real title and description
            summary = {
                "title": info.get('title', 'N/A'),
                "description": info.get('description', 'N/A')
            }
            
            return jsonify({
                "success": True,
                "video_summary": summary
            })

    except Exception as e:
        # If the link is not a valid video, return a helpful error
        return jsonify({"success": False, "error": f"Could not process video link: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)