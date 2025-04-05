import os
import time
from inference.imputation_service import ImputationService

imputation_service = ImputationService()

def process_csv_file(input_file_path, output_file_path, job_id):
    """
    Process a CSV file to impute missing values using the transformer model.
    This function is intended to be run in the background.
    
    Args:
        input_file_path (str): Path to the input CSV file
        output_file_path (str): Path where the imputed CSV should be saved
        job_id (str): Unique identifier for this job
    """
    try:
        # Log start of processing
        print(f"Starting processing job {job_id} for file {input_file_path}")
        start_time = time.time()
        
        # Perform imputation
        imputation_service.impute_csv(input_file_path, output_file_path)
        
        # Log completion
        end_time = time.time()
        processing_time = end_time - start_time
        print(f"Completed processing job {job_id} in {processing_time:.2f} seconds")
        
        # Clean up input file to save space
        try:
            os.remove(input_file_path)
            print(f"Deleted input file {input_file_path}")
        except Exception as e:
            print(f"Warning: Failed to delete input file {input_file_path}: {str(e)}")
            
    except Exception as e:
        # Log any errors
        print(f"Error processing job {job_id}: {str(e)}")
        
        # Clean up any files if possible
        for file_path in [input_file_path, output_file_path]:
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except Exception:
                    pass
        
        # Re-raise the exception to be handled by the caller
        raise