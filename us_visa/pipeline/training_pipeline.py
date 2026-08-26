import sys
from us_visa.entity.config_entity import (
    DataIngestionConfig,
    DataValidationConfig,
    DataTransformationConfig,
    ModelTrainerConfig,
    ModelEvaluationConfig,
    ModelPusherConfig
)
from us_visa.entity.artifact_entity import (
    DataIngestionArtifact,
    DataValidationArtifact,
    DataTransformationArtifact,
    ModelTrainerArtifact,
    ModelEvaluationArtifact,
    ModelPusherArtifact
)
from us_visa.components.data_ingestion import DataIngestion
from us_visa.components.data_validation import DataValidation
from us_visa.components.data_transformation import DataTransformation
from us_visa.components.model_trainer import ModelTrainer
from us_visa.components.model_evaluation import ModelEvaluation
from us_visa.components.model_pusher import ModelPusher
from us_visa.exception import USVisaException
from us_visa.logger import logging

class TrainPipeline:
    def __init__(self):
        self.data_ingestion_config = DataIngestionConfig()
        self.data_validation_config = DataValidationConfig()
        self.data_transformation_config = DataTransformationConfig()
        self.model_trainer_config = ModelTrainerConfig()
        self.model_evaluation_config = ModelEvaluationConfig()
        self.model_pusher_config = ModelPusherConfig()

    def start_data_ingestion(self) -> DataIngestionArtifact:
        try:
            logging.info("Calling Data Ingestion component...")
            data_ingestion = DataIngestion(data_ingestion_config=self.data_ingestion_config)
            data_ingestion_artifact = data_ingestion.initiate_data_ingestion()
            logging.info(f"Data Ingestion completed: {data_ingestion_artifact}")
            return data_ingestion_artifact
        except Exception as e:
            raise USVisaException(e, sys)

    def start_data_validation(self, data_ingestion_artifact: DataIngestionArtifact) -> DataValidationArtifact:
        try:
            logging.info("Calling Data Validation component...")
            data_validation = DataValidation(
                data_ingestion_artifact=data_ingestion_artifact,
                data_validation_config=self.data_validation_config
            )
            data_validation_artifact = data_validation.initiate_data_validation()
            logging.info(f"Data Validation completed: {data_validation_artifact}")
            return data_validation_artifact
        except Exception as e:
            raise USVisaException(e, sys)

    def start_data_transformation(self, data_ingestion_artifact: DataIngestionArtifact,
                                  data_validation_artifact: DataValidationArtifact) -> DataTransformationArtifact:
        try:
            logging.info("Calling Data Transformation component...")
            data_transformation = DataTransformation(
                data_validation_artifact=data_validation_artifact,
                data_transformation_config=self.data_transformation_config
            )
            data_transformation_artifact = data_transformation.initiate_data_transformation(
                data_ingestion_artifact=data_ingestion_artifact
            )
            logging.info(f"Data Transformation completed: {data_transformation_artifact}")
            return data_transformation_artifact
        except Exception as e:
            raise USVisaException(e, sys)

    def start_model_trainer(self, data_transformation_artifact: DataTransformationArtifact) -> ModelTrainerArtifact:
        try:
            logging.info("Calling Model Trainer component...")
            model_trainer = ModelTrainer(
                data_transformation_artifact=data_transformation_artifact,
                model_trainer_config=self.model_trainer_config
            )
            model_trainer_artifact = model_trainer.initiate_model_trainer()
            logging.info(f"Model Trainer completed: {model_trainer_artifact}")
            return model_trainer_artifact
        except Exception as e:
            raise USVisaException(e, sys)

    def start_model_evaluation(self, data_ingestion_artifact: DataIngestionArtifact,
                               model_trainer_artifact: ModelTrainerArtifact) -> ModelEvaluationArtifact:
        try:
            logging.info("Calling Model Evaluation component...")
            model_evaluation = ModelEvaluation(
                model_eval_config=self.model_evaluation_config,
                data_ingestion_artifact=data_ingestion_artifact,
                model_trainer_artifact=model_trainer_artifact
            )
            model_evaluation_artifact = model_evaluation.initiate_model_evaluation()
            logging.info(f"Model Evaluation completed: {model_evaluation_artifact}")
            return model_evaluation_artifact
        except Exception as e:
            raise USVisaException(e, sys)

    def start_model_pusher(self, model_evaluation_artifact: ModelEvaluationArtifact,
                           model_trainer_artifact: ModelTrainerArtifact,
                           data_transformation_artifact: DataTransformationArtifact) -> ModelPusherArtifact:
        try:
            logging.info("Calling Model Pusher component...")
            model_pusher = ModelPusher(
                model_pusher_config=self.model_pusher_config,
                model_evaluation_artifact=model_evaluation_artifact,
                model_trainer_artifact=model_trainer_artifact,
                data_transformation_artifact=data_transformation_artifact
            )
            model_pusher_artifact = model_pusher.initiate_model_pusher()
            logging.info(f"Model Pusher completed: {model_pusher_artifact}")
            return model_pusher_artifact
        except Exception as e:
            raise USVisaException(e, sys)

    def run_pipeline(self) -> None:
        try:
            logging.info("="*70)
            logging.info("STARTING COMPLETE TRAINING PIPELINE EXECUTION")
            logging.info("="*70)
            
            data_ingestion_artifact = self.start_data_ingestion()
            data_validation_artifact = self.start_data_validation(data_ingestion_artifact=data_ingestion_artifact)
            data_transformation_artifact = self.start_data_transformation(
                data_ingestion_artifact=data_ingestion_artifact,
                data_validation_artifact=data_validation_artifact
            )
            model_trainer_artifact = self.start_model_trainer(
                data_transformation_artifact=data_transformation_artifact
            )
            model_evaluation_artifact = self.start_model_evaluation(
                data_ingestion_artifact=data_ingestion_artifact,
                model_trainer_artifact=model_trainer_artifact
            )
            model_pusher_artifact = self.start_model_pusher(
                model_evaluation_artifact=model_evaluation_artifact,
                model_trainer_artifact=model_trainer_artifact,
                data_transformation_artifact=data_transformation_artifact
            )
            
            logging.info("="*70)
            logging.info("TRAINING PIPELINE EXECUTED SUCCESSFULLY")
            logging.info("="*70)
        except Exception as e:
            raise USVisaException(e, sys)

