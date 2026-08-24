from us_visa.logger import logging
from us_visa.exception import USVisaException

# logging.info("Welcome to the US Visa Application Tracker!")

try:
    logging.info("Starting the US Visa Application Tracker...")
    # Your code logic here
except USVisaException as e:
    logging.error("An error occurred: %s", str(e))