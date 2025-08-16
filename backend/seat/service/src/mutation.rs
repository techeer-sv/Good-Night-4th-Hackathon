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

    pub async fn update_seat(db: &DbConn, seat_active: seat::ActiveModel) -> Result<seat::Model, DbErr> {
        seat_active.update(db).await
    }

    pub async fn reserve_seat(db: &DbConn, id: i32, user_name: String, phone: Option<String>) -> Result<seat::Model, DbErr> {
        // Load existing row (fails if not found)
        let mut active: seat::ActiveModel = Seat::find_by_id(id)
            .one(db)
            .await? // DbErr if query fails
            .ok_or_else(|| DbErr::RecordNotFound(format!("seat id={id}")))?
            .into();

        // Check if seat is already reserved
        if let sea_orm::ActiveValue::Unchanged(true) = active.status {
            return Err(DbErr::Custom("Seat already reserved".to_string()));
        }

        // Update reservation fields
        active.status = Set(true);
        active.reserved_by = Set(Some(user_name));
        active.phone = Set(phone);
        active.update(db).await
    }

    /// Atomically reserve a seat only if it's currently unreserved.
    /// Uses a conditional UPDATE ... WHERE status = false to avoid race conditions.
    pub async fn reserve_if_available(db: &DbConn, id: i32, user_name: String, phone: Option<String>) -> Result<seat::Model, DbErr> {
    use sea_orm::FromQueryResult;
        // Raw SQL (Postgres) leveraging RETURNING to fetch the row in one round-trip
        // NOTE: Seat table assumed columns: id, status, reserved_by, phone
        #[derive(Debug, FromQueryResult)]
        struct SeatRow { id: i32, status: bool, reserved_by: Option<String>, phone: Option<String> }

        let stmt = sea_orm::Statement::from_sql_and_values(
            sea_orm::DatabaseBackend::Postgres,
            r#"UPDATE seat SET status = TRUE, reserved_by = $2, phone = $3
                WHERE id = $1 AND status = FALSE
                RETURNING id, status, reserved_by, phone"#,
            vec![id.into(), user_name.clone().into(), phone.clone().into()],
        );
        let rows: Vec<SeatRow> = SeatRow::find_by_statement(stmt).all(db).await?;
        if let Some(r) = rows.first() {
            // Rehydrate via normal fetch to get any additional columns not returned (if needed)
            // or build model directly if structure stable.
            let mut model = Seat::find_by_id(r.id).one(db).await?
                .ok_or_else(|| DbErr::RecordNotFound(format!("seat id={id}")))?;
            model.status = r.status; // ensure sync
            model.reserved_by = r.reserved_by.clone();
            model.phone = r.phone.clone();
            Ok(model)
        } else {
            // Determine if seat existed but was already reserved vs not found
            let exists = Seat::find_by_id(id).one(db).await?;
            if exists.is_some() { return Err(DbErr::Custom("Seat already reserved".into())); }
            Err(DbErr::RecordNotFound(format!("seat id={id}")))
        }
    }
}
