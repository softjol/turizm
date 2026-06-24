"""seed_hotel_types_and_amenities

Revision ID: 240ff563e6b5
Revises: 8a7bb0835fa6
Create Date: 2026-06-24 12:07:09.239399

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '240ff563e6b5'
down_revision: Union[str, Sequence[str], None] = '8a7bb0835fa6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute(
        """
        INSERT INTO hotel_types (name, slug) VALUES 
        ('Гостиница', 'hotel'),
        ('Хостел', 'hostel'),
        ('Гостевой дом', 'guesthouse'),
        ('Коттедж', 'cottage')
        ON CONFLICT (slug) DO NOTHING;
        """
    )
    op.execute(
        """
        INSERT INTO amenities (name, slug) VALUES
        ('Wi-Fi', 'wifi'),
        ('Парковка', 'parking'),
        ('Кондиционер', 'air_conditioning'),
        ('Бассейн', 'pool'),
        ('Завтрак', 'breakfast')
        ON CONFLICT (slug) DO NOTHING;
        """
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("DELETE FROM hotel_types WHERE slug IN ('hotel', 'hostel', 'guesthouse', 'cottage');")
    op.execute("DELETE FROM amenities WHERE slug IN ('wifi', 'parking', 'air_conditioning', 'pool', 'breakfast');")
