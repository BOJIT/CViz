pub mod utils {
    use notify::event::{EventKind, ModifyKind};
    use regex::Regex;
    use std::fs::File;
    use std::io::{BufRead, BufReader};
    use std::path::{Path, PathBuf};

    use path_slash::PathBufExt as _;
    use path_slash::PathExt as _;

    use crate::ipc;

    pub const EXTENSIONS: &'static [&'static str] =
        &["c", "cpp", "cxx", "cc", "c++", "h", "hpp", "hh", "h++"];

    pub fn to_unix(path: &PathBuf) -> String {
        let unix_path = Path::new(path.to_str().unwrap()).to_slash().unwrap();
        return String::from(unix_path);
    }

    pub fn from_unix(path: &str) -> PathBuf {
        let path = PathBuf::from_slash(path);
        return path;
    }

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

    pub async fn parse_symbols_copy(path: String) -> Option<ipc::FileMetdadata> {
        return parse_symbols(&path).await;
    }

    pub async fn parse_symbols(path: &str) -> Option<ipc::FileMetdadata> {
        let unix_path = to_unix(&PathBuf::from(path)); // TODO validate

        let mut metadata = ipc::FileMetdadata {
            key: unix_path,
            includes: Vec::new(),
        };

        // Do a regex parse for include headers
        let rx = Regex::new(r###"#include\s+[" < "](.*)[">]"###).unwrap();

        // Search for line-by-line matches
        let file = File::open(Path::new(path));
        match file {
            Ok(f) => {
                let reader = BufReader::new(f);

                // Buffered regex parse
                let includes = reader
                    .lines()
                    .filter_map(|line| line.ok())
                    .filter_map(|line| match rx.find(&line) {
                        Some(l) => {
                            let full_include = l.as_str();
                            Some(String::from(&full_include[10..full_include.len() - 1]))
                        }
                        None => None,
                    });

                // Copy into metadata struct
                for i in includes.into_iter() {
                    metadata.includes.push(i);
                }
            }

            Err(_) => {
                println!("Could not open: {}", path);
                return None;
            }
        };

        return Some(metadata);
    }

    pub async fn handle_directory_change(event: &notify::Event) -> ipc::FileChangeset {
        // Is this a file we should care about?
        match event.paths[0].extension() {
            Some(ext) => {
                if EXTENSIONS.contains(&(ext.to_str().unwrap())) == false {
                    return ipc::FileChangeset::NoEvent;
                }
            }

            None => {
                return ipc::FileChangeset::NoEvent;
            }
        }

        // Match on event type return if unsupported
        match event.kind {
            EventKind::Create(_) => {
                let meta = parse_symbols(event.paths[0].to_str().unwrap()).await;

                return match meta {
                    Some(m) => ipc::FileChangeset::Modified(m),
                    None => ipc::FileChangeset::NoEvent,
                };
            }
            EventKind::Remove(_) => {
                return ipc::FileChangeset::Removed(ipc::FileMetdadata {
                    key: String::from(event.paths[0].to_str().unwrap()),
                    includes: Vec::new(),
                });
            }
            EventKind::Modify(f) => match f {
                // Attempt rename by returning key change
                ModifyKind::Name(_) => {
                    if event.paths.len() != 2 {
                        // Rename of length 1 corresponds to a remove
                        let unix_path = to_unix(&(event.paths[0]));

                        return ipc::FileChangeset::Removed(ipc::FileMetdadata {
                            key: unix_path,
                            includes: Vec::new(),
                        });
                    }

                    return ipc::FileChangeset::NoEvent;

                    // return ipc::FileChangeset::Renamed((
                    //     String::from(event.paths[0].to_str().unwrap()),
                    //     String::from(event.paths[1].to_str().unwrap()),
                    // ));
                }

                // File has been re-modified. Re-tokenize
                ModifyKind::Data(_) => {
                    let meta = parse_symbols(event.paths[0].to_str().unwrap()).await;

                    return match meta {
                        Some(m) => ipc::FileChangeset::Modified(m),
                        None => ipc::FileChangeset::NoEvent,
                    };
                }

                _ => return ipc::FileChangeset::NoEvent,
            },
            _ => return ipc::FileChangeset::NoEvent,
        }
    }
}
