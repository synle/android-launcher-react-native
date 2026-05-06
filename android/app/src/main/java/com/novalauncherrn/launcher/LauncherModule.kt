package com.novalauncherrn.launcher

import android.content.Intent
import android.content.pm.PackageManager
import android.content.pm.ResolveInfo
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import android.os.Build
import android.util.Base64
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import java.io.ByteArrayOutputStream

class LauncherModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "LauncherModule"

    /**
     * Queries all installed apps that have a LAUNCHER intent (i.e., apps that
     * appear in the app drawer). Returns an array of objects with:
     *   - packageName: string
     *   - appName: string
     *   - icon: string (base64-encoded PNG)
     */
    @ReactMethod
    fun getInstalledApps(iconSize: Int, promise: Promise) {
        try {
            val pm: PackageManager = reactContext.packageManager
            val mainIntent = Intent(Intent.ACTION_MAIN, null).apply {
                addCategory(Intent.CATEGORY_LAUNCHER)
            }

            val resolveInfoList: List<ResolveInfo> = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                pm.queryIntentActivities(
                    mainIntent,
                    PackageManager.ResolveInfoFlags.of(0)
                )
            } else {
                @Suppress("DEPRECATION")
                pm.queryIntentActivities(mainIntent, 0)
            }

            val apps: WritableArray = Arguments.createArray()
            val selfPackage = reactContext.packageName

            for (info in resolveInfoList) {
                val packageName = info.activityInfo.packageName

                // Skip ourselves from the app list
                if (packageName == selfPackage) continue

                val appName = info.loadLabel(pm).toString()
                val icon = info.loadIcon(pm)

                val map: WritableMap = Arguments.createMap().apply {
                    putString("packageName", packageName)
                    putString("appName", appName)
                    putString("icon", drawableToBase64(icon, iconSize))
                }
                apps.pushMap(map)
            }

            promise.resolve(apps)
        } catch (e: Exception) {
            promise.reject("ERR_INSTALLED_APPS", "Failed to get installed apps: ${e.message}", e)
        }
    }

    /**
     * Launches an app by its package name.
     */
    @ReactMethod
    fun launchApp(packageName: String, promise: Promise) {
        try {
            val pm: PackageManager = reactContext.packageManager
            val launchIntent: Intent? = pm.getLaunchIntentForPackage(packageName)

            if (launchIntent != null) {
                launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                reactContext.startActivity(launchIntent)
                promise.resolve(true)
            } else {
                promise.reject("ERR_LAUNCH", "No launch intent found for $packageName")
            }
        } catch (e: Exception) {
            promise.reject("ERR_LAUNCH", "Failed to launch $packageName: ${e.message}", e)
        }
    }

    /**
     * Opens the system default launcher picker so the user can change
     * their home app. Useful for "reset launcher" functionality.
     */
    @ReactMethod
    fun openLauncherPicker(promise: Promise) {
        try {
            val intent = Intent(Intent.ACTION_MAIN).apply {
                addCategory(Intent.CATEGORY_HOME)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            reactContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERR_PICKER", "Failed to open launcher picker: ${e.message}", e)
        }
    }

    /**
     * Converts a Drawable to a base64-encoded PNG string.
     */
    private fun drawableToBase64(drawable: Drawable, size: Int): String {
        val bitmap = drawableToBitmap(drawable, size)
        val outputStream = ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.PNG, 90, outputStream)
        val bytes = outputStream.toByteArray()
        bitmap.recycle()
        return Base64.encodeToString(bytes, Base64.NO_WRAP)
    }

    private fun drawableToBitmap(drawable: Drawable, size: Int): Bitmap {
        if (drawable is BitmapDrawable && drawable.bitmap != null) {
            return Bitmap.createScaledBitmap(drawable.bitmap, size, size, true)
        }

        val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        drawable.setBounds(0, 0, canvas.width, canvas.height)
        drawable.draw(canvas)
        return bitmap
    }
}
