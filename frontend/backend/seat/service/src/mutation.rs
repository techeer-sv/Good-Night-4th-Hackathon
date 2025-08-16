use sea_orm::prelude::*; // ModelTrait, ActiveModelTrait, DbConn, DbErr
use sea_orm::Set; // explicit for field assignment
use seat_model::model_seat as seat;
use seat_model::model_seat::Entity as Seat;

pub struct Mutation;

impl Mutation {
    pub async fn set_seat_status(db: &DbConn, id: i32, status: bool) -> Result<seat::Model, DbErr> {
        // Load existing row (fails if not found)
        let mut active: seat::ActiveModel = Seat::find_by_id(id)
            .one(db)
            .await? // DbErr if query fails
            .ok_or_else(|| DbErr::RecordNotFound(format!("seat id={id}")))?
            .into();

        // Only update field that changed
        active.status = Set(status);
        active.update(db).await
    }
}
