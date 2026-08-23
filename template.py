import os
from pathlib import Path
import logging

# Configure logging format
logging.basicConfig(level=logging.INFO, format='[%(asctime)s]: %(message)s:')

project_name = "us_visa"

list_of_files = [
    f"{project_name}/__init__.py",
    
    # 1. Components (Core ML stages)
    f"{project_name}/components/__init__.py",
    f"{project_name}/components/data_ingestion.py",  
    f"{project_name}/components/data_validation.py",
    f"{project_name}/components/data_transformation.py",
    f"{project_name}/components/model_trainer.py",
    f"{project_name}/components/model_evaluation.py",
    f"{project_name}/components/model_pusher.py",
    
    # 2. Configuration & Data Access
    f"{project_name}/configuration/__init__.py",
    f"{project_name}/configuration/mongo_db_connection.py",
    f"{project_name}/configuration/aws_connection.py",
    f"{project_name}/cloud_storage/__init__.py",
    f"{project_name}/cloud_storage/s3_syncer.py",
    f"{project_name}/data_access/__init__.py",
    f"{project_name}/data_access/usvisa_data.py",
    
    # 3. Constants & Entities
    f"{project_name}/constants/__init__.py",
    f"{project_name}/entity/__init__.py",
    f"{project_name}/entity/config_entity.py",
    f"{project_name}/entity/artifact_entity.py",
    f"{project_name}/entity/estimator.py",
    f"{project_name}/entity/s3_estimator.py",
    
    # 4. Exception & Logger
    f"{project_name}/exception/__init__.py",
    f"{project_name}/logger/__init__.py",
    
    # 5. Pipeline (Fixed spelling: pipeline)
    f"{project_name}/pipeline/__init__.py",
    f"{project_name}/pipeline/training_pipeline.py",
    f"{project_name}/pipeline/prediction_pipeline.py",
    
    # 6. Utilities
    f"{project_name}/utils/__init__.py",
    f"{project_name}/utils/main_utils.py",
    
    # 7. Experimentation / Notebooks
    "notebook/EDA.ipynb",
    "notebook/model_training.ipynb",
    
    # 8. Configurations & Deployments
    "config/model.yaml",
    "config/schema.yaml",
    "app.py",
    "requirements.txt",
    "Dockerfile",
    ".dockerignore",
    ".gitignore",
    "README.md",
    "demo.py",
    "setup.py",
]

for filepath in list_of_files:
    filepath = Path(filepath)  # Handles cross-platform slashes (Windows / Linux)
    filedir, filename = os.path.split(filepath)

    if filedir != "":
        os.makedirs(filedir, exist_ok=True)
        logging.info(f"Creating directory: {filedir} for the file: {filename}")

    # Create file only if it doesn't exist or is empty (avoids overwriting existing code)
    if (not os.path.exists(filepath)) or (os.path.getsize(filepath) == 0):
        with open(filepath, "w") as f:
            pass
        logging.info(f"Creating empty file: {filepath}")
    else:
        logging.info(f"{filename} already exists")