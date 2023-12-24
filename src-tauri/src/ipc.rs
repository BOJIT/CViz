/**
 * @note Keep in sync with `ipc.d.ts`
 */

#[serde_with::skip_serializing_none]
#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub struct UINotificationMetdata {
    pub title: String,
    pub message: String,
    pub timeout: Option<u32>,
}

#[derive(Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
#[serde(tag = "type")]
pub enum UINotification {
    Info(UINotificationMetdata),
    Warning(UINotificationMetdata),
    Error(UINotificationMetdata),
}

#[derive(Clone, Debug, serde::Serialize, serde::Deserialize)]
pub struct FileMetdadata {
    pub key: String,
    pub includes: Vec<String>,
}

#[derive(Clone, Debug, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
#[serde(tag = "type")]
pub enum FileChangeset {
    NoEvent,
    Removed(String),
    Renamed((String, String)),
    Added(FileMetdadata),
    Modified(FileMetdadata),
}

#[derive(Clone, Debug, serde::Serialize, serde::Deserialize)]
pub struct ConfigTree {
    pub syntax: u32,
}
