pub mod utils {
    use notify::event::{EventKind, ModifyKind};

    use crate::ipc;

    const SOURCES: &'static [&'static str] = &["c", "cpp", "cxx", "cc", "c++"];
    const HEADERS: &'static [&'static str] = &["h", "hpp", "hh", "h++"];

    pub fn match_files(root: &str, extensions: &Vec<&str>) -> Vec<String> {
        let mut paths: Vec<String> = Vec::new();

        for ext in extensions.iter() {
            let pattern = String::from(format!("{root}/**/*.{}", ext));

            for entry in glob::glob(&pattern).expect("Failed to read glob pattern") {
                match entry {
                    Ok(path) => {
                        paths.push(String::from(path.to_str().unwrap()));
                    }
                    Err(_e) => (), // Ignore invalid paths
                }
            }
        }

        paths
    }

    pub fn parse_symbols(path: &str) -> ipc::FileMetdadata {
        return ipc::FileMetdadata {
            key: String::from("test"),
        };
    }

    pub fn handle_directory_change(res: notify::Result<notify::Event>) -> ipc::FileChangeset {
        let event = match res {
            Ok(event) => event,
            Err(_) => return ipc::FileChangeset::NoEvent, // Ignore watch errors for now
        };

        // Is this a file we should care about?
        match event.paths[0].extension() {
            Some(ext) => {
                println!("{:?}", ext); // TODO match against headers and sources
            }

            None => {
                return ipc::FileChangeset::NoEvent;
            }
        }

        // Match on event type return if unsupported
        match event.kind {
            EventKind::Create(f) => {
                return ipc::FileChangeset::Modified(parse_symbols(
                    event.paths[0].to_str().unwrap(),
                ));
            }
            EventKind::Remove(f) => {
                return ipc::FileChangeset::Removed(String::from(event.paths[0].to_str().unwrap()));
            }
            EventKind::Modify(f) => match f {
                // Attempt rename by returning key change
                ModifyKind::Name(_) => {
                    if event.paths.len() != 2 {
                        // Rename of length 1 corresponds to a remove
                        return ipc::FileChangeset::Removed(String::from(
                            event.paths[0].to_str().unwrap(),
                        ));
                    }

                    return ipc::FileChangeset::Renamed(
                        String::from(event.paths[0].to_str().unwrap()),
                        String::from(event.paths[1].to_str().unwrap()),
                    );
                }

                // File has been re-modified. Re-tokenize
                ModifyKind::Data(_) => {
                    return ipc::FileChangeset::Modified(parse_symbols(
                        event.paths[0].to_str().unwrap(),
                    ));
                }

                _ => return ipc::FileChangeset::NoEvent,
            },
            _ => return ipc::FileChangeset::NoEvent,
        }
    }
}
