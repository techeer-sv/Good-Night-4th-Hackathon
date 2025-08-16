use once_cell::sync::OnceCell;
use sea_orm::{Database, DatabaseConnection, DbErr};
use seat_model::model_seat::{self as seat, Entity as Seat};
use sea_orm::{EntityTrait, ActiveModelTrait, Set};

static DB: OnceCell<DatabaseConnection> = OnceCell::new();

#[cfg(not(feature = "memory-seats"))]
pub fn db() -> &'static DatabaseConnection { DB.get().expect("DB not initialized") }

#[cfg(feature = "memory-seats")]
pub fn db() -> Option<&'static DatabaseConnection> { None }

pub async fn init_db() -> anyhow::Result<()> {
    #[cfg(feature = "memory-seats")]
    { return Ok(()); }

    #[cfg(not(feature = "memory-seats"))]
    {
        let url = std::env::var("DATABASE_URL")
            .unwrap_or_else(|_| "postgres://postgres:postgres@localhost:5432/tickettock".to_string());
        let conn = Database::connect(&url).await?;
        DB.set(conn).ok().expect("DB already initialized");
        seed_seats().await?;
        Ok(())
    }
}

#[cfg(not(feature = "memory-seats"))]
async fn seed_seats() -> Result<(), DbErr> {
    let existing = Seat::find().all(db()).await?;
    if existing.len() >= 9 { return Ok(()); }
    for id in 1..=9 {
        if existing.iter().any(|m| m.id == id) { continue; }
        let am = seat::ActiveModel { 
            id: Set(id), 
            status: Set(false),
            reserved_by: Set(None),
            phone: Set(None)
        };
        let _ = am.insert(db()).await?;
    }
    Ok(())
}
