import re
import zipfile
import tempfile
import shutil
from pathlib import Path
from typing import NamedTuple, Tuple

import yaml
from fastapi import UploadFile, HTTPException

from app.config import settings


class SkillMeta(NamedTuple):
    name: str
    description: str


NAME_PATTERN = re.compile(r"^[a-z0-9\-]{1,64}$")
MAX_DESC_LEN = 1024
MAX_SIZE = settings.max_upload_size_mb * 1024 * 1024
MAX_FILES = settings.max_extract_files


def _find_skill_md(root: Path) -> Path | None:
    """Find SKILL.md in root or in single top-level directory."""
    direct = root / "SKILL.md"
    if direct.is_file():
        return direct
    subs = [p for p in root.iterdir() if p.is_dir()]
    if len(subs) == 1:
        candidate = subs[0] / "SKILL.md"
        if candidate.is_file():
            return candidate
    return None


def _parse_frontmatter(content: str) -> dict:
    if not content.strip().startswith("---"):
        return {}
    parts = content.split("---", 2)
    if len(parts) < 3:
        return {}
    try:
        return yaml.safe_load(parts[1]) or {}
    except Exception:
        return {}


async def validate_skill_zip(file: UploadFile) -> Tuple[SkillMeta, Path]:
    """Validate uploaded zip: must contain SKILL.md with valid frontmatter. Returns (name, description)."""
    if not file.filename or not file.filename.lower().endswith(".zip"):
        raise HTTPException(status_code=400, detail="File must be a .zip archive")

    # Check content length if available
    size = 0
    file_count = 0
    with tempfile.NamedTemporaryFile(suffix=".zip", delete=False) as tmp:
        try:
            while True:
                chunk = await file.read(8192)
                if not chunk:
                    break
                size += len(chunk)
                if size > MAX_SIZE:
                    raise HTTPException(status_code=400, detail=f"Zip size exceeds {settings.max_upload_size_mb}MB")
                tmp.write(chunk)
            tmp.flush()
            tmp_path = Path(tmp.name)
        except Exception as e:
            Path(tmp.name).unlink(missing_ok=True)
            if isinstance(e, HTTPException):
                raise
            raise HTTPException(status_code=400, detail="Invalid zip file") from e

    try:
        with zipfile.ZipFile(tmp_path, "r") as zf:
            for info in zf.infolist():
                if info.is_dir():
                    continue
                file_count += 1
                if file_count > MAX_FILES:
                    raise HTTPException(status_code=400, detail=f"Too many files (max {MAX_FILES})")
                # Path traversal check
                if ".." in info.filename or info.filename.startswith("/"):
                    raise HTTPException(status_code=400, detail="Invalid path in archive")

            extract_root = Path(tempfile.mkdtemp())
            try:
                zf.extractall(extract_root)
                skill_md = _find_skill_md(extract_root)
                if skill_md is None:
                    raise HTTPException(
                        status_code=400,
                        detail="Zip must contain SKILL.md at root or in a single top-level folder",
                    )
                text = skill_md.read_text(encoding="utf-8", errors="replace")
                fm = _parse_frontmatter(text)
                name = fm.get("name")
                description = fm.get("description")
                if not name or not isinstance(name, str):
                    raise HTTPException(status_code=400, detail="SKILL.md must have 'name' in frontmatter")
                if not description or not isinstance(description, str):
                    raise HTTPException(status_code=400, detail="SKILL.md must have 'description' in frontmatter")
                name = name.strip()
                description = description.strip()
                if not NAME_PATTERN.match(name):
                    raise HTTPException(
                        status_code=400,
                        detail="name must be 1-64 chars, lowercase letters, numbers, hyphens only",
                    )
                if len(description) > MAX_DESC_LEN:
                    raise HTTPException(
                        status_code=400,
                        detail=f"description must be at most {MAX_DESC_LEN} characters",
                    )
                if not description:
                    raise HTTPException(status_code=400, detail="description must be non-empty")
                return (SkillMeta(name=name, description=description), tmp_path)
            finally:
                shutil.rmtree(extract_root, ignore_errors=True)
    except zipfile.BadZipFile as e:
        tmp_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail="Invalid zip file") from e
    except HTTPException:
        tmp_path.unlink(missing_ok=True)
        raise
    except Exception as e:
        tmp_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail="Failed to validate skill zip") from e


def copy_validated_zip_to_storage(validated_zip_path: Path, skill_id: int, dest_dir: Path) -> Path:
    """Copy validated zip from temp path to dest_dir / {skill_id}.zip. Caller should unlink validated_zip_path after."""
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest_path = dest_dir / f"{skill_id}.zip"
    shutil.copy2(validated_zip_path, dest_path)
    return dest_path
