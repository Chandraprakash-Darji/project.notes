import { getCurrentWindow } from "@tauri-apps/api/window";
import { register, isRegistered } from "@tauri-apps/plugin-global-shortcut";

/**
 * Register a system-wide hotkey that toggles the floating window's visibility.
 * No-ops silently when not running inside Tauri (e.g. plain browser dev).
 */
export async function registerToggleHotkey(
  accelerator = "Alt+N",
): Promise<void> {
  try {
    if (await isRegistered(accelerator)) return;
    await register(accelerator, async (event) => {
      // Older builds pass a bare string; newer ones pass { state }.
      const state = typeof event === "string" ? "Pressed" : event.state;
      if (state !== "Pressed") return;
      const win = getCurrentWindow();
      if (await win.isVisible()) {
        await win.hide();
      } else {
        await win.show();
        await win.setFocus();
      }
    });
  } catch {
    // Not in a Tauri context — ignore.
  }
}
