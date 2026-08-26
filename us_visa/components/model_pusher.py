import sys
import os
import shutil
from us_visa.entity.config_entity import ModelPusherConfig
from us_visa.entity.artifact_entity import ModelPusherArtifact, ModelEvaluationArtifact, ModelTrainerArtifact, DataTransformationArtifact
from us_visa.constants import MODEL_FILE_NAME, PREPROCESSOR_FILE_NAME
from us_visa.exception import USVisaException
from us_visa.logger import logging

class ModelPusher:
    def __init__(self, model_pusher_config: ModelPusherConfig,
                 model_evaluation_artifact: ModelEvaluationArtifact,
                 model_trainer_artifact: ModelTrainerArtifact,
                 data_transformation_artifact: DataTransformationArtifact):
        try:
            self.model_pusher_config = model_pusher_config
            self.model_evaluation_artifact = model_evaluation_artifact
            self.model_trainer_artifact = model_trainer_artifact
            self.data_transformation_artifact = data_transformation_artifact
        except Exception as e:
            raise USVisaException(e, sys)

    def initiate_model_pusher(self) -> ModelPusherArtifact:
        try:
            logging.info("Initiating model pusher component...")
            if not self.model_evaluation_artifact.is_model_accepted:
                logging.info("Trained model was not accepted by model evaluation. Skipping model pusher.")
                return ModelPusherArtifact(saved_model_path="", model_pusher_dir="")

            # Local models directory
            saved_model_dir = self.model_pusher_config.saved_model_dir
            os.makedirs(saved_model_dir, exist_ok=True)

            target_model_path = os.path.join(saved_model_dir, MODEL_FILE_NAME)
            target_preprocessor_path = os.path.join(saved_model_dir, PREPROCESSOR_FILE_NAME)

            logging.info(f"Copying trained model to production path: {target_model_path}")
            shutil.copy(self.model_trainer_artifact.trained_model_file_path, target_model_path)

            logging.info(f"Copying preprocessor to production path: {target_preprocessor_path}")
            shutil.copy(self.data_transformation_artifact.transformed_object_file_path, target_preprocessor_path)

            model_pusher_artifact = ModelPusherArtifact(
                saved_model_path=target_model_path,
                model_pusher_dir=saved_model_dir
            )
            logging.info(f"Model pusher artifact: {model_pusher_artifact}")
            return model_pusher_artifact
        except Exception as e:
            raise USVisaException(e, sys)

