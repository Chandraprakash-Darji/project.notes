use tauri::Manager;

#[cfg(target_os = "macos")]
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial, NSVisualEffectState};

/// Write text to an arbitrary path chosen via the save dialog.
/// An app-defined command, so it bypasses the fs plugin's path scoping.
#[tauri::command]
fn write_file(path: String, contents: String) -> Result<(), String> {
    std::fs::write(&path, contents).map_err(|e| e.to_string())
}

/// Show or hide the native macOS traffic-light buttons (close / minimize / zoom).
/// Used to reveal the window chrome only while the window is focused.
#[tauri::command]
fn set_traffic_lights(window: tauri::WebviewWindow, visible: bool) {
    #[cfg(target_os = "macos")]
    {
        use objc2_app_kit::{NSWindow, NSWindowButton};

        let Ok(ptr) = window.ns_window() else { return };
        unsafe {
            let ns_window = &*(ptr as *const NSWindow);
            for kind in [
                NSWindowButton::CloseButton,
                NSWindowButton::MiniaturizeButton,
                NSWindowButton::ZoomButton,
            ] {
                if let Some(button) = ns_window.standardWindowButton(kind) {
                    button.setHidden(!visible);
                }
            }
        }
    }
    #[cfg(not(target_os = "macos"))]
    {
        let _ = (&window, visible);
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .invoke_handler(tauri::generate_handler![write_file, set_traffic_lights])
        .setup(|app| {
            let win = app.get_webview_window("main").expect("no main window");

            // Frosted, translucent background (the Raycast Notes look).
            #[cfg(target_os = "macos")]
            apply_vibrancy(
                &win,
                NSVisualEffectMaterial::HudWindow,
                Some(NSVisualEffectState::Active),
                None,
            )
            .expect("failed to apply window vibrancy");

            // Follow the user across Spaces / full-screen apps.
            let _ = win.set_visible_on_all_workspaces(true);

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
