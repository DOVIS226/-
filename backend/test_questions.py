# Test script for question creation API
# Run this after starting the backend server

import requests
import json

BASE_URL = "http://localhost:8000"

# Test 1: Create a single choice question
print("Test 1: Creating a single choice question...")
single_choice_data = {
    "question_type": "single_choice",
    "question_text": "Python 是哪一年发布的？",
    "score": 5.0,
    "difficulty": "medium",
    "options": [
        {"key": "A", "value": "1989"},
        {"key": "B", "value": "1991"},
        {"key": "C", "value": "1995"},
        {"key": "D", "value": "2000"}
    ],
    "correct_answer": "B",
    "answer_explanation": "Python 由 Guido van Rossum 于 1991 年首次发布。",
    "tags": ["编程语言", "历史"],
    "knowledge_points": ["Python基础"],
    "is_required": True
}

try:
    response = requests.post(f"{BASE_URL}/api/teacher/surveys/questions", json=single_choice_data)
    if response.status_code == 200:
        print("✓ Single choice question created successfully!")
        print(json.dumps(response.json(), indent=2, ensure_ascii=False))
    else:
        print(f"✗ Failed: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"✗ Error: {e}")

print("\n" + "="*50 + "\n")

# Test 2: Create a multiple choice question
print("Test 2: Creating a multiple choice question...")
multiple_choice_data = {
    "question_type": "multiple_choice",
    "question_text": "以下哪些是 Python 的特点？",
    "score": 10.0,
    "difficulty": "easy",
    "options": [
        {"key": "A", "value": "面向对象"},
        {"key": "B", "value": "解释型语言"},
        {"key": "C", "value": "编译型语言"},
        {"key": "D", "value": "动态类型"}
    ],
    "correct_answer": ["A", "B", "D"],
    "is_required": True
}

try:
    response = requests.post(f"{BASE_URL}/api/teacher/surveys/questions", json=multiple_choice_data)
    if response.status_code == 200:
        print("✓ Multiple choice question created successfully!")
        print(json.dumps(response.json(), indent=2, ensure_ascii=False))
    else:
        print(f"✗ Failed: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"✗ Error: {e}")

print("\n" + "="*50 + "\n")

# Test 3: Create a short answer question
print("Test 3: Creating a short answer question...")
short_answer_data = {
    "question_type": "short_answer",
    "question_text": "Python 中用于定义函数的关键字是 ______。",
    "score": 3.0,
    "difficulty": "easy",
    "correct_answer": "def",
    "is_required": True
}

try:
    response = requests.post(f"{BASE_URL}/api/teacher/surveys/questions", json=short_answer_data)
    if response.status_code == 200:
        print("✓ Short answer question created successfully!")
        print(json.dumps(response.json(), indent=2, ensure_ascii=False))
    else:
        print(f"✗ Failed: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"✗ Error: {e}")

print("\n" + "="*50)
print("All tests completed!")
