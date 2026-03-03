from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import settings
from app.database import get_db
from app.models.skill import Skill
from app.models.user import User
from app.routers.auth import get_current_user_dep
from app.schemas.skill import SkillResponse
from app.schemas.user import UserResponse
from app.services.skill_upload import copy_validated_zip_to_storage, validate_skill_zip

router = APIRouter()


@router.post("/upload", response_model=SkillResponse, status_code=201)
async def upload_skill(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_dep),
):
    from sqlalchemy import select

    meta, tmp_path = await validate_skill_zip(file)
    try:
        # Check duplicate name (optional: allow same name by different users)
        result = await db.execute(select(Skill).where(Skill.name == meta.name))
        if result.scalar_one_or_none() is not None:
            raise HTTPException(status_code=400, detail="A skill with this name already exists")
        skill = Skill(
            name=meta.name,
            description=meta.description,
            author_id=current_user.id,
            file_path="",  # set below after we have id
        )
        db.add(skill)
        await db.flush()
        skill.file_path = str(Path(settings.upload_dir) / f"{skill.id}.zip")
        copy_validated_zip_to_storage(tmp_path, skill.id, Path(settings.upload_dir))
        author_resp = UserResponse.model_validate(current_user)
        return SkillResponse(
            id=skill.id,
            name=skill.name,
            description=skill.description,
            author_id=skill.author_id,
            author=author_resp,
            download_count=skill.download_count,
            created_at=skill.created_at,
            updated_at=skill.updated_at,
        )
    finally:
        tmp_path.unlink(missing_ok=True)


@router.get("")
async def list_skills(
    db: AsyncSession = Depends(get_db),
    q: str | None = Query(None, description="Search by name or description"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sort: str = Query("created_at", description="created_at or download_count"),
):
    from sqlalchemy import func, or_, select, desc

    from app.schemas.skill import SkillListResponse

    base = select(Skill).options(selectinload(Skill.author))
    count_base = select(func.count()).select_from(Skill)
    if q and q.strip():
        term = f"%{q.strip()}%"
        base = base.where(or_(Skill.name.ilike(term), Skill.description.ilike(term)))
        count_base = count_base.where(or_(Skill.name.ilike(term), Skill.description.ilike(term)))

    total_result = await db.execute(count_base)
    total = total_result.scalar() or 0

    order = desc(Skill.download_count) if sort == "download_count" else desc(Skill.created_at)
    base = base.order_by(order).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(base)
    skills = result.scalars().all()

    items = []
    for s in skills:
        author_resp = UserResponse.model_validate(s.author) if s.author else None
        items.append(
            SkillResponse(
                id=s.id,
                name=s.name,
                description=s.description,
                author_id=s.author_id,
                author=author_resp,
                download_count=s.download_count,
                created_at=s.created_at,
                updated_at=s.updated_at,
            )
        )

    return SkillListResponse(items=items, total=total, page=page, page_size=page_size)


@router.get("/{skill_id}")
async def get_skill(skill_id: int, db: AsyncSession = Depends(get_db)):
    from sqlalchemy import select

    result = await db.execute(
        select(Skill).where(Skill.id == skill_id).options(selectinload(Skill.author))
    )
    skill = result.scalar_one_or_none()
    if skill is None:
        raise HTTPException(status_code=404, detail="Skill not found")
    author_resp = UserResponse.model_validate(skill.author) if skill.author else None
    return SkillResponse(
        id=skill.id,
        name=skill.name,
        description=skill.description,
        author_id=skill.author_id,
        author=author_resp,
        download_count=skill.download_count,
        created_at=skill.created_at,
        updated_at=skill.updated_at,
    )


@router.get("/{skill_id}/download")
async def download_skill(skill_id: int, db: AsyncSession = Depends(get_db)):
    from sqlalchemy import select

    result = await db.execute(select(Skill).where(Skill.id == skill_id))
    skill = result.scalar_one_or_none()
    if skill is None:
        raise HTTPException(status_code=404, detail="Skill not found")
    path = Path(settings.upload_dir) / f"{skill.id}.zip"
    if not path.is_file():
        raise HTTPException(status_code=404, detail="Skill file not found")
    skill.download_count += 1
    return FileResponse(
        path,
        media_type="application/zip",
        filename=f"{skill.name}.zip",
    )
