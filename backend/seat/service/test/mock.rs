mod prepare;

use seat_model::model_seat as seat;
use prepare::prepare_mock_db;
use salvo_example_service::{Mutation, Query};

#[tokio::test]
async fn main() {
    let db = &prepare_mock_db();

    {
        let seat = Query::find_seat_by_id(db, 1).await.unwrap().unwrap();

        assert_eq!(seat.id, 1);
    }

    {
        let seat = Query::find_seat_by_id(db, 5).await.unwrap().unwrap();

        assert_eq!(seat.id, 5);
    }

    {
        let seat = Mutation::create_seat(
            db,
            seat::Model {
                id: 1,
                status: true,
            },
        )
            .await
            .unwrap();

        assert_eq!(
            seat,
            seat::ActiveModel {
                id: sea_orm::ActiveValue::Unchanged(6),
                status: sea_orm::ActiveValue::Set(true),
            }
        );
    }

    {
        let seat = Mutation::update_seat_by_id(
            db,
            1,
            seat::Model {
                id: 1,
                status: false,
            },
        )
            .await
            .unwrap();

        assert_eq!(
            seat,
            seat::Model {
                id: 1,
                status: true,
            }
        );
    }

    {
        let result = Mutation::delete_seat(db, 5).await.unwrap();

        assert_eq!(result.rows_affected, 1);
    }

    {
        let result = Mutation::delete_all_seats(db).await.unwrap();

        assert_eq!(result.rows_affected, 0);
    }
}