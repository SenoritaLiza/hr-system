from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0002"
down_revision: str | None = "0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "candidates",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("vacancy_id", sa.Integer(), sa.ForeignKey("vacancies.id"), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("stage", sa.String(length=20), nullable=False, server_default="screening"),
        sa.Column("position", sa.String(length=200), nullable=False, server_default=""),
        sa.Column("experience_text", sa.Text(), nullable=False, server_default=""),
        sa.Column("skills", sa.Text(), nullable=False, server_default=""),
        sa.Column("education", sa.Text(), nullable=False, server_default=""),
        sa.Column("total_experience", sa.Float(), nullable=False, server_default="0"),
        sa.Column("last_position", sa.String(length=200), nullable=False, server_default=""),
        sa.Column("source_filename", sa.String(length=300), nullable=True),
        sa.Column("score", sa.Float(), nullable=False),
        sa.Column("lr_proba", sa.Float(), nullable=False),
        sa.Column("rf_proba", sa.Float(), nullable=False),
        sa.Column("cat_proba", sa.Float(), nullable=False),
        sa.Column("ner_features", sa.JSON(), nullable=False),
        sa.Column("positive_factors", sa.JSON(), nullable=False),
        sa.Column("negative_factors", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("candidates")