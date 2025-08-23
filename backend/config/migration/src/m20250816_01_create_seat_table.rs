use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Seats::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Seats::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(Seats::Status)
                            .boolean()
                            .not_null()
                            .default(false),
                    )
                    .col(
                        ColumnDef::new(Seats::ReservedBy)
                            .string()
                            .null(),
                    )
                    .col(
                        ColumnDef::new(Seats::Phone)
                            .string()
                            .null(),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Seats::Table).to_owned())
            .await
    }
}

#[derive(DeriveIden)]
enum Seats {
    Table,
    Id,
    Status,
    ReservedBy,
    Phone,
}