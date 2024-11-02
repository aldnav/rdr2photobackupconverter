// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use rdr2photobackup;

#[tauri::command]
async fn check_dir_not_empty(path: String) -> Result<(), String> {
    let has_source_files = rdr2photobackup::verify_has_source_files(&path);
    match has_source_files {
        Ok(_) => Ok(()),
        Err(_) => Err("No files to backup".into()),
    }
}

#[tauri::command]
async fn backup_and_convert(
    source_path: String,
    destination_path: String,
    remove_original: bool,
    convert: bool,
) -> Result<String, String> {
    // let result: bool;
    // let message;
    // if remove_original {
    //     result = rdr2photobackup::backup_and_convert(&source_path, &destination_path);
    //     message = "Files have been moved and converted successfully!".to_string();
    // } else {
    //     result = rdr2photobackup::copy_and_convert(&source_path, &destination_path);
    //     message = "Files have been copied and converted successfully!".to_string();
    // }

    let result =
        rdr2photobackup::general_backup(&source_path, &destination_path, remove_original, convert);

    match result {
        Ok(_) => Ok("Files are backed up successfully!".to_string()),
        Err(_) => Err(result.err().unwrap()),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            check_dir_not_empty,
            backup_and_convert
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
