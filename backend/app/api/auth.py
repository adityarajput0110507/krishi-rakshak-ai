from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User, FarmerProfile, RoleEnum
from app.schemas.auth import UserRegister, UserLogin, Token, UserResponse
from app.services.auth_service import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    # Check existing phone
    existing = db.query(User).filter(User.phone == user_in.phone).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this mobile number is already registered."
        )

    # Check existing email if provided
    if user_in.email:
        existing_email = db.query(User).filter(User.email == user_in.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email address already exists."
            )

    new_user = User(
        phone=user_in.phone,
        email=user_in.email,
        name=user_in.name,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role
    )
    db.add(new_user)
    db.flush()

    # Create farmer profile if role is farmer
    if user_in.role == RoleEnum.FARMER and user_in.farmer_profile:
        profile = FarmerProfile(
            user_id=new_user.id,
            state=user_in.farmer_profile.state or "Maharashtra",
            district=user_in.farmer_profile.district,
            taluka=user_in.farmer_profile.taluka,
            village=user_in.farmer_profile.village,
            land_area_acres=user_in.farmer_profile.land_area_acres,
            primary_crop=user_in.farmer_profile.primary_crop,
            preferred_language=user_in.farmer_profile.preferred_language
        )
        db.add(profile)

    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(data={"sub": str(new_user.id), "role": new_user.role.value})
    return Token(
        access_token=access_token,
        role=new_user.role,
        name=new_user.name,
        user_id=new_user.id
    )

@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == login_in.phone).first()
    if not user:
        # Check by email as fallback
        user = db.query(User).filter(User.email == login_in.phone).first()
    
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect mobile number or password."
        )

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Account is disabled.")

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
    return Token(
        access_token=access_token,
        role=user.role,
        name=user.name,
        user_id=user.id
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

