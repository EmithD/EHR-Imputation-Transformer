import os
import pandas as pd
import torch
import pickle
from torch.utils.data import DataLoader, TensorDataset
import gc

class ImputationService:
    def __init__(self):
        """
        Initialize the ImputationService with the pre-trained model.
        The model is loaded lazily when needed.
        """
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = None
        self.scaler = None
        
        # Paths to model and scaler files - adjust as needed
        self.model_path = os.environ.get("MODEL_PATH", "models/tabular_transformer_relpos.pth")
        self.scaler_path = os.environ.get("SCALER_PATH", "models/scaler.pkl")
        
        print(f"ImputationService initialized. Using device: {self.device}")
        print(f"Model path: {self.model_path}")
        print(f"Scaler path: {self.scaler_path}")
    
    def _load_model(self):
        """
        Load the pre-trained model and scaler.
        """
        try:
            print("Loading model and scaler...")
            
            # Load the model
            checkpoint = torch.load(self.model_path, map_location=self.device)
            
            # Determine which model class to use based on the saved configuration
            if checkpoint.get("model_type") == "ensemble":
                from models.transformer_model import EnsembleModel
                
                # Create an instance of the ensemble model
                config = checkpoint["config"]
                num_features = config.get("num_features", 39)  # Default to 39 if not stored
                
                self.model = EnsembleModel(
                    num_features=num_features,
                    config=config,
                    num_models=3  # Default ensemble size from the notebook
                ).to(self.device)
            else:
                # Default to single model
                from models.transformer_model import TabularTransformerWithRelPos
                
                # Create an instance of the transformer model
                config = checkpoint["config"]
                num_features = config.get("num_features", 39)  # Default to 39 if not stored
                
                self.model = TabularTransformerWithRelPos(
                    num_features=num_features,
                    d_model=config["d_model"],
                    nhead=config["num_heads"],
                    num_layers=config["num_layers"],
                    dim_feedforward=config["dim_feedforward"],
                    dropout=config["dropout"],
                    activation=config["activation"],
                    max_seq_len=max(2 * num_features, 100)
                ).to(self.device)
            
            # Load the model weights
            self.model.load_state_dict(checkpoint["model_state_dict"])
            self.model.eval()
            
            # Load the scaler
            with open(self.scaler_path, 'rb') as f:
                self.scaler = pickle.load(f)
            
            print("Model and scaler loaded successfully")
            
        except Exception as e:
            print(f"Error loading model: {str(e)}")
            raise
    
    def _ensure_model_loaded(self):
        """
        Ensure the model and scaler are loaded.
        """
        if self.model is None or self.scaler is None:
            self._load_model()
    
    def impute_csv(self, input_file_path, output_file_path, batch_size=128):
        """
        Impute missing values in a CSV file using the trained transformer model.
        
        Args:
            input_file_path (str): Path to the input CSV file
            output_file_path (str): Path where the imputed CSV should be saved
            batch_size (int): Batch size for processing large files
        """
        try:
            # Ensure the model is loaded
            self._ensure_model_loaded()
            
            # Load the CSV file
            print(f"Loading CSV file from {input_file_path}...")
            df_original = pd.read_csv(input_file_path, index_col=None)
            print(f"Loaded CSV with shape: {df_original.shape}")
            
            # Check for missing values
            missing_count = df_original.isna().sum().sum()
            missing_percentage = (missing_count / (df_original.shape[0] * df_original.shape[1])) * 100
            print(f"Dataset contains {missing_count} missing values ({missing_percentage:.2f}% of all values)")
            
            # Create a copy for imputation
            df_imputed = df_original.copy()
            
            # Process in batches if the dataset is large
            if len(df_original) > batch_size:
                print(f"Processing large dataset in batches of {batch_size}...")
                
                # Process each numerical column
                numerical_cols = df_original.select_dtypes(include=['number']).columns
                
                # Get indices of rows with missing values
                rows_with_missing = df_original[numerical_cols].isna().any(axis=1)
                rows_to_process = rows_with_missing[rows_with_missing].index
                
                if len(rows_to_process) == 0:
                    print("No missing values found in numerical columns")
                    df_original.to_csv(output_file_path)
                    return
                
                # Process in batches
                for i in range(0, len(rows_to_process), batch_size):
                    batch_indices = rows_to_process[i:i+batch_size]
                    print(f"Processing batch {i//batch_size + 1} with {len(batch_indices)} rows")
                    
                    # Get batch data
                    batch_df = df_original.loc[batch_indices, numerical_cols]
                    
                    # Create mask for missing values (1 where missing, 0 otherwise)
                    mask = batch_df.isna().astype(int)
                    
                    # Fill missing with zeros for processing
                    batch_df_filled = batch_df.fillna(0)
                    
                    # Scale the data
                    batch_data_scaled = self.scaler.transform(batch_df_filled)
                    
                    # Convert to tensors
                    batch_tensor = torch.tensor(batch_data_scaled, dtype=torch.float32).to(self.device)
                    mask_tensor = torch.tensor(mask.values, dtype=torch.int).to(self.device)
                    column_indices = torch.arange(batch_tensor.shape[1]).to(self.device)
                    
                    # Perform imputation
                    with torch.no_grad():
                        imputed_tensor = self.model(batch_tensor, column_indices, mask_tensor)
                        
                    # Convert back to numpy and original scale
                    imputed_np = imputed_tensor.cpu().numpy()
                    imputed_np = self.scaler.inverse_transform(imputed_np)
                    
                    # Create DataFrame with imputed values
                    imputed_batch_df = pd.DataFrame(imputed_np, columns=numerical_cols, index=batch_indices)
                    
                    # Update only the missing values in the original
                    for col in numerical_cols:
                        missing_mask = mask[col] == 1
                        if missing_mask.any():
                            df_imputed.loc[batch_indices[missing_mask], col] = imputed_batch_df.loc[batch_indices[missing_mask], col]
                    
                    # Clear GPU memory
                    del batch_tensor, mask_tensor, imputed_tensor
                    torch.cuda.empty_cache() if torch.cuda.is_available() else None
                    gc.collect()
            
            else:
                # Process the entire dataset at once
                print("Processing entire dataset at once...")
                
                # Process each numerical column
                numerical_cols = df_original.select_dtypes(include=['number']).columns
                
                # Create mask for missing values (1 where missing, 0 otherwise)
                mask = df_original[numerical_cols].isna().astype(int)
                
                # Fill missing with zeros for processing
                df_filled = df_original[numerical_cols].fillna(0)
                
                # Scale the data
                data_scaled = self.scaler.transform(df_filled)
                
                # Convert to tensors
                data_tensor = torch.tensor(data_scaled, dtype=torch.float32).to(self.device)
                mask_tensor = torch.tensor(mask.values, dtype=torch.int).to(self.device)
                column_indices = torch.arange(data_tensor.shape[1]).to(self.device)
                
                # Perform imputation
                with torch.no_grad():
                    imputed_tensor = self.model(data_tensor, column_indices, mask_tensor)
                    
                # Convert back to numpy and original scale
                imputed_np = imputed_tensor.cpu().numpy()
                imputed_np = self.scaler.inverse_transform(imputed_np)
                
                # Create DataFrame with imputed values
                imputed_df_nums = pd.DataFrame(imputed_np, columns=numerical_cols, index=df_original.index)
                
                # Update only the missing values in the original
                for col in numerical_cols:
                    missing_mask = mask[col] == 1
                    if missing_mask.any():
                        df_imputed.loc[missing_mask, col] = imputed_df_nums.loc[missing_mask, col]
            
            # Save the imputed dataset
            print(f"Saving imputed dataset to {output_file_path}...")
            df_imputed.to_csv(output_file_path)
            
            # Verification
            missing_after = df_imputed[numerical_cols].isna().sum().sum()
            print(f"Missing values in numerical columns after imputation: {missing_after}")
            
            return True
            
        except Exception as e:
            print(f"Error during imputation: {str(e)}")
            raise