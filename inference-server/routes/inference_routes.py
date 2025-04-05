from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse
import os
import uuid
from controllers.inference_controller import process_csv_file

router = APIRouter(tags=["Inference"])

UPLOAD_DIR = "temp/uploads"
RESULTS_DIR = "temp/results"

#if no dirs
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)

@router.post("/impute/")
async def impute_data(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    """
    Upload a CSV file with missing values for imputation.
    Returns a job ID that can be used to check status and download results.
    """
    # Generate a unique ID for this job
    job_id = str(uuid.uuid4())
    
    # Save the uploaded file
    file_path = os.path.join(UPLOAD_DIR, f"{job_id}_{file.filename}")
    
    try:
        # Write file to disk in chunks to handle large files
        with open(file_path, "wb") as f:
            # Read and write in chunks of 1MB
            chunk_size = 1024 * 1024
            while chunk := await file.read(chunk_size):
                f.write(chunk)
        
        # Process the file in the background
        output_path = os.path.join(RESULTS_DIR, f"{job_id}_imputed_{file.filename}")
        background_tasks.add_task(
            process_csv_file,
            file_path,
            output_path,
            job_id
        )
        
        return {
            "job_id": job_id,
            "message": "File uploaded successfully and being processed",
            "status": "processing"
        }
    
    except Exception as e:
        # Clean up if there's an error
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@router.get("/impute/{job_id}/status")
async def check_imputation_status(job_id: str):
    """
    Check the status of an imputation job.
    """
    # Look for result file to see if job is done
    result_file = None
    for filename in os.listdir(RESULTS_DIR):
        if filename.startswith(f"{job_id}_imputed_"):
            result_file = filename
            break
    
    if result_file:
        return {
            "job_id": job_id,
            "status": "completed",
            "result_file": result_file
        }
    
    # Check if job is still in progress (input file exists)
    input_file = None
    for filename in os.listdir(UPLOAD_DIR):
        if filename.startswith(f"{job_id}_"):
            input_file = filename
            break
    
    if input_file:
        return {
            "job_id": job_id,
            "status": "processing"
        }
    
    # If neither input nor output file exists, the job does not exist
    raise HTTPException(status_code=404, detail=f"Job {job_id} not found")

@router.get("/impute/{job_id}/download")
async def download_imputed_data(job_id: str):
    """
    Download the imputed data file once processing is complete.
    """
    # Look for result file
    result_file = None
    for filename in os.listdir(RESULTS_DIR):
        if filename.startswith(f"{job_id}_imputed_"):
            result_file = filename
            break
    
    if not result_file:
        raise HTTPException(status_code=404, detail=f"Results for job {job_id} not found")
    
    file_path = os.path.join(RESULTS_DIR, result_file)
    
    # Return the file for download
    return FileResponse(
        path=file_path,
        filename=result_file.replace(f"{job_id}_imputed_", ""),
        media_type="text/csv"
    )
    
@router.delete("/impute/{job_id}")
async def delete_job_files(job_id: str):
    """
    Delete job files to free up space.
    """
    deleted_files = []
    
    # Delete input file if it exists
    for filename in os.listdir(UPLOAD_DIR):
        if filename.startswith(f"{job_id}_"):
            file_path = os.path.join(UPLOAD_DIR, filename)
            os.remove(file_path)
            deleted_files.append(filename)
    
    # Delete output file if it exists
    for filename in os.listdir(RESULTS_DIR):
        if filename.startswith(f"{job_id}_imputed_"):
            file_path = os.path.join(RESULTS_DIR, filename)
            os.remove(file_path)
            deleted_files.append(filename)
    
    if not deleted_files:
        raise HTTPException(status_code=404, detail=f"No files found for job {job_id}")
    
    return {
        "job_id": job_id,
        "deleted_files": deleted_files,
        "message": "Job files deleted successfully"
    }