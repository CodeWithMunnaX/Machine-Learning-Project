import sys
import os
import datetime
import numpy as np
import pandas as pd
from pandas import DataFrame
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder, OrdinalEncoder, PowerTransformer
from sklearn.compose import ColumnTransformer

from us_visa.constants import TARGET_COLUMN, SCHEMA_FILE_PATH, CURRENT_YEAR
from us_visa.entity.config_entity import DataTransformationConfig
from us_visa.entity.artifact_entity import DataTransformationArtifact, DataValidationArtifact
from us_visa.exception import USVisaException
from us_visa.logger import logging
from us_visa.utils.main_utils import save_object, save_numpy_array_data, read_yaml_file

class DataTransformation:
    def __init__(self, data_validation_artifact: DataValidationArtifact,
                 data_transformation_config: DataTransformationConfig):
        try:
            self.data_validation_artifact = data_validation_artifact
            self.data_transformation_config = data_transformation_config
            self._schema_config = read_yaml_file(file_path=SCHEMA_FILE_PATH)
        except Exception as e:
            raise USVisaException(e, sys)

    @staticmethod
    def read_data(file_path) -> DataFrame:
        try:
            return pd.read_csv(file_path)
        except Exception as e:
            raise USVisaException(e, sys)

    @staticmethod
    def calculate_annual_wage(row):
        unit = row['unit_of_wage']
        wage = row['prevailing_wage']
        if unit == 'Hour':
            return wage * 2080
        elif unit == 'Week':
            return wage * 52
        elif unit == 'Month':
            return wage * 12
        return wage

    def apply_feature_engineering(self, df: DataFrame) -> DataFrame:
        """
        Applies domain-specific transformations and high-impact interaction features
        """
        try:
            df = df.copy()
            if 'no_of_employees' in df.columns:
                df['no_of_employees'] = df['no_of_employees'].abs()

            if 'yr_of_estab' in df.columns:
                df['company_age'] = CURRENT_YEAR - df['yr_of_estab']
                df['is_established_company'] = np.where(df['company_age'] >= 15, 'Y', 'N')

            if 'unit_of_wage' in df.columns and 'prevailing_wage' in df.columns:
                df['annual_prevailing_wage'] = df.apply(self.calculate_annual_wage, axis=1)

            if 'annual_prevailing_wage' in df.columns:
                df['wage_bracket'] = pd.cut(
                    df['annual_prevailing_wage'],
                    bins=[0, 50000, 100000, 150000, np.inf],
                    labels=['Low', 'Medium', 'High', 'Very High']
                ).astype(str)

            if 'no_of_employees' in df.columns:
                df['company_size_category'] = pd.cut(
                    df['no_of_employees'],
                    bins=[-1, 50, 250, 1000, 10000, np.inf],
                    labels=['Micro', 'Small', 'Medium', 'Large', 'Enterprise']
                ).astype(str)

            edu_rank_map = {'High School': 1, "Bachelor's": 2, "Master's": 3, 'Doctorate': 4}
            if 'education_of_employee' in df.columns:
                df['education_rank'] = df['education_of_employee'].map(edu_rank_map).fillna(2)
                if 'annual_prevailing_wage' in df.columns:
                    df['edu_wage_interaction'] = df['education_rank'] * np.log1p(df['annual_prevailing_wage'])

            if 'education_of_employee' in df.columns and 'annual_prevailing_wage' in df.columns:
                top_wage = df['annual_prevailing_wage'].quantile(0.75) if len(df) > 100 else 100000.0
                df['is_elite_candidate'] = np.where(
                    (df['education_of_employee'].isin(["Master's", "Doctorate"])) & 
                    (df['annual_prevailing_wage'] >= top_wage) &
                    (df['has_job_experience'] == 'Y'), 'Y', 'N'
                )

            if 'annual_prevailing_wage' in df.columns and 'company_age' in df.columns:
                df['wage_to_company_age_ratio'] = df['annual_prevailing_wage'] / (df['company_age'] + 1)

            if 'annual_prevailing_wage' in df.columns and 'no_of_employees' in df.columns:
                df['wage_per_employee'] = df['annual_prevailing_wage'] / (df['no_of_employees'] + 1)

            if 'region_of_employment' in df.columns and 'annual_prevailing_wage' in df.columns:
                if len(df) > 100:
                    regional_medians = df.groupby('region_of_employment')['annual_prevailing_wage'].transform('median')
                    df['region_wage_ratio'] = df['annual_prevailing_wage'] / regional_medians
                else:
                    df['region_wage_ratio'] = df['annual_prevailing_wage'] / 65000.0

            if 'education_rank' in df.columns and 'has_job_experience' in df.columns:
                exp_bonus = np.where(df['has_job_experience'] == 'Y', 1, 0)
                df['credential_strength_score'] = df['education_rank'] + exp_bonus

            if 'continent' in df.columns and 'education_of_employee' in df.columns:
                df['continent_edu_combo'] = df['continent'] + "_" + df['education_of_employee']

            drop_cols = [c for c in ['case_id', 'yr_of_estab', 'unit_of_wage', 'prevailing_wage', 'education_rank'] if c in df.columns]
            df.drop(columns=drop_cols, inplace=True)
            return df
        except Exception as e:
            raise USVisaException(e, sys)

    def get_data_transformer_object(self) -> ColumnTransformer:
        """
        Creates and returns preprocessor ColumnTransformer
        """
        try:
            logging.info("Creating data transformer object...")
            ordinal_features = ['education_of_employee', 'wage_bracket', 'company_size_category']
            categorical_features = [
                'continent', 'has_job_experience', 'requires_job_training',
                'region_of_employment', 'full_time_position', 'is_established_company',
                'is_elite_candidate', 'continent_edu_combo'
            ]
            numerical_features = [
                'no_of_employees', 'company_age', 'annual_prevailing_wage',
                'edu_wage_interaction', 'wage_to_company_age_ratio', 'wage_per_employee',
                'region_wage_ratio', 'credential_strength_score'
            ]

            preprocessor = ColumnTransformer(
                transformers=[
                    ('ord_pipe', Pipeline([
                        ('ord_enc', OrdinalEncoder(categories=[
                            ['High School', "Bachelor's", "Master's", 'Doctorate'],
                            ['Low', 'Medium', 'High', 'Very High'],
                            ['Micro', 'Small', 'Medium', 'Large', 'Enterprise']
                        ])),
                        ('scaler', StandardScaler())
                    ]), ordinal_features),
                    ('cat_pipe', Pipeline([
                        ('ohe', OneHotEncoder(drop='first', sparse_output=False, handle_unknown='ignore')),
                        ('scaler', StandardScaler())
                    ]), categorical_features),
                    ('num_pipe', Pipeline([
                        ('pt', PowerTransformer(method='yeo-johnson')),
                        ('scaler', StandardScaler())
                    ]), numerical_features)
                ]
            )
            logging.info("Data transformer object built successfully.")
            return preprocessor
        except Exception as e:
            raise USVisaException(e, sys)

    def initiate_data_transformation(self, data_ingestion_artifact) -> DataTransformationArtifact:
        """
        Initiates data transformation pipeline
        """
        try:
            if not self.data_validation_artifact.validation_status:
                raise Exception(self.data_validation_artifact.message)

            logging.info("Starting data transformation...")
            train_df = self.read_data(data_ingestion_artifact.trained_file_path)
            test_df = self.read_data(data_ingestion_artifact.test_file_path)

            logging.info("Applying feature engineering on train and test datasets...")
            train_df_feat = self.apply_feature_engineering(train_df)
            test_df_feat = self.apply_feature_engineering(test_df)

            target_mapping = {'Certified': 1, 'Denied': 0}
            
            input_feature_train_df = train_df_feat.drop(columns=[TARGET_COLUMN], axis=1)
            target_feature_train_df = train_df_feat[TARGET_COLUMN].map(target_mapping)

            input_feature_test_df = test_df_feat.drop(columns=[TARGET_COLUMN], axis=1)
            target_feature_test_df = test_df_feat[TARGET_COLUMN].map(target_mapping)

            logging.info("Fitting transformer object on training features...")
            preprocessor = self.get_data_transformer_object()
            
            input_feature_train_arr = preprocessor.fit_transform(input_feature_train_df)
            input_feature_test_arr = preprocessor.transform(input_feature_test_df)

            train_arr = np.c_[input_feature_train_arr, np.array(target_feature_train_df)]
            test_arr = np.c_[input_feature_test_arr, np.array(target_feature_test_df)]

            save_numpy_array_data(self.data_transformation_config.transformed_train_file_path, array=train_arr)
            save_numpy_array_data(self.data_transformation_config.transformed_test_file_path, array=test_arr)
            save_object(self.data_transformation_config.transformed_object_file_path, preprocessor)

            data_transformation_artifact = DataTransformationArtifact(
                transformed_object_file_path=self.data_transformation_config.transformed_object_file_path,
                transformed_train_file_path=self.data_transformation_config.transformed_train_file_path,
                transformed_test_file_path=self.data_transformation_config.transformed_test_file_path
            )
            logging.info(f"Data transformation artifact: {data_transformation_artifact}")
            return data_transformation_artifact
        except Exception as e:
            raise USVisaException(e, sys)

