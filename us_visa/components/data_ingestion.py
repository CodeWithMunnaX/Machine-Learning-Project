import os
import sys
import pandas as pd
from pandas import DataFrame
from sklearn.model_selection import train_test_split
from us_visa.entity.config_entity import DataIngestionConfig
from us_visa.entity.artifact_entity import DataIngestionArtifact
from us_visa.data_access.usvisa_data import USvisaData
from us_visa.exception import USVisaException
from us_visa.logger import logging

class DataIngestion:
    def __init__(self, data_ingestion_config: DataIngestionConfig = DataIngestionConfig()):
        try:
            self.data_ingestion_config = data_ingestion_config
        except Exception as e:
            raise USVisaException(e, sys)

    def export_data_into_feature_store(self) -> DataFrame:
        """
        Exports data from MongoDB or local storage into feature store
        """
        try:
            logging.info("Exporting data from data access layer into feature store...")
            usvisa_data = USvisaData()
            dataframe = usvisa_data.export_collection_as_dataframe(
                collection_name=self.data_ingestion_config.collection_name
            )
            logging.info(f"Shape of dataframe: {dataframe.shape}")
            
            feature_store_file_path = self.data_ingestion_config.feature_store_file_path
            dir_path = os.path.dirname(feature_store_file_path)
            os.makedirs(dir_path, exist_ok=True)
            
            logging.info(f"Saving exported data into feature store path: {feature_store_file_path}")
            dataframe.to_csv(feature_store_file_path, index=False, header=True)
            return dataframe
        except Exception as e:
            raise USVisaException(e, sys)

    def split_data_as_train_test(self, dataframe: DataFrame) -> None:
        """
        Splits feature store dataframe into stratified train and test subsets
        """
        try:
            logging.info("Performing stratified train test split...")
            stratify_col = dataframe["case_status"] if "case_status" in dataframe.columns else None
            
            train_set, test_set = train_test_split(
                dataframe,
                test_size=self.data_ingestion_config.train_test_split_ratio,
                random_state=42,
                stratify=stratify_col
            )
            logging.info("Stratified train test split completed.")
            
            dir_path = os.path.dirname(self.data_ingestion_config.training_file_path)
            os.makedirs(dir_path, exist_ok=True)
            
            logging.info(f"Exporting train set to: {self.data_ingestion_config.training_file_path}")
            train_set.to_csv(self.data_ingestion_config.training_file_path, index=False, header=True)
            
            logging.info(f"Exporting test set to: {self.data_ingestion_config.testing_file_path}")
            test_set.to_csv(self.data_ingestion_config.testing_file_path, index=False, header=True)
        except Exception as e:
            raise USVisaException(e, sys)

    def initiate_data_ingestion(self) -> DataIngestionArtifact:
        """
        Initiates data ingestion sequence
        """
        try:
            logging.info("Initiating data ingestion component...")
            dataframe = self.export_data_into_feature_store()
            self.split_data_as_train_test(dataframe=dataframe)
            
            data_ingestion_artifact = DataIngestionArtifact(
                trained_file_path=self.data_ingestion_config.training_file_path,
                test_file_path=self.data_ingestion_config.testing_file_path
            )
            logging.info(f"Data ingestion artifact created: {data_ingestion_artifact}")
            return data_ingestion_artifact
        except Exception as e:
            raise USVisaException(e, sys)

