mod mutation;
mod query;

pub use mutation::*;
pub use query::*;

pub use sea_orm;

pub const TOTAL_SEATS: usize = 9;
