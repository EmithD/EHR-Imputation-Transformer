from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime
from bson import ObjectId

# Custom ObjectId field for Pydantic model compatibility with MongoDB
class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    
    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)
    
    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

# Base model for MongoDB documents
class MongoBaseModel(BaseModel):
    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda dt: dt.isoformat()
        }

# User model for requests
class UserCreate(MongoBaseModel):
    email: EmailStr
    display_name: Optional[str] = None
    google_avatar_url: Optional[str] = None
    google_access_token: Optional[str] = None
    google_refresh_token: Optional[str] = None

# User model for responses
class UserResponse(MongoBaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    email: EmailStr
    display_name: Optional[str] = None
    google_avatar_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    is_active: bool = True

# User model for database
class UserInDB(UserResponse):
    google_access_token: Optional[str] = None
    google_refresh_token: Optional[str] = None

# User model for updates
class UserUpdate(MongoBaseModel):
    display_name: Optional[str] = None
    google_avatar_url: Optional[str] = None
    google_access_token: Optional[str] = None
    google_refresh_token: Optional[str] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    is_active: Optional[bool] = None