// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Std/Cargo Modules
use native_dialog::FileDialog;
use std::collections::HashMap;

// Local Modules
mod config_tree;
mod parse_file;

// Global application state (ephemeral)
static WATCHER_TREE: Option<HashMap<u32, u32>> = None;

fn main() {
    // Heap allocations of lifetime objects

    // Launch application
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![pick_directory])
        .invoke_handler(tauri::generate_handler![initialise_tree_watcher])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

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
fn initialise_tree_watcher(root: &str) {
    // TODO handle glob ignore patterns

    // TODO add global watcher for added/deleted files

    let sources = parse_file::utils::match_files(root, &vec!["c", "cpp", "cxx", "cc", "c++"]);
    let headers = parse_file::utils::match_files(root, &vec!["h", "hpp", "hh", "h++"]);

    println!("sources:\n {:?} \n", sources);
    println!("headers:\n {:?} \n", headers);
}
