pub mod utils {
    use glob::glob;
    use notify::event::EventKind;

    pub fn match_files(root: &str, extensions: &Vec<&str>) -> Vec<String> {
        let mut paths: Vec<String> = Vec::new();

        for ext in extensions.iter() {
            let pattern = String::from(format!("{root}/**/*.{}", ext));

            for entry in glob(&pattern).expect("Failed to read glob pattern") {
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

    pub fn handle_directory_change(res: notify::Result<notify::Event>) {
        let event_type = match res {
            Ok(event) => event,
            Err(_) => return, // Ignore watch errors for now
        };

        // Match on event type return if unsupported
        match event_type.kind {
            EventKind::Create(f) => {
                // Add to Hashmap if source file,
                println!("Create: {:?}", f);
            }
            EventKind::Remove(f) => {
                println!("Remove: {:?}", f);
            }
            EventKind::Modify(f) => {
                println!("Modify: {:?}", f);
            }
            _ => return,
        }

        // If removing file AND in hashmap, remove
    }
}
