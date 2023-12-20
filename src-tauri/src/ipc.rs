/**
 * @note Keep in sync with `ipc.d.ts`
 */

#[derive(Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum UINotificationType {
    Info,
    Warning,
    Error,
}

#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub struct UINotification {
    pub msg_type: UINotificationType,
    pub title: String,
    pub message: String,
    pub timeout: Option<u32>,
}

#[derive(Clone, Debug, serde::Serialize, serde::Deserialize)]
pub struct FileMetdadata {
    pub key: String,
}

#[derive(Clone, Debug, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum FileChangeset {
    NoEvent,
    Removed(String),
    Renamed(String, String),
    Added(FileMetdadata),
    Modified(FileMetdadata),
}
