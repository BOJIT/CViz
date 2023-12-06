// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

/* ----------------------------- Std/Cargo modules -------------------------- */

use native_dialog::FileDialog;
use notify::{RecursiveMode, Watcher};
use std::collections::HashMap;
use tauri::Manager;

// Local Modules
mod config_tree;
mod parse_file;

/* ----------------------------------- Types -------------------------------- */

#[derive(Clone, serde::Serialize)]
struct UINotification {
    msg_type: String,
    title: String,
    message: String,
    timeout: u32,
}

// App State (Ephemeral)
struct AppState {
    directory_watcher: Option<notify::RecommendedWatcher>,
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
        let watcher = notify::recommended_watcher(parse_file::utils::handle_directory_change);

        match watcher {
            Ok(mut w) => {
                let _ = w.watch(std::path::Path::new(root), RecursiveMode::Recursive);
                mutable_state.directory_watcher = Some(w);
            }
            Err(_) => (), // TODO send watcher warning?
        }
    }

    // TODO handle glob ignore patterns

    let sources = parse_file::utils::match_files(root, &vec!["c", "cpp", "cxx", "cc", "c++"]);
    let headers = parse_file::utils::match_files(root, &vec!["h", "hpp", "hh", "h++"]);

    {
        // let mut mutable_state = state.0.lock().unwrap();

        // for s in sources {
        // let mut watcher = notify::recommended_watcher(|res| match res {
        //     Ok(event) => println!("event: {:?}", event),
        //     Err(e) => println!("watch error: {:?}", e),
        // });

        // mutable_state.file_watchers.insert(s, watcher);
        // }
        // for h in headers {
        //     mutable_state.file_watchers.insert(h, 42);
        // }
    }

    // println!("sources:\n {:?} \n", sources);
    // println!("headers:\n {:?} \n", headers);

    // show_webview_dialog(
    //     app_handle,
    //     &UINotification {
    //         msg_type: "warning".to_string(),
    //         title: "FS warning".to_string(),
    //         message: "max inotify limit reached!".to_string(),
    //         timeout: 0,
    //     },
    // );
}

/* -------------------------------- Tauri Events ---------------------------- */

fn show_webview_dialog(app_handle: tauri::AppHandle, message: &UINotification) {
    app_handle.emit_all("ui-notify", message).unwrap();
}

// fn app_

/* ----------------------------------- Entry -------------------------------- */

fn main() {
    // Heap allocations of lifetime objects

    // Launch application
    tauri::Builder::default()
        .manage(AppStateMutable(
            AppState {
                directory_watcher: None,
                file_tree: HashMap::new(),
            }
            .into(),
        ))
        .invoke_handler(tauri::generate_handler![
            pick_directory,
            initialise_tree_watcher
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
