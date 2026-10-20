package com.pmptr.teleprompter

import android.app.Activity
import android.view.WindowManager
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class KeepAwakeModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val MODULE_NAME = "KeepAwakeModule"
    }

    override fun getName(): String = MODULE_NAME

    @ReactMethod
    fun activate(promise: Promise) {
        val activity = currentActivity
        if (activity != null) {
            activity.runOnUiThread {
                activity.window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
                promise.resolve(true)
            }
        } else {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun deactivate(promise: Promise) {
        val activity = currentActivity
        if (activity != null) {
            activity.runOnUiThread {
                activity.window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
                promise.resolve(true)
            }
        } else {
            promise.resolve(false)
        }
    }
}
