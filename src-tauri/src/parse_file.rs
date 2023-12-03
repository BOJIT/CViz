pub mod utils {
    use glob::glob;

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
}
