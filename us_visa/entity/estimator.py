import sys
import pandas as pd
import numpy as np
from pandas import DataFrame
from sklearn.pipeline import Pipeline
from us_visa.exception import USVisaException
from us_visa.logger import logging

class TargetValueMapping:
    def __init__(self):
        self.Certified: int = 1
        self.Denied: int = 0

    def _asdict(self):
        return self.__dict__

    def reverse_mapping(self):
        mapping_response = self._asdict()
        return dict(zip(mapping_response.values(), mapping_response.keys()))

class USVisaModel:
    def __init__(self, preprocessing_object: Pipeline, trained_model_object: object, kmeans_object: object = None, optimal_threshold: float = 0.50):
        """
        :param preprocessing_object: fitted ColumnTransformer / Pipeline
        :param trained_model_object: fitted model estimator
        :param kmeans_object: fitted KMeans clustering model (optional)
        :param optimal_threshold: tuned decision probability threshold
        """
        self.preprocessing_object = preprocessing_object
        self.trained_model_object = trained_model_object
        self.kmeans_object = kmeans_object
        self.optimal_threshold = optimal_threshold

    def predict(self, dataframe: DataFrame) -> np.ndarray:
        """
        Transforms input DataFrame and predicts binary labels using optimal threshold
        """
        try:
            logging.info("Starting prediction with USVisaModel")
            transformed_feature = self.preprocessing_object.transform(dataframe)
            
            if self.kmeans_object is not None:
                cluster_features = self.kmeans_object.transform(transformed_feature)
                transformed_feature = np.hstack((transformed_feature, cluster_features))
                
            probabilities = self.trained_model_object.predict_proba(transformed_feature)[:, 1]
            predictions = (probabilities >= self.optimal_threshold).astype(int)
            return predictions
        except Exception as e:
            raise USVisaException(e, sys) from e

    def predict_proba(self, dataframe: DataFrame) -> np.ndarray:
        """
        Transforms input DataFrame and returns probabilities for class 1 (Certified)
        """
        try:
            transformed_feature = self.preprocessing_object.transform(dataframe)
            if self.kmeans_object is not None:
                cluster_features = self.kmeans_object.transform(transformed_feature)
                transformed_feature = np.hstack((transformed_feature, cluster_features))
            return self.trained_model_object.predict_proba(transformed_feature)
        except Exception as e:
            raise USVisaException(e, sys) from e

    def __repr__(self):
        return f"{type(self.trained_model_object).__name__}()"

    def __str__(self):
        return f"{type(self.trained_model_object).__name__}()"

