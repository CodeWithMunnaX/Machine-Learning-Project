import sys
import os
import pymongo
import certifi
from us_visa.constants import DATABASE_NAME, MONGODB_URL_KEY
from us_visa.exception import USVisaException
from us_visa.logger import logging

ca = certifi.where()

class MongoDBClient:
    client = None

    def __init__(self, database_name=DATABASE_NAME) -> None:
        try:
            if MongoDBClient.client is None:
                mongo_db_url = os.getenv(MONGODB_URL_KEY)
                if mongo_db_url is None:
                    logging.info(f"Environment key '{MONGODB_URL_KEY}' is not set. Data Access will fallback to local CSV.")
                    self.database = None
                    return
                MongoDBClient.client = pymongo.MongoClient(mongo_db_url, tlsCAFile=ca)
            self.client = MongoDBClient.client
            self.database = self.client[database_name]
            self.database_name = database_name
            logging.info("MongoDB connection successful")
        except Exception as e:
            logging.warning(f"Failed to connect to MongoDB: {str(e)}. Fallback will be used.")
            self.database = None

