// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

/* ----------------------------- Std/Cargo modules -------------------------- */

use std::io::Write;

use ipc::FileChangeset;
use native_dialog::FileDialog;
use notify::{RecursiveMode, Watcher};
use tauri::Manager;
use tokio::task::JoinSet;
// use tokio::sync::mpsc;

// Local Modules
mod ipc;
mod parse_file;

/* ----------------------------------- Types -------------------------------- */

// App State (Ephemeral)
struct AppState {
    directory_watcher: Option<notify::RecommendedWatcher>,
    // path_sender: mpsc::Sender<String>,
}

struct AppStateMutable(std::sync::Mutex<AppState>);

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
    state: tauri::State<'_, AppStateMutable>,
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
        let mut mutable_state = state.0.lock().unwrap();

        // Drop last watcher
        match mutable_state.directory_watcher {
            Some(_) => {
                mutable_state.directory_watcher = None;
            }
            None => (),
        }

        // Assign new watcher
        // let watcher = notify::recommended_watcher(move |res| {
        //     let changeset = parse_file::utils::handle_directory_change(res).await;

        //     match changeset {
        //         ipc::FileChangeset::NoEvent => return,

        //         _ => {
        //             app_handle.emit_all("file-changeset", changeset).unwrap();
        //         }
        //     }
        // });

        // match watcher {
        //     Ok(mut w) => {
        //         let _ = w.watch(std::path::Path::new(root), RecursiveMode::Recursive);
        //         mutable_state.directory_watcher = Some(w);
        //     }
        //     Err(_) => (), // TODO send watcher warning?
        // };
    }

    return Result::Ok(());
}

#[tauri::command]
fn read_config_file(
    app_handle: tauri::AppHandle,
    _state: tauri::State<'_, AppStateMutable>,
    root: &str,
) {
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

    println!("{:?}", data);
}

#[tauri::command]
fn write_config_file(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, AppStateMutable>,
    root: &str,
) {
}

/* -------------------------------- Tauri Events ---------------------------- */

fn show_webview_dialog(app_handle: &tauri::AppHandle, message: &ipc::UINotification) {
    app_handle.emit_all("ui-notify", message).unwrap();
}

/* ----------------------------------- Entry -------------------------------- */

// async fn async_parse_symbols(
//     mut in_path: mpsc::Receiver<String>,
//     out_meta: mpsc::Sender<ipc::FileMetdadata>,
// ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
//     while let Some(path) = in_path.recv().await {
//         let meta = parse_file::utils::parse_symbols(&path);
//         match meta {
//             Some(meta) => {
//                 out_meta.send(meta).await?;
//             }
//             None => (),
//         }
//     }

//     Ok(())
// }

fn main() {
    // Heap allocations of lifetime objects
    // let (async_proc_input_tx, async_proc_input_rx) = mpsc::channel(10);
    // let (async_proc_output_tx, mut async_proc_output_rx) = mpsc::channel(1);

    // Launch application
    tauri::Builder::default()
        .manage(AppStateMutable(
            // Only accessible to the main thread
            AppState {
                directory_watcher: None,
                // path_sender: async_proc_input_tx,
            }
            .into(),
        ))
        .invoke_handler(tauri::generate_handler![
            pick_directory,
            initialise_tree_watcher,
            read_config_file,
            write_config_file,
        ])
        // .setup(|app| {
        // let app_handle = app.handle();
        // Launch separate async process for handling file events
        // tauri::async_runtime::spawn(async move {
        //     async_parse_symbols(async_proc_input_rx, async_proc_output_tx).await
        // });
        // // Forward async file events to Tauri webview
        // tauri::async_runtime::spawn(async move {
        //     loop {
        //         if let Some(meta) = async_proc_output_rx.recv().await {
        //             app_handle
        //                 .emit_all("file-changeset", ipc::FileChangeset::Added(meta))
        //                 .unwrap();
        //         }
        //     }
        // });
        //     Ok(())
        // })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
