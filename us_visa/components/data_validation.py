import os
import sys
import pandas as pd
from scipy.stats import ks_2samp
from pandas import DataFrame
from us_visa.entity.config_entity import DataValidationConfig
from us_visa.entity.artifact_entity import DataIngestionArtifact, DataValidationArtifact
from us_visa.utils.main_utils import read_yaml_file, write_yaml_file
from us_visa.exception import USVisaException
from us_visa.logger import logging

class DataValidation:
    def __init__(self, data_ingestion_artifact: DataIngestionArtifact,
                 data_validation_config: DataValidationConfig):
        try:
            self.data_ingestion_artifact = data_ingestion_artifact
            self.data_validation_config = data_validation_config
            self._schema_config = read_yaml_file(file_path=data_validation_config.schema_file_path)
        except Exception as e:
            raise USVisaException(e, sys)

    def validate_number_of_columns(self, dataframe: DataFrame) -> bool:
        """
        Validates if total columns in dataframe match schema specification
        """
        try:
            status = len(dataframe.columns) == len(self._schema_config["columns"])
            logging.info(f"Number of columns validation status: {status}")
            return status
        except Exception as e:
            raise USVisaException(e, sys)

    def is_column_exist(self, df: DataFrame) -> bool:
        """
        Validates whether all required columns exist in the dataframe
        """
        try:
            dataframe_columns = df.columns
            missing_numerical_columns = []
            missing_categorical_columns = []
            
            for column in self._schema_config["numerical_columns"]:
                if column not in dataframe_columns:
                    missing_numerical_columns.append(column)

            if len(missing_numerical_columns) > 0:
                logging.info(f"Missing numerical column: {missing_numerical_columns}")

            for column in self._schema_config["categorical_columns"]:
                if column not in dataframe_columns:
                    missing_categorical_columns.append(column)

            if len(missing_categorical_columns) > 0:
                logging.info(f"Missing categorical column: {missing_categorical_columns}")

            return False if len(missing_numerical_columns) > 0 or len(missing_categorical_columns) > 0 else True
        except Exception as e:
            raise USVisaException(e, sys)

    @staticmethod
    def read_data(file_path) -> DataFrame:
        try:
            return pd.read_csv(file_path)
        except Exception as e:
            raise USVisaException(e, sys)

    def detect_dataset_drift(self, reference_df: DataFrame, current_df: DataFrame) -> bool:
        """
        Checks for distribution drift using Kolmogorov-Smirnov test on numerical features
        """
        try:
            drift_report = {}
            drift_status = True
            
            for column in self._schema_config["numerical_columns"]:
                d1 = reference_df[column]
                d2 = current_df[column]
                is_same_dist = ks_2samp(d1, d2)
                
                # p-value threshold 0.05
                if is_same_dist.pvalue >= 0.05:
                    is_found = False
                else:
                    is_found = True
                    drift_status = False
                    
                drift_report[column] = {
                    "p_val": float(is_same_dist.pvalue),
                    "drift_status": is_found
                }

            drift_report_file_path = self.data_validation_config.drift_report_file_path
            os.makedirs(os.path.dirname(drift_report_file_path), exist_ok=True)
            write_yaml_file(file_path=drift_report_file_path, content=drift_report)
            logging.info(f"Drift report written to: {drift_report_file_path}")
            return drift_status
        except Exception as e:
            raise USVisaException(e, sys)

    def initiate_data_validation(self) -> DataValidationArtifact:
        """
        Initiates data validation pipeline
        """
        try:
            validation_error_msg = ""
            logging.info("Starting data validation...")
            train_df = DataValidation.read_data(file_path=self.data_ingestion_artifact.trained_file_path)
            test_df = DataValidation.read_data(file_path=self.data_ingestion_artifact.test_file_path)

            status = self.validate_number_of_columns(dataframe=train_df)
            if not status:
                validation_error_msg += "Columns are missing in training dataframe. "
            status = self.validate_number_of_columns(dataframe=test_df)
            if not status:
                validation_error_msg += "Columns are missing in test dataframe. "

            status = self.is_column_exist(df=train_df)
            if not status:
                validation_error_msg += "Required columns do not exist in train dataframe. "
            status = self.is_column_exist(df=test_df)
            if not status:
                validation_error_msg += "Required columns do not exist in test dataframe. "

            validation_status = len(validation_error_msg) == 0

            if validation_status:
                drift_status = self.detect_dataset_drift(reference_df=train_df, current_df=test_df)
                if not drift_status:
                    logging.info("Dataset drift detected between train and test distributions.")

            data_validation_artifact = DataValidationArtifact(
                validation_status=validation_status,
                message=validation_error_msg,
                drift_report_file_path=self.data_validation_config.drift_report_file_path
            )
            logging.info(f"Data validation artifact: {data_validation_artifact}")
            return data_validation_artifact
        except Exception as e:
            raise USVisaException(e, sys)

