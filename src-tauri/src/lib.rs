// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use rdr2photobackup;
use resolve_path::PathResolveExt;
use walkdir::WalkDir;

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
    let result =
        rdr2photobackup::general_backup(&source_path, &destination_path, remove_original, convert);

    match result {
        Ok(_) => Ok("Files are backed up successfully!".to_string()),
        Err(_) => Err(result.err().unwrap()),
    }
}

#[tauri::command]
async fn detect_profile_dir() -> Result<String, ()> {
    let rdr2_dir = "~/Documents/Rockstar Games/Red Dead Redemption 2/Profiles".try_resolve();
    let mut player_dir = None;
    for entry in WalkDir::new(rdr2_dir.unwrap().display().to_string()).into_iter().filter_map(|e| e.ok()) {
        if entry.file_name() == "Player" {
            player_dir = Some(entry.path().parent().unwrap().to_path_buf());
            break;
        }
    }

    if let Some(dir) = player_dir {
        Ok(dir.display().to_string())
    } else {
        Err(())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            check_dir_not_empty,
            backup_and_convert,
            detect_profile_dir
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
