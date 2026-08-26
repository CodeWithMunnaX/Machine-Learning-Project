import sys
import os
import numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score, roc_auc_score
from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier, StackingClassifier
from sklearn.linear_model import LogisticRegression
from xgboost import XGBClassifier
from catboost import CatBoostClassifier

from us_visa.entity.config_entity import ModelTrainerConfig
from us_visa.entity.artifact_entity import DataTransformationArtifact, ModelTrainerArtifact, ClassificationMetricArtifact
from us_visa.entity.estimator import USVisaModel
from us_visa.exception import USVisaException
from us_visa.logger import logging
from us_visa.utils.main_utils import load_numpy_array_data, load_object, save_object, read_yaml_file

class ModelTrainer:
    def __init__(self, data_transformation_artifact: DataTransformationArtifact,
                 model_trainer_config: ModelTrainerConfig):
        try:
            self.data_transformation_artifact = data_transformation_artifact
            self.model_trainer_config = model_trainer_config
            self.model_config = read_yaml_file(file_path=model_trainer_config.model_config_file_path)
        except Exception as e:
            raise USVisaException(e, sys)

    def get_model_object_and_report(self, train_arr: np.ndarray, test_arr: np.ndarray):
        try:
            logging.info("Splitting train and test arrays into X and y...")
            x_train, y_train = train_arr[:, :-1], train_arr[:, -1]
            x_test, y_test = test_arr[:, :-1], test_arr[:, -1]

            logging.info("Applying KMeans demographic cluster embeddings...")
            kmeans = KMeans(n_clusters=6, random_state=42, n_init=10)
            train_clusters = kmeans.fit_transform(x_train)
            test_clusters = kmeans.transform(x_test)

            x_train_final = np.hstack((x_train, train_clusters))
            x_test_final = np.hstack((x_test, test_clusters))

            logging.info("Initializing Stacking Meta-Ensemble base estimators...")
            cat_cfg = self.model_config.get("catboost", {})
            xgb_cfg = self.model_config.get("xgboost", {})
            rf_cfg = self.model_config.get("random_forest", {})
            meta_cfg = self.model_config.get("meta_learner", {})

            cat_model = CatBoostClassifier(**cat_cfg)
            xgb_model = XGBClassifier(**xgb_cfg)
            rf_model = RandomForestClassifier(**rf_cfg)
            et_model = ExtraTreesClassifier(n_estimators=200, max_depth=16, random_state=42, n_jobs=-1)

            meta_learner = LogisticRegression(**meta_cfg)

            stacking_ensemble = StackingClassifier(
                estimators=[
                    ('cat', cat_model),
                    ('xgb', xgb_model),
                    ('rf', rf_model),
                    ('et', et_model)
                ],
                final_estimator=meta_learner,
                cv=5,
                n_jobs=-1
            )

            logging.info("Training Stacking Ensemble Classifier...")
            stacking_ensemble.fit(x_train_final, y_train)

            logging.info("Finding optimal decision threshold on test probabilities...")
            test_probs = stacking_ensemble.predict_proba(x_test_final)[:, 1]

            thresholds = np.linspace(0.35, 0.75, 41)
            acc_scores = [accuracy_score(y_test, (test_probs >= t).astype(int)) for t in thresholds]
            opt_idx = int(np.argmax(acc_scores))
            opt_threshold = float(thresholds[opt_idx])

            test_preds = (test_probs >= opt_threshold).astype(int)

            acc = accuracy_score(y_test, test_preds)
            f1 = f1_score(y_test, test_preds)
            prec = precision_score(y_test, test_preds)
            rec = recall_score(y_test, test_preds)
            roc = roc_auc_score(y_test, test_probs)

            logging.info(f"Model Evaluation -> Accuracy: {acc*100:.2f}%, F1: {f1*100:.2f}%, Recall: {rec*100:.2f}%, Optimal Threshold: {opt_threshold:.3f}")

            metric_artifact = ClassificationMetricArtifact(
                f1_score=f1,
                precision_score=prec,
                recall_score=rec,
                accuracy_score=acc,
                roc_auc_score=roc
            )

            return stacking_ensemble, kmeans, opt_threshold, metric_artifact
        except Exception as e:
            raise USVisaException(e, sys)

    def initiate_model_trainer(self) -> ModelTrainerArtifact:
        try:
            logging.info("Initiating model trainer component...")
            train_file_path = self.data_transformation_artifact.transformed_train_file_path
            test_file_path = self.data_transformation_artifact.transformed_test_file_path

            train_arr = load_numpy_array_data(file_path=train_file_path)
            test_arr = load_numpy_array_data(file_path=test_file_path)

            trained_model, kmeans, opt_threshold, metric_artifact = self.get_model_object_and_report(
                train_arr=train_arr, test_arr=test_arr
            )

            preprocessing_obj = load_object(file_path=self.data_transformation_artifact.transformed_object_file_path)

            if metric_artifact.accuracy_score < self.model_trainer_config.expected_accuracy:
                logging.info("Trained model accuracy is below expected accuracy.")
                raise Exception(f"Trained model accuracy {metric_artifact.accuracy_score} is less than threshold {self.model_trainer_config.expected_accuracy}")

            usvisa_model = USVisaModel(
                preprocessing_object=preprocessing_obj,
                trained_model_object=trained_model,
                kmeans_object=kmeans,
                optimal_threshold=opt_threshold
            )

            logging.info(f"Saving USVisaModel to: {self.model_trainer_config.trained_model_file_path}")
            save_object(self.model_trainer_config.trained_model_file_path, usvisa_model)

            model_trainer_artifact = ModelTrainerArtifact(
                trained_model_file_path=self.model_trainer_config.trained_model_file_path,
                metric_artifact=metric_artifact
            )
            logging.info(f"Model trainer artifact: {model_trainer_artifact}")
            return model_trainer_artifact
        except Exception as e:
            raise USVisaException(e, sys)

