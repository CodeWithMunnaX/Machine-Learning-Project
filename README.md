# 🇺🇸 US Visa Approval Prediction - End-to-End MLOps Project

## 📌 Project Overview
The **US Visa Approval Prediction** project is an end-to-end Machine Learning pipeline designed to predict whether an applicant\'s US Visa (specifically work visas like H-1B, PERM certification, etc.) will be **Certified** or **Denied** based on candidate profile, employer information, education, job details, and prevailing wage data.

---

## 🛠️ What We Have Done So Far (Project Setup & Progress)

### 1. ⚙️ Python & Conda Environment Configuration
- Configured and linked **Anaconda (Conda 26.5.3)** with Windows PowerShell and VS Code.
- Resolved PowerShell script execution restrictions via:
  \\powershell
  Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
  \- Configured User \PATH\ and PowerShell profile hooks (\profile.ps1\, \Microsoft.VSCode_profile.ps1\) for seamless terminal activation.
- Initialized Conda environment for the project:
  \\powershell
  conda create -n usvisa python=3.10 -y
  conda activate usvisa
  \
---

### 2. 🏗️ Project Template & Directory Architecture
Created and executed \	emplate.py\ to automatically scaffold the entire modular MLOps directory structure:


## 📋 Component Workflow & Responsibilities

| Component | Responsibility |
| :--- | :--- |
| **Data Ingestion** | Fetches data from MongoDB/Cloud, splits into Train/Test datasets, and saves into artifact directory. |
| **Data Validation** | Verifies columns, data types, and checks for dataset drift using \schema.yaml\. |
| **Data Transformation** | Handles categorical encoding, numerical scaling, missing values, and saves the preprocessor object. |
| **Model Trainer** | Trains various machine learning models (XGBoost, Random Forest, CatBoost, etc.) and performs hyperparameter tuning. |
| **Model Evaluation** | Compares newly trained model against the active production model to determine if it meets improvement threshold. |
| **Model Pusher** | Uploads the best validated model to AWS S3 bucket / production storage. |
| **Training Pipeline** | Automates end-to-end training runs from Ingestion to Pusher. |
| **Prediction Pipeline** | Loads preprocessor & model to return real-time predictions for new applicants. |

---

## 🗺️ Project Roadmap & Next Steps

- [x] **Step 1:** Setup Python & Conda Environment
- [x] **Step 2:** Scaffold Modular Project Architecture via \	emplate.py- [x] **Step 3:** Project Documentation & Architecture (\README.md\)
- [ ] **Step 4:** Implement Custom Logger (\logger/__init__.py\)
- [ ] **Step 5:** Implement Custom Exception Handling (\exception/__init__.py\)
- [ ] **Step 6:** Configure \setup.py\ and equirements.txt\ for local package installation
- [ ] **Step 7:** Exploratory Data Analysis (EDA) in Jupyter Notebook
- [ ] **Step 8:** MongoDB Atlas Data Upload & Data Access configuration
- [ ] **Step 9:** Build Data Ingestion Component
- [ ] **Step 10:** Build Data Validation & Drift Detection Component
- [ ] **Step 11:** Build Data Transformation Pipeline
- [ ] **Step 12:** Build Model Trainer & Hyperparameter Tuning
- [ ] **Step 13:** Model Evaluation & Pusher to Cloud
- [ ] **Step 14:** Build FastAPI Web Application & Prediction Endpoint
- [ ] **Step 15:** Dockerization & AWS CI/CD Deployment

---

## ⚡ How to Setup & Run Locally

1. **Activate Conda Environment:**
   \\powershell
   conda activate usvisa
   \
2. **Install Dependencies in Editable Mode:**
   \\powershell
   pip install -r requirements.txt
   \
3. **Run Web Application:**
   \\powershell
   python app.py
   \