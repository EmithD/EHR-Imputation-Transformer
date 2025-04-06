from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.database import Database
from pymongo.collection import Collection
from typing import Optional
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# MongoDB connection URL
MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "fyp_dev")

# MongoDB Collections
USER_COLLECTION = "users"

class MongoDB:
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[Database] = None
    
    # Collections
    users_collection: Optional[Collection] = None

# Initialize MongoDB connection
mongodb = MongoDB()

async def connect_to_mongodb():
    """Connect to MongoDB database"""
    try:
        mongodb.client = AsyncIOMotorClient(MONGODB_URI)
        mongodb.db = mongodb.client[DATABASE_NAME]
        
        # Initialize collections
        mongodb.users_collection = mongodb.db[USER_COLLECTION]
        
        # Create indexes if needed
        await mongodb.users_collection.create_index("email", unique=True)
        
        print(f"Connected to MongoDB at {MONGODB_URI}")
    except Exception as e:
        print(f"Failed to connect to MongoDB: {str(e)}")
        raise

async def close_mongodb_connection():
    """Close MongoDB connection"""
    if mongodb.client:
        mongodb.client.close()
        print("MongoDB connection closed")

# Get database function for dependency injection
async def get_mongodb():
    """Get MongoDB database instance"""
    return mongodb