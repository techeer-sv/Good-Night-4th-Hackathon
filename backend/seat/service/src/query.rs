use sea_orm::prelude::*;
use seat_model::model_seat as seat;
use seat_model::model_seat::Entity as Seat;

/// Read-only seat queries.
pub struct Query;

impl Query {
    /// Find a single seat by id.
    pub async fn find_seat(db: &DbConn, id: i32) -> Result<Option<seat::Model>, DbErr> {
        Seat::find_by_id(id).one(db).await
    }

    /// List all seats.
    pub async fn list_seats(db: &DbConn) -> Result<Vec<seat::Model>, DbErr> {
        Seat::find().all(db).await
    }
}
