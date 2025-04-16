import torch
import torch.nn as nn
import torch.nn.functional as F
import math

class FeatureCorrelationModule(nn.Module):
    """
    A module that explicitly models feature correlations to better handle MNAR scenarios.
    """
    def __init__(self, num_features, d_model, dropout=0.1):
        super().__init__()
        self.correlation_proj = nn.Linear(d_model, d_model)
        self.feature_gate = nn.Sequential(
            nn.Linear(d_model, d_model),
            nn.Sigmoid()
        )
        self.correlation_norm = nn.LayerNorm(d_model)
        self.dropout = nn.Dropout(dropout)
        
    def forward(self, x, mask=None):
        """
        Args:
            x: Input features [batch_size, num_features, d_model]
            mask: Missing value mask [batch_size, num_features]
            
        Returns:
            Correlation-enhanced features
        """
        batch_size, num_features, d_model = x.size()
        
        # Project features for correlation computation
        x_proj = self.correlation_proj(x)
        
        # Compute pairwise feature correlations (scaled dot-product)
        corr_matrix = torch.bmm(x_proj, x_proj.transpose(1, 2)) / math.sqrt(d_model)
        
        # If we have a mask, adjust correlation for missing values
        if mask is not None:
            # Create attention mask (1 for observed values, 0 for missing)
            obs_mask = 1 - mask.float()
            mask_matrix = torch.bmm(obs_mask.unsqueeze(2), obs_mask.unsqueeze(1))
            
            # Apply mask to correlation matrix (masked positions get -1e9)
            masked_corr = corr_matrix.masked_fill(mask_matrix == 0, -1e9)
            
            # Softmax to get normalized correlation weights
            corr_weights = F.softmax(masked_corr, dim=-1)
        else:
            corr_weights = F.softmax(corr_matrix, dim=-1)
        
        # Apply correlation weights to propagate information across features
        corr_features = torch.bmm(corr_weights, x)
        
        # Compute feature-specific gates to control information flow
        gates = self.feature_gate(x)
        
        # Gate the correlation features and apply residual connection
        gated_corr = gates * corr_features
        enhanced_features = x + self.dropout(gated_corr)
        
        # Apply layer normalization
        enhanced_features = self.correlation_norm(enhanced_features)
        
        return enhanced_features

class FeatureValueDependentEncoder(nn.Module):
    """
    A module that explicitly models the relationship between feature values and missingness,
    which is crucial for MNAR scenarios.
    """
    def __init__(self, d_model, dropout=0.1):
        super().__init__()
        # Increase capacity of the value encoder with one more layer
        self.value_encoder = nn.Sequential(
            nn.Linear(d_model, d_model),
            nn.GELU(),
            nn.Dropout(dropout),  # Add dropout for regularization
            nn.Linear(d_model, d_model),
            nn.GELU(),  # Add one more non-linearity
            nn.Linear(d_model, d_model),  # Add one more layer
            nn.LayerNorm(d_model)
        )
        
        # Enhance missingness encoder to better capture patterns
        self.missingness_encoder = nn.Sequential(
            nn.Linear(1, d_model // 2),
            nn.GELU(),
            nn.Dropout(dropout),  # Add dropout for regularization
            nn.Linear(d_model // 2, d_model),
            nn.LayerNorm(d_model)
        )
        
        # Add attention mechanism for better fusion
        self.attention = nn.MultiheadAttention(d_model, num_heads=4, dropout=dropout)
        
        # Enhanced fusion layer
        self.fusion_layer = nn.Sequential(
            nn.Linear(d_model * 2, d_model),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(d_model, d_model),
            nn.LayerNorm(d_model)
        )
        
    def forward(self, x, mask=None):
        """
        Args:
            x: Input features [batch_size, num_features, d_model]
            mask: Missing value mask [batch_size, num_features]
            
        Returns:
            Features with enhanced MNAR understanding
        """
        # Encode feature values
        value_encoding = self.value_encoder(x)
        
        # If we have a mask, encode missingness patterns
        if mask is not None:
            # Encode missingness (expanded to match d_model dimension)
            mask_encoding = self.missingness_encoder(mask.float().unsqueeze(-1))

            # Reshape for attention: [seq_len, batch_size, d_model]
            batch_size, num_features, d_model = value_encoding.size()
            v_enc = value_encoding.transpose(0, 1)
            m_enc = mask_encoding.transpose(0, 1)

            attn_output, _ = self.attention(m_enc, v_enc, v_enc)

            attn_output = attn_output.transpose(0, 1)

            mask_encoding = mask_encoding + attn_output
            
            combined = torch.cat([value_encoding, mask_encoding], dim=-1)
            enhanced = self.fusion_layer(combined)
        else:
            # Without mask, just use value encoding
            enhanced = value_encoding
            
        return enhanced

class RelativePositionEncoding(nn.Module):
    """
    Learnable relative position encoding for features in the transformer model.
    This allows the model to understand relationships between features based on their positions.
    """
    def __init__(self, max_seq_len, d_model):
        super().__init__()
        # Create a learnable embedding for relative positions
        self.rel_pos_embedding = nn.Parameter(torch.randn(2 * max_seq_len - 1, d_model))
        self.max_seq_len = max_seq_len
        
    def forward(self, x):
        """
        Apply relative positional encodings to the input.
        
        Args:
            x: Input tensor [batch_size, seq_len, d_model]
            
        Returns:
            Tensor with relative positional information.
        """
        seq_len = x.size(1)
        # Create position indices matrix
        pos_indices = torch.arange(seq_len, device=x.device)
        # Calculate relative positions: for each position i, calculate its relative distance to each position j
        rel_pos_indices = pos_indices.unsqueeze(1) - pos_indices.unsqueeze(0) + self.max_seq_len - 1
        
        # Get embeddings for each relative position
        rel_pos_encoded = self.rel_pos_embedding[rel_pos_indices]
        
        return rel_pos_encoded
    
class MultiHeadAttentionWithRelPos(nn.Module):
    """
    Multi-head attention with relative positional encoding.
    """
    def __init__(self, d_model, num_heads, dropout=0.1, max_seq_len=1000):
        super().__init__()
        assert d_model % num_heads == 0, "d_model must be divisible by num_heads"
        
        self.d_model = d_model
        self.num_heads = num_heads
        self.head_dim = d_model // num_heads
        
        # Linear projections for Q, K, V
        self.q_proj = nn.Linear(d_model, d_model)
        self.k_proj = nn.Linear(d_model, d_model)
        self.v_proj = nn.Linear(d_model, d_model)
        self.out_proj = nn.Linear(d_model, d_model)
        
        # Relative position encoding
        self.rel_pos_encoding = RelativePositionEncoding(max_seq_len, d_model)
        
        # Separate linear projection for relative position attention
        self.rel_pos_proj = nn.Linear(d_model, d_model)
        
        # Scaling factor for dot product attention
        self.scale = self.head_dim ** -0.5
        
        self.dropout = nn.Dropout(dropout)
        
    def forward(self, query, key, value, key_padding_mask=None, need_weights=False):
        """
        Forward pass with relative positional encoding.
        
        Args:
            query, key, value: Input tensors [batch_size, seq_len, d_model]
            key_padding_mask: Mask for padded values [batch_size, seq_len]
            need_weights: Whether to return attention weights
            
        Returns:
            Output tensor and optionally attention weights
        """
        batch_size = query.size(0)
        seq_len = query.size(1)
        
        # Linear projections and reshape for multi-head attention
        q = self.q_proj(query).view(batch_size, seq_len, self.num_heads, self.head_dim).transpose(1, 2)
        k = self.k_proj(key).view(batch_size, seq_len, self.num_heads, self.head_dim).transpose(1, 2)
        v = self.v_proj(value).view(batch_size, seq_len, self.num_heads, self.head_dim).transpose(1, 2)
        
        # Compute content-based attention scores
        attn_scores = torch.matmul(q, k.transpose(-2, -1)) * self.scale  # [batch, heads, seq_len, seq_len]
        
        # Create relative position bias
        # We'll use a simpler approach that's more efficient and avoids shape mismatches
        rel_bias = torch.zeros((seq_len, seq_len), device=query.device)
        positions = torch.arange(seq_len, device=query.device)
        relative_positions = positions.unsqueeze(1) - positions.unsqueeze(0)
        
        # Convert to a simple positional bias (closer = higher attention)
        rel_bias = -torch.abs(relative_positions) * 0.1
        
        # Add the positional bias to the attention scores
        # We add the same bias for all heads and batches
        attn_scores = attn_scores + rel_bias.unsqueeze(0).unsqueeze(0)
        
        # Apply mask if provided
        if key_padding_mask is not None:
            # Convert mask to attention mask (True = ignore)
            attn_mask = key_padding_mask.unsqueeze(1).unsqueeze(2)
            attn_scores = attn_scores.masked_fill(attn_mask, float('-inf'))
        
        # Apply softmax to get attention weights
        attn_weights = torch.softmax(attn_scores, dim=-1)
        attn_weights = self.dropout(attn_weights)
        
        # Apply attention weights to values
        output = torch.matmul(attn_weights, v)  # [batch, heads, seq_len, head_dim]
        output = output.transpose(1, 2).contiguous().view(batch_size, seq_len, self.d_model)
        
        # Final linear projection
        output = self.out_proj(output)
        
        if need_weights:
            return output, attn_weights
        else:
            return output
        
class RelativePositionTransformerLayer(nn.Module):
    """
    Transformer encoder layer with relative positional encoding.
    """
    def __init__(self, d_model, nhead, dim_feedforward=2048, dropout=0.1, 
                 activation="gelu", max_seq_len=1000, norm_first=True):
        super().__init__()
        
        # Multi-head attention with relative position encoding
        self.self_attn = MultiHeadAttentionWithRelPos(
            d_model, nhead, dropout=dropout, max_seq_len=max_seq_len
        )
        
        # Feedforward network
        self.linear1 = nn.Linear(d_model, dim_feedforward)
        self.linear2 = nn.Linear(dim_feedforward, d_model)
        
        # Normalization and dropout
        self.norm1 = nn.LayerNorm(d_model)
        self.norm2 = nn.LayerNorm(d_model)
        self.dropout = nn.Dropout(dropout)
        self.dropout1 = nn.Dropout(dropout)
        self.dropout2 = nn.Dropout(dropout)
        
        # Activation function
        self.activation = getattr(nn.functional, activation)
        self.norm_first = norm_first
        
    def forward(self, src, src_key_padding_mask=None):
        """
        Forward pass of the transformer layer.
        
        Args:
            src: Input tensor [batch_size, seq_len, d_model]
            src_key_padding_mask: Mask for padded values [batch_size, seq_len]
            
        Returns:
            Processed tensor
        """
        # Pre-norm architecture
        if self.norm_first:
            # Multi-head attention block with pre-normalization
            src2 = self.norm1(src)
            src2 = self.self_attn(src2, src2, src2, key_padding_mask=src_key_padding_mask)
            src = src + self.dropout1(src2)
            
            # Feedforward block with pre-normalization
            src2 = self.norm2(src)
            src2 = self.linear2(self.dropout(self.activation(self.linear1(src2))))
            src = src + self.dropout2(src2)
        else:
            # Multi-head attention block with post-normalization
            src2 = self.self_attn(src, src, src, key_padding_mask=src_key_padding_mask)
            src = self.norm1(src + self.dropout1(src2))
            
            # Feedforward block with post-normalization
            src2 = self.linear2(self.dropout(self.activation(self.linear1(src))))
            src = self.norm2(src + self.dropout2(src2))
            
        return src
    
class RelativePositionTransformerEncoder(nn.Module):
    """
    Transformer encoder with relative positional encoding.
    """
    def __init__(self, encoder_layer, num_layers):
        super().__init__()
        self.layers = nn.ModuleList([encoder_layer for _ in range(num_layers)])
        self.num_layers = num_layers
        
    def forward(self, src, mask=None):
        """
        Forward pass of the transformer encoder.
        
        Args:
            src: Input tensor [batch_size, seq_len, d_model]
            mask: Mask for padded values [batch_size, seq_len]
            
        Returns:
            Encoded tensor
        """
        output = src
        for layer in self.layers:
            output = layer(output, src_key_padding_mask=mask)
        return output
    
class TabularTransformerWithRelPos(nn.Module):
    """
    Enhanced transformer model for tabular data imputation with improved
    MNAR handling through correlation modeling.
    """
    def __init__(self, 
                 num_features, 
                 d_model=128, 
                 nhead=8, 
                 num_layers=3, 
                 dim_feedforward=512, 
                 dropout=0.1, 
                 activation='gelu',
                 max_seq_len=1000):
        super().__init__()
        
        self.d_model = d_model
        self.num_features = num_features
        
        # Feature value embedding
        self.value_embedding = nn.Sequential(
            nn.Linear(1, d_model),
            nn.LayerNorm(d_model),
            nn.Dropout(dropout * 0.5),  # Lower initial dropout
            nn.GELU(),
            nn.Linear(d_model, d_model),
            nn.LayerNorm(d_model)
        )
        
        # Column embedding (learnable)
        self.column_embedding = nn.Embedding(num_features, d_model)
        
        # Missing value embedding
        self.missing_embedding = nn.Parameter(torch.randn(1, d_model))
        
        # Feature correlation module
        self.feature_correlation = FeatureCorrelationModule(num_features, d_model, dropout)
        
        # Feature-value dependent encoder
        self.feature_value_encoder = FeatureValueDependentEncoder(d_model, dropout)
        
        # Layer normalization before transformer
        self.norm = nn.LayerNorm(d_model)
        
        # Create encoder layer with relative position encoding
        encoder_layer = RelativePositionTransformerLayer(
            d_model=d_model,
            nhead=nhead,
            dim_feedforward=dim_feedforward,
            dropout=dropout,
            activation=activation,
            max_seq_len=max_seq_len,
            norm_first=True
        )
        
        # Create transformer encoder
        self.transformer_encoder = RelativePositionTransformerEncoder(encoder_layer, num_layers)
        
        # Output projection
        self.output_projection = nn.Sequential(
            nn.Linear(d_model, d_model),
            nn.LayerNorm(d_model),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(d_model, d_model // 2),
            nn.GELU(),
            nn.Linear(d_model // 2, 1)
        )
        
        # Initialize weights
        self._init_weights()
        
    def _init_weights(self):
        """Initialize weights using Kaiming initialization for better convergence"""
        for m in self.modules():
            if isinstance(m, nn.Linear):
                nn.init.kaiming_normal_(m.weight, mode='fan_in', nonlinearity='relu')
                if m.bias is not None:
                    nn.init.zeros_(m.bias)
            elif isinstance(m, nn.Embedding):
                nn.init.normal_(m.weight, mean=0.0, std=0.02)
                
    def _generate_attention_mask(self, mask):
        """Generate attention mask for transformer"""
        if mask is None:
            return None
        # Convert binary mask to attention mask (1 = don't attend, 0 = attend)
        attn_mask = mask.bool()
        return attn_mask
                
    def forward(self, x, column_indices, mask=None):
        """
        Forward pass with enhanced correlation modeling for MNAR patterns.
        
        Args:
            x: Input tensor [batch_size, num_features]
            column_indices: Tensor of column indices [num_features]
            mask: Optional mask for missing values [batch_size, num_features]
            
        Returns:
            Tensor of predicted values [batch_size, num_features]
        """
        batch_size = x.size(0)
        
        # Reshape to [batch_size, num_features, 1] for embedding
        x = x.unsqueeze(-1)
        
        # Embed feature values
        x_embedded = self.value_embedding(x)
        
        # Add column embeddings
        col_embed = self.column_embedding(column_indices).unsqueeze(0).expand(batch_size, -1, -1)
        x_embedded = x_embedded + col_embed
        
        # Handle missing values if mask is provided
        if mask is not None:
            # Expand mask to match embedding dimensions
            mask_expanded = mask.unsqueeze(-1).expand_as(x_embedded)
            # Replace masked values with learned missing embedding
            missing_embed = self.missing_embedding.expand_as(x_embedded)
            x_embedded = torch.where(mask_expanded == 1, missing_embed, x_embedded)
        
        # Apply feature correlation module
        x_correlated = self.feature_correlation(x_embedded, mask)
        
        # Apply feature-value dependent encoder
        x_value_aware = self.feature_value_encoder(x_correlated, mask)
        
        # Apply layer normalization
        x_embedded = self.norm(x_value_aware)
        
        # Generate attention mask if needed
        attn_mask = self._generate_attention_mask(mask) if mask is not None else None
        
        # Pass through transformer encoder with relative position encoding
        x_encoded = self.transformer_encoder(x_embedded, attn_mask)
        
        # Project to output
        output = self.output_projection(x_encoded).squeeze(-1)
        
        return output

class EnsembleModel(nn.Module):
    """
    Ensemble of transformer models for improved prediction.
    """
    def __init__(self, num_features, config, num_models=3):
        super().__init__()
        self.num_models = num_models
        
        # Create multiple base models
        self.models = nn.ModuleList([
            TabularTransformerWithRelPos(
                num_features=num_features,
                d_model=config["d_model"],
                nhead=config["num_heads"],
                num_layers=config["num_layers"],
                dim_feedforward=config["dim_feedforward"],
                dropout=config["dropout"],
                activation=config["activation"],
                max_seq_len=max(2 * num_features, 100)
            ) for _ in range(num_models)
        ])
        
    def forward(self, x, column_indices, mask=None):
        # Get predictions from all models
        all_preds = []
        for model in self.models:
            preds = model(x, column_indices, mask)
            all_preds.append(preds.unsqueeze(0))
        
        # Stack and average predictions
        all_preds = torch.cat(all_preds, dim=0)
        avg_preds = torch.mean(all_preds, dim=0)
        
        return avg_preds