// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

/* ----------------------------- Std/Cargo modules -------------------------- */

use native_dialog::FileDialog;
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

/* ----------------------------------- State -------------------------------- */

// Global application state (ephemeral)
static WATCHER_TREE: Option<HashMap<u32, u32>> = None;

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
fn initialise_tree_watcher(app_handle: tauri::AppHandle, root: &str) {
    // Kill existing watchers

    // Add global watcher for added/deleted files

    // TODO handle glob ignore patterns

    let sources = parse_file::utils::match_files(root, &vec!["c", "cpp", "cxx", "cc", "c++"]);
    let headers = parse_file::utils::match_files(root, &vec!["h", "hpp", "hh", "h++"]);

    println!("sources:\n {:?} \n", sources);
    println!("headers:\n {:?} \n", headers);

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
        .invoke_handler(tauri::generate_handler![
            pick_directory,
            initialise_tree_watcher
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    // handler.join().unwrap();
}
