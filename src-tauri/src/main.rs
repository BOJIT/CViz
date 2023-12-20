// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

/* ----------------------------- Std/Cargo modules -------------------------- */

use native_dialog::FileDialog;
use notify::{RecursiveMode, Watcher};
use std::collections::HashMap;
use tauri::Manager;
use tokio::sync::mpsc;

// Local Modules
mod config_tree;
mod ipc;
mod parse_file;

/* ----------------------------------- Types -------------------------------- */

// App State (Ephemeral)
struct AppState {
    directory_watcher: Option<notify::RecommendedWatcher>,
    directory_channel: (mpsc::Sender<String>, mpsc::Receiver<String>),
    file_tree: HashMap<String, u32>,
}

struct AppStateMutable(std::sync::Mutex<AppState>);

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
fn initialise_tree_watcher(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, AppStateMutable>,
    root: &str,
) {
    // TODO handle glob ignore patterns

    // Fetch changesets initially for all C/C++ files
    let files = parse_file::utils::match_files(
        root,
        &vec!["c", "cpp", "cxx", "cc", "c++", "h", "hpp", "hh", "h++"],
    );

    for f in files.iter() {
        let meta = parse_file::utils::parse_symbols(f);
        match meta {
            Some(m) => {
                app_handle
                    .emit_all("file-changeset", ipc::FileChangeset::Added(m))
                    .unwrap();
            }
            None => (),
        };
    }

    // Add global watcher for added/deleted files
    {
        let mut mutable_state = state.0.lock().unwrap();

        // Drop last watcher
        match mutable_state.directory_watcher {
            Some(_) => {
                mutable_state.directory_watcher = None;
            }
            None => (),
        }

        // Assign new watcher
        let watcher = notify::recommended_watcher(move |res| {
            let changeset = parse_file::utils::handle_directory_change(res);

            match changeset {
                ipc::FileChangeset::NoEvent => return,

                _ => {
                    app_handle.emit_all("file-changeset", changeset).unwrap();
                }
            }
        });

        match watcher {
            Ok(mut w) => {
                let _ = w.watch(std::path::Path::new(root), RecursiveMode::Recursive);
                mutable_state.directory_watcher = Some(w);
            }
            Err(_) => (), // TODO send watcher warning?
        }
    }
}

/* -------------------------------- Tauri Events ---------------------------- */

fn show_webview_dialog(app_handle: tauri::AppHandle, message: &ipc::UINotification) {
    app_handle.emit_all("ui-notify", message).unwrap();
}

fn send_watcher_event<R: tauri::Runtime>(message: String, manager: &impl Manager<R>) {
    manager.emit_all("rs2js", message).unwrap();
}

/* ----------------------------------- Entry -------------------------------- */

async fn async_process(
    mut input_rx: mpsc::Receiver<String>,
    output_tx: mpsc::Sender<String>,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    while let Some(input) = input_rx.recv().await {
        let output = input;
        output_tx.send(output).await?;
    }

    Ok(())
}

fn main() {
    // Heap allocations of lifetime objects
    let (_async_proc_input_tx, async_proc_input_rx) = mpsc::channel(1);
    let (async_proc_output_tx, mut async_proc_output_rx) = mpsc::channel(1);

    // Launch application
    tauri::Builder::default()
        .manage(AppStateMutable(
            AppState {
                directory_watcher: None,
                directory_channel: mpsc::channel(1),
                file_tree: HashMap::new(),
            }
            .into(),
        ))
        .invoke_handler(tauri::generate_handler![
            pick_directory,
            initialise_tree_watcher
        ])
        .setup(|app| {
            let app_handle = app.handle();

            // Launch separate async process for handling file events
            tauri::async_runtime::spawn(async move {
                async_process(async_proc_input_rx, async_proc_output_tx).await
            });

            // Forward async events to Tauri webview
            tauri::async_runtime::spawn(async move {
                loop {
                    if let Some(output) = async_proc_output_rx.recv().await {
                        send_watcher_event(output, &app_handle);
                    }
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
