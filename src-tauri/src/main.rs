// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use native_dialog::FileDialog;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![pick_directory])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// Tauri Frontend-Initialised Functions

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
