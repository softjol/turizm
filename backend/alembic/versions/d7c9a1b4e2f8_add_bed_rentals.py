"""add per-bed rentals

Revision ID: d7c9a1b4e2f8
Revises: d3f8b6a1c9e2
"""
from alembic import op
import sqlalchemy as sa

revision = "d7c9a1b4e2f8"
down_revision = "d3f8b6a1c9e2"
branch_labels = None
depends_on = None

ACTIVE = "status IN ('pending', 'confirmed', 'checked_in')"

def upgrade():
    op.add_column("rooms", sa.Column("bed_count", sa.Integer(), nullable=False, server_default="0"))
    op.add_column("rooms", sa.Column("price_per_bed", sa.Numeric(10, 2), nullable=True))
    op.add_column("bookings", sa.Column("bed_number", sa.Integer(), nullable=True))
    op.execute(
        "ALTER TABLE bookings "
        "DROP CONSTRAINT IF EXISTS exclude_booking_overlap"
    )
    op.execute(
        "ALTER TABLE bookings ADD CONSTRAINT exclude_whole_room_booking_overlap "
        "EXCLUDE USING gist "
        "(room_id WITH =, daterange(date_from, date_to) WITH &&) "
        f"WHERE ({ACTIVE} AND bed_number IS NULL)"
    )
    op.execute(
        "ALTER TABLE bookings ADD CONSTRAINT exclude_bed_booking_overlap "
        "EXCLUDE USING gist "
        "(room_id WITH =, bed_number WITH =, daterange(date_from, date_to) WITH &&) "
        f"WHERE ({ACTIVE} AND bed_number IS NOT NULL)"
    )

def downgrade():
    op.execute(
        "ALTER TABLE bookings "
        "DROP CONSTRAINT IF EXISTS exclude_bed_booking_overlap"
    )
    op.execute(
        "ALTER TABLE bookings "
        "DROP CONSTRAINT IF EXISTS exclude_whole_room_booking_overlap"
    )
    op.drop_column("bookings", "bed_number")
    op.drop_column("rooms", "price_per_bed")
    op.drop_column("rooms", "bed_count")
    op.execute(
        "ALTER TABLE bookings ADD CONSTRAINT exclude_booking_overlap "
        "EXCLUDE USING gist "
        "(room_id WITH =, daterange(date_from, date_to) WITH &&) "
        f"WHERE ({ACTIVE})"
    )
