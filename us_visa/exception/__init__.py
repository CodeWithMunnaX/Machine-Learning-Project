import os
import sys

def error_message_detail(error, error_detail: sys):
    _, _, exc_tb = error_detail.exc_info()
    file_name = exc_tb.tb_frame.f_code.co_filename
    error_message = f"Error occurred in python script name [{file_name}] line number [{exc_tb.tb_lineno}] error message [{str(error)}]"
    return error_message


class USVisaException(Exception):
    def __init__(self, error_message, error_detail: sys):
        """
        :param error_message: error message in string format
        :param error_detail: sys module object
        """
        super().__init__(error_message)
        self.error_message = error_message_detail(
            error_message, error_detail=error_detail
        )

    def __str__(self):
        return self.error_message


# Alias for backward compatibility
USvisaException = USVisaException

