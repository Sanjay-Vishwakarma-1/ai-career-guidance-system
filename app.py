import os
import pandas as pd
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Load data once
career_data = pd.read_csv("career_data.csv")
roadmap_data = pd.read_csv("roadmap_data.csv")


def clean_list(text):
    """Convert comma-separated string to cleaned list of skills."""
    return [x.strip().lower() for x in str(text).split(",") if x.strip()]


@app.route("/")
def home():
    careers = career_data["Career"].tolist()
    return render_template("index.html", careers=careers)


@app.route("/recommend", methods=["POST"])
def recommend():
    data = request.json

    name = data.get("name", "")
    year = data.get("year", "")
    career = data.get("career", "")
    user_skills = clean_list(data.get("skills", ""))

    row = career_data[career_data["Career"] == career]

    if row.empty:
        return jsonify({"error": "Career not found"})

    required_skills = clean_list(row.iloc[0]["Required_Skills"])

    # Compare user skills with required skills
    user_skills_lower = [s.lower() for s in user_skills]
    required_skills_lower = [s.lower() for s in required_skills]

    learned_skills = [
        skill for skill in required_skills
        if skill.lower() in user_skills_lower
    ]
    missing_skills = [
        skill for skill in required_skills
        if skill.lower() not in user_skills_lower
    ]

    # Calculate match score
    if required_skills:
        score = int((len(learned_skills) / len(required_skills)) * 100)
    else:
        score = 0

    # Get roadmap for this career
    roadmap = roadmap_data[roadmap_data["Career"] == career].to_dict(orient="records")

    return jsonify({
        "name": name,
        "year": year,
        "career": career,
        "required_skills": required_skills,
        "learned_skills": learned_skills,
        "missing_skills": missing_skills,
        "score": score,
        "roadmap": roadmap
    })


if __name__ == "__main__":
    app.run(debug=True)