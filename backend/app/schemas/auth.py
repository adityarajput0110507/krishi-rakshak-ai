from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.models.user import RoleEnum

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: RoleEnum
    name: str
    user_id: int

class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[RoleEnum] = None

class FarmerProfileCreate(BaseModel):
    state: str = "Maharashtra"
    district: str
    taluka: str
    village: str
    land_area_acres: float = 2.0
    primary_crop: str = "cotton"
    preferred_language: str = "mr"

class UserRegister(BaseModel):
    phone: str
    name: str
    password: str
    role: RoleEnum = RoleEnum.FARMER
    email: Optional[str] = None
    farmer_profile: Optional[FarmerProfileCreate] = None

class UserLogin(BaseModel):
    phone: str
    password: str

class FarmerProfileResponse(BaseModel):
    state: Optional[str] = "Maharashtra"
    district: str
    taluka: str
    village: str
    land_area_acres: float
    primary_crop: str
    preferred_language: str

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    phone: str
    email: Optional[str] = None
    name: str
    role: RoleEnum
    created_at: datetime
    farmer_profile: Optional[FarmerProfileResponse] = None

    class Config:
        from_attributes = True

