use seat_model::model_seat as seat;
use sea_orm::*;

#[cfg(feature = "mock")]
pub fn prepare_mock_db() -> DatabaseConnection {
    MockDatabase::new(DatabaseBackend::Postgres)
        .append_query_results([
            [seat::Model {
                id: 1,
                status: true,
            }],
            [seat::Model {
                id: 2,
                status: false,
            }],
            [seat::Model {
                id: 3,
                status: true,
            }],
            [seat::Model {
                id: 4,
                status: false,
            }],
            [seat::Model {
                id: 5,
                status: true,
            }],
            [seat::Model {
                id: 6,
                status: true,
            }],
            [seat::Model {
                id: 7,
                status: false,
            }],
            [seat::Model {
                id: 8,
                status: true,
            }],
            [seat::Model {
                id: 9,
                status: false,
            }],
        ])
        .append_exec_results([
            MockExecResult {
                last_insert_id: 6,
                rows_affected: 1,
            },
            MockExecResult {
                last_insert_id: 6,
                rows_affected: 5,
            },
        ])
        .into_connection()
}