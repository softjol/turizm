from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.complaint import Complaint, ComplaintStatus
from app.repositories.complaint import ComplaintRepository
from app.schemas.complaint import ComplaintCreate

class ComplaintService:

    @classmethod
    async def create_complaint(cls, user_id: int, req: ComplaintCreate, db: AsyncSession) -> Complaint:
        complaint = Complaint(
            user_id=user_id,
            target_type=req.target_type,
            target_id=req.target_id,
            reason=req.reason,
            status=ComplaintStatus.new
        )
        await ComplaintRepository.create(complaint, db)
        await db.commit()
        return complaint

    @classmethod
    async def update_status(cls, complaint_id: int, status: ComplaintStatus, db: AsyncSession) -> Complaint:
        complaint = await ComplaintRepository.get_by_id(complaint_id, db)
        if not complaint:
            raise HTTPException(status_code=404, detail="Complaint not found")
        
        complaint.status = status
        await db.commit()
        return complaint
