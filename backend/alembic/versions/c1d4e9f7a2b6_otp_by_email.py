"""Switch OTP codes to email instead of WhatsApp phone number

Revision ID: c1d4e9f7a2b6
Revises: 9b2f6a1c7d3e
Create Date: 2026-07-16 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'c1d4e9f7a2b6'
down_revision: Union[str, Sequence[str], None] = '9b2f6a1c7d3e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('otp_codes', sa.Column('email', sa.String(length=100), nullable=True))
    op.execute("UPDATE otp_codes SET email = whatsapp_phone_number")
    op.alter_column('otp_codes', 'email', nullable=False)
    op.create_index(op.f('ix_otp_codes_email'), 'otp_codes', ['email'])
    op.drop_index(op.f('ix_otp_codes_whatsapp_phone_number'), table_name='otp_codes')
    op.drop_column('otp_codes', 'whatsapp_phone_number')


def downgrade() -> None:
    """Downgrade schema."""
    op.add_column('otp_codes', sa.Column('whatsapp_phone_number', sa.String(length=25), nullable=True))
    op.execute("UPDATE otp_codes SET whatsapp_phone_number = email")
    op.alter_column('otp_codes', 'whatsapp_phone_number', nullable=False)
    op.create_index(op.f('ix_otp_codes_whatsapp_phone_number'), 'otp_codes', ['whatsapp_phone_number'])
    op.drop_index(op.f('ix_otp_codes_email'), table_name='otp_codes')
    op.drop_column('otp_codes', 'email')
