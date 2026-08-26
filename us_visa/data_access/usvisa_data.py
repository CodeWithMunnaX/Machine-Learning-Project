import sys
import os
import pandas as pd
import numpy as np
from typing import Optional
from us_visa.configuration.mongo_db_connection import MongoDBClient
from us_visa.constants import DATABASE_NAME, RAW_DATA_FALLBACK_PATH
from us_visa.exception import USVisaException
from us_visa.logger import logging

class USvisaData:
    """
    Exports US Visa data from MongoDB or falls back to local EasyVisa.csv
    """
    def __init__(self):
        try:
            self.mongo_client = MongoDBClient(database_name=DATABASE_NAME)
        except Exception as e:
            raise USVisaException(e, sys)

    def export_collection_as_dataframe(self, collection_name: str, database_name: Optional[str] = None) -> pd.DataFrame:
        try:
            logging.info(f"Exporting collection {collection_name} as dataframe...")
            df = None
            if self.mongo_client.database is not None:
                if database_name is None:
                    collection = self.mongo_client.database[collection_name]
                else:
                    collection = self.mongo_client.client[database_name][collection_name]

                records = list(collection.find())
                if len(records) > 0:
                    df = pd.DataFrame(records)
                    if "_id" in df.columns.to_list():
                        df = df.drop(columns=["_id"], axis=1)
                    df.replace({"na": np.nan}, inplace=True)
                    logging.info(f"Retrieved {len(df)} records from MongoDB.")

            if df is None or len(df) == 0:
                logging.info(f"Using local dataset fallback from: {RAW_DATA_FALLBACK_PATH}")
                if os.path.exists(RAW_DATA_FALLBACK_PATH):
                    df = pd.read_csv(RAW_DATA_FALLBACK_PATH)
                    logging.info(f"Retrieved {len(df)} records from local CSV.")
                else:
                    raise FileNotFoundError(f"Local dataset not found at {RAW_DATA_FALLBACK_PATH}")

            return df
        except Exception as e:
            raise USVisaException(e, sys)

