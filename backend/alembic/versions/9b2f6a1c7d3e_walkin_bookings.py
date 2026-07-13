"""Allow walk-in bookings without a user account

Revision ID: 9b2f6a1c7d3e
Revises: 47e1d14433aa
Create Date: 2026-07-13 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '9b2f6a1c7d3e'
down_revision: Union[str, Sequence[str], None] = '47e1d14433aa'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column('bookings', 'user_id', existing_type=sa.Integer(), nullable=True)
    op.add_column('bookings', sa.Column('guest_name', sa.String(length=100), nullable=True))
    op.add_column('bookings', sa.Column('guest_phone', sa.String(length=25), nullable=True))
    op.create_check_constraint(
        'check_booking_has_guest',
        'bookings',
        'user_id IS NOT NULL OR guest_name IS NOT NULL',
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('check_booking_has_guest', 'bookings', type_='check')
    op.drop_column('bookings', 'guest_phone')
    op.drop_column('bookings', 'guest_name')
    op.alter_column('bookings', 'user_id', existing_type=sa.Integer(), nullable=False)
