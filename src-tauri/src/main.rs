// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

/* ----------------------------- Std/Cargo modules -------------------------- */

use std::io::Write;
use std::sync::Mutex;

use ipc::FileChangeset;
use native_dialog::FileDialog;
use notify::{RecursiveMode, Watcher};
use tauri::Manager;
use tokio::sync::mpsc;
use tokio::task::JoinSet;

// Local Modules
mod ipc;
mod parse_file;

/* ----------------------------------- Types -------------------------------- */

// App State (Ephemeral)
struct AppState {
    directory_watcher: Mutex<Option<notify::RecommendedWatcher>>,
    event_sender: mpsc::Sender<notify::Event>,
}

/* ---------------------------------- Helpers ------------------------------- */

fn create_default_config(mut f: &std::fs::File) -> Result<(), std::io::Error> {
    // Write back syntax tag (bare file)
    let config: ipc::ConfigTree = ipc::ConfigTree { syntax: 1 };
    let yaml = serde_yaml::to_string(&config).unwrap();
    f.write_all(yaml.as_bytes())?;

    return Ok(());
}

/* ------------------------------- Tauri Commands --------------------------- */

#[tauri::command]
fn pick_directory() -> String {
    // NOTE dialog launchers MUST run in the main thread (for MacOS compatibility)

    let path = FileDialog::new()
        .reset_location()
        .show_open_single_dir()
        .unwrap();

    let path = match path {
        Some(path) => path,
        None => return String::from(""),
    };

    let path = match path.to_str() {
        Some(path) => String::from(path),
        None => return String::from(""),
    };

    path
}

#[tauri::command]
async fn initialise_tree_watcher(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, AppState>,
    root: &str,
) -> Result<(), ()> {
    // TODO handle glob ignore patterns

    // Fetch changesets initially for all C/C++ files
    let files = parse_file::utils::match_files(
        root,
        &vec!["c", "cpp", "cxx", "cc", "c++", "h", "hpp", "hh", "h++"],
    );

    // Forward all initial parse requests to another thread
    let mut set = JoinSet::new();
    for f in files.iter() {
        set.spawn(parse_file::utils::parse_symbols(String::from(f)));
    }

    // Pass all initial changesets in a single event
    let mut changesets: Vec<FileChangeset> = Vec::with_capacity(files.len());
    while let Some(res) = set.join_next().await {
        let meta = res.unwrap();
        match meta {
            Some(m) => {
                changesets.push(ipc::FileChangeset::Added(m));
            }
            None => (),
        }
    }
    app_handle.emit_all("file-changeset", changesets).unwrap();

    // Add global watcher for added/deleted files
    {
        let mut watcher_slot = state.directory_watcher.lock().unwrap();

        // Drop last watcher
        match *watcher_slot {
            Some(_) => {
                *watcher_slot = None;
            }
            None => (),
        }

        // Assign new watcher in an async thread
        let event_sender = state.event_sender.clone();
        let watcher = notify::recommended_watcher(move |res| {
            let event = match res {
                Ok(event) => event,
                Err(_) => return, // Ignore watch errors for now
            };

            // Create a new sender for our runtime
            let tx = event_sender.clone();
            tauri::async_runtime::spawn(async move {
                tx.send(event).await.unwrap();
            });
        });

        match watcher {
            Ok(mut w) => {
                let _ = w.watch(std::path::Path::new(root), RecursiveMode::Recursive);
                *watcher_slot = Some(w);
            }
            Err(_) => {
                show_webview_dialog(
                    &app_handle,
                    &ipc::UINotification::Warning(ipc::UINotificationMetdata {
                        title: "File Watcher Error".to_string(),
                        message: "Could not create a file watcher for changes".to_string(),
                        timeout: None,
                    }),
                );
            }
        };
    }

    return Result::Ok(());
}

#[tauri::command]
fn read_config_file(app_handle: tauri::AppHandle, root: &str) -> ipc::ConfigTree {
    let path_str = format!("{root}/.cviz.yaml");
    let path = std::path::Path::new(&path_str);

    let f = std::fs::File::open(path);
    let f = match f {
        Ok(f) => f,
        Err(_e) => {
            // Create blank config file if doesn't exist
            let h = std::fs::File::create(path).unwrap();
            create_default_config(&h).unwrap();

            // Notify creation of config file
            show_webview_dialog(
                &app_handle,
                &ipc::UINotification::Info(ipc::UINotificationMetdata {
                    title: "Added .cviz.yaml".to_string(),
                    message: "Config file added to project root".to_string(),
                    timeout: Some(5),
                }),
            );

            h
        }
    };

    let data: ipc::ConfigTree = match serde_yaml::from_reader(f) {
        Ok(d) => d,
        Err(_e) => {
            show_webview_dialog(
                &app_handle,
                &ipc::UINotification::Warning(ipc::UINotificationMetdata {
                    title: "Invalid .cviz.yaml".to_string(),
                    message: "Config file reset to default".to_string(),
                    timeout: Some(5),
                }),
            );

            let h = std::fs::File::create(path).unwrap();
            create_default_config(&h).unwrap();

            ipc::ConfigTree { syntax: 1 }
        }
    };

    return data;
}

#[tauri::command]
fn write_config_file(app_handle: tauri::AppHandle, root: &str) {}

/* -------------------------------- Tauri Events ---------------------------- */

fn show_webview_dialog(app_handle: &tauri::AppHandle, message: &ipc::UINotification) {
    app_handle.emit_all("ui-notify", message).unwrap();
}

/* ----------------------------------- Entry -------------------------------- */

fn main() {
    // Heap allocations of lifetime objects
    let (async_event_tx, mut async_event_rx) = mpsc::channel(10);

    // Launch application
    tauri::Builder::default()
        .manage(
            // Only accessible to the main thread
            AppState {
                directory_watcher: Mutex::new(None),
                event_sender: async_event_tx,
            },
        )
        .invoke_handler(tauri::generate_handler![
            pick_directory,
            initialise_tree_watcher,
            read_config_file,
            write_config_file,
        ])
        .setup(|app| {
            let app_handle = app.handle();

            // Process events in async context
            tauri::async_runtime::spawn(async move {
                loop {
                    if let Some(event) = async_event_rx.recv().await {
                        let cs = parse_file::utils::handle_directory_change(&event).await;
                        app_handle.emit_all("file-changeset", vec![cs]).unwrap();
                    }
                }
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
