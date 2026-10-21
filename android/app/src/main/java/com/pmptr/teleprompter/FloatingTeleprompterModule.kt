package com.pmptr.teleprompter

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class FloatingTeleprompterModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val MODULE_NAME = "FloatingTeleprompterModule"
        private var instance: FloatingTeleprompterModule? = null

        fun notifyScrollPosition(position: Int, totalHeight: Int) {
            instance?.let { module ->
                val params = Arguments.createMap().apply {
                    putInt("scrollPosition", position)
                    putInt("totalHeight", totalHeight)
                }
                module.sendEvent("onFloatingOverlayScroll", params)
            }
        }

        fun notifyOverlayClosed() {
            instance?.sendEvent("onFloatingOverlayClosed", Arguments.createMap())
        }
    }

    init {
        instance = this
    }

    override fun getName(): String = MODULE_NAME

    private fun sendEvent(eventName: String, params: WritableMap) {
        if (reactContext.hasActiveReactInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
        }
    }

    @ReactMethod
    fun canDrawOverlays(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                promise.resolve(Settings.canDrawOverlays(reactContext))
            } else {
                promise.resolve(true)
            }
        } catch (e: Exception) {
            promise.reject("OVERLAY_CHECK_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun requestOverlayPermission(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                if (!Settings.canDrawOverlays(reactContext)) {
                    val intent = Intent(
                        Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                        Uri.parse("package:${reactContext.packageName}")
                    ).apply {
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    reactContext.startActivity(intent)
                    promise.resolve(true)
                    return
                }
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("OVERLAY_PERMISSION_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun showOverlay(options: ReadableMap, promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(reactContext)) {
                promise.reject("PERMISSION_DENIED", "Overlay permission (SYSTEM_ALERT_WINDOW) not granted.")
                return
            }

            val intent = Intent(reactContext, FloatingTeleprompterService::class.java).apply {
                if (options.hasKey("scriptId")) putExtra(FloatingTeleprompterService.EXTRA_SCRIPT_ID, options.getString("scriptId"))
                if (options.hasKey("title")) putExtra(FloatingTeleprompterService.EXTRA_TITLE, options.getString("title"))
                if (options.hasKey("content")) putExtra(FloatingTeleprompterService.EXTRA_CONTENT, options.getString("content"))
                if (options.hasKey("speed")) {
                    val s = try { options.getInt("speed") } catch (_: Exception) { options.getDouble("speed").toInt() }
                    putExtra(FloatingTeleprompterService.EXTRA_SPEED, s)
                }
                if (options.hasKey("fontSize")) putExtra(FloatingTeleprompterService.EXTRA_FONT_SIZE, options.getDouble("fontSize").toFloat())
                if (options.hasKey("opacity")) putExtra(FloatingTeleprompterService.EXTRA_OPACITY, options.getDouble("opacity").toFloat())
                if (options.hasKey("backgroundColor")) putExtra(FloatingTeleprompterService.EXTRA_BACKGROUND_COLOR, options.getString("backgroundColor"))
                if (options.hasKey("textColor")) putExtra(FloatingTeleprompterService.EXTRA_TEXT_COLOR, options.getString("textColor"))
                if (options.hasKey("mirrorMode")) putExtra(FloatingTeleprompterService.EXTRA_MIRROR_MODE, options.getBoolean("mirrorMode"))
                if (options.hasKey("scrollPosition")) {
                    val sp = try { options.getInt("scrollPosition") } catch (_: Exception) { options.getDouble("scrollPosition").toInt() }
                    putExtra(FloatingTeleprompterService.EXTRA_SCROLL_POS, sp)
                }
                if (options.hasKey("width")) {
                    val w = try { options.getInt("width") } catch (_: Exception) { options.getDouble("width").toInt() }
                    putExtra(FloatingTeleprompterService.EXTRA_WIDTH, w)
                }
                if (options.hasKey("height")) {
                    val h = try { options.getInt("height") } catch (_: Exception) { options.getDouble("height").toInt() }
                    putExtra(FloatingTeleprompterService.EXTRA_HEIGHT, h)
                }
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactContext.startForegroundService(intent)
            } else {
                reactContext.startService(intent)
            }

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SHOW_OVERLAY_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun hideOverlay(promise: Promise) {
        try {
            val intent = Intent(reactContext, FloatingTeleprompterService::class.java).apply {
                action = FloatingTeleprompterService.ACTION_STOP
            }
            reactContext.startService(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("HIDE_OVERLAY_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun isOverlayRunning(promise: Promise) {
        promise.resolve(FloatingTeleprompterService.isRunning)
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for React Native event emitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for React Native event emitter
    }
}
