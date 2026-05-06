package com.novalauncherrn

import android.os.Build
import android.os.Bundle
import android.window.OnBackInvokedDispatcher
import androidx.core.view.WindowCompat
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

    override fun getMainComponentName(): String = "LauncherRN"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Android 15 (API 35) enforces edge-to-edge display.
        // This ensures our launcher draws behind the system bars correctly.
        WindowCompat.setDecorFitsSystemWindows(window, false)

        // Android 15 predictive back gesture: register a no-op callback
        // so the system knows we handle back ourselves (launchers never exit).
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            onBackInvokedDispatcher.registerOnBackInvokedCallback(
                OnBackInvokedDispatcher.PRIORITY_DEFAULT
            ) {
                // Intentionally empty — launchers must not close on back
            }
        }
    }

    /**
     * Legacy back press handler for Android 12 and below.
     */
    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        // Intentionally empty — launcher should not close on back press
    }
}
