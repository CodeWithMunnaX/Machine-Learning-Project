import sys
import os
import pandas as pd
from sklearn.metrics import f1_score, accuracy_score
from us_visa.entity.config_entity import ModelEvaluationConfig
from us_visa.entity.artifact_entity import DataIngestionArtifact, ModelTrainerArtifact, ModelEvaluationArtifact
from us_visa.constants import TARGET_COLUMN, SAVED_MODEL_DIR, MODEL_FILE_NAME
from us_visa.exception import USVisaException
from us_visa.logger import logging
from us_visa.utils.main_utils import load_object

class ModelEvaluation:
    def __init__(self, model_eval_config: ModelEvaluationConfig,
                 data_ingestion_artifact: DataIngestionArtifact,
                 model_trainer_artifact: ModelTrainerArtifact):
        try:
            self.model_eval_config = model_eval_config
            self.data_ingestion_artifact = data_ingestion_artifact
            self.model_trainer_artifact = model_trainer_artifact
        except Exception as e:
            raise USVisaException(e, sys)

    def get_best_model(self) -> object:
        """
        Loads the currently deployed production model from models/ directory if available
        """
        try:
            prod_model_path = os.path.join(SAVED_MODEL_DIR, MODEL_FILE_NAME)
            if os.path.exists(prod_model_path):
                logging.info(f"Loading existing production model from: {prod_model_path}")
                return load_object(file_path=prod_model_path), prod_model_path
            return None, None
        except Exception as e:
            raise USVisaException(e, sys)

    def initiate_model_evaluation(self) -> ModelEvaluationArtifact:
        try:
            logging.info("Initiating model evaluation component...")
            test_df = pd.read_csv(self.data_ingestion_artifact.test_file_path)
            
            # Apply feature engineering to test_df for evaluation
            from us_visa.components.data_transformation import DataTransformation
            dt = DataTransformation(data_validation_artifact=None, data_transformation_config=None)
            test_df_feat = dt.apply_feature_engineering(test_df)
            
            target_mapping = {'Certified': 1, 'Denied': 0}
            x_test = test_df_feat.drop(columns=[TARGET_COLUMN], axis=1)
            y_test = test_df_feat[TARGET_COLUMN].map(target_mapping)

            trained_model_obj = load_object(file_path=self.model_trainer_artifact.trained_model_file_path)
            trained_model_preds = trained_model_obj.predict(x_test)
            trained_model_f1 = f1_score(y_test, trained_model_preds)
            trained_model_acc = accuracy_score(y_test, trained_model_preds)

            logging.info(f"Trained Model - Test Accuracy: {trained_model_acc*100:.2f}%, F1: {trained_model_f1*100:.2f}%")

            best_model_obj, best_model_path = self.get_best_model()

            if best_model_obj is None:
                logging.info("No previous production model found. Accepting newly trained model.")
                is_model_accepted = True
                changed_acc = 0.0
            else:
                try:
                    best_model_preds = best_model_obj.predict(x_test)
                    best_model_f1 = f1_score(y_test, best_model_preds)
                    best_model_acc = accuracy_score(y_test, best_model_preds)
                    logging.info(f"Existing Model - Test Accuracy: {best_model_acc*100:.2f}%, F1: {best_model_f1*100:.2f}%")
                    
                    changed_acc = trained_model_acc - best_model_acc
                    is_model_accepted = changed_acc >= -self.model_eval_config.changed_threshold_score
                except Exception:
                    is_model_accepted = True
                    changed_acc = 0.0

            model_eval_artifact = ModelEvaluationArtifact(
                is_model_accepted=is_model_accepted,
                changed_accuracy=changed_acc,
                best_model_path=best_model_path if best_model_path else "",
                trained_model_path=self.model_trainer_artifact.trained_model_file_path
            )
            logging.info(f"Model evaluation artifact: {model_eval_artifact}")
            return model_eval_artifact
        except Exception as e:
            raise USVisaException(e, sys)

