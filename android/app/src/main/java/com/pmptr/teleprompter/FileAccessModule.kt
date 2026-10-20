package com.pmptr.teleprompter

import android.app.Activity
import android.content.Intent
import android.net.Uri
import com.facebook.react.bridge.*
import java.io.BufferedReader
import java.io.InputStreamReader

class FileAccessModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    companion object {
        const val MODULE_NAME = "FileAccessModule"
        const val REQUEST_PICK_DOCUMENT = 9001
        const val REQUEST_SAVE_DOCUMENT = 9002
    }

    private var pendingPickPromise: Promise? = null
    private var pendingSavePromise: Promise? = null
    private var pendingSaveContent: String? = null

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String = MODULE_NAME

    @ReactMethod
    fun pickTextFile(promise: Promise) {
        val activity = currentActivity
        if (activity == null) {
            promise.reject("ACTIVITY_UNAVAILABLE", "Activity is not available.")
            return
        }

        pendingPickPromise = promise
        try {
            val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
                addCategory(Intent.CATEGORY_OPENABLE)
                type = "*/*"
                val mimeTypes = arrayOf("text/plain", "text/markdown", "text/csv", "application/json", "*/*")
                putExtra(Intent.EXTRA_MIME_TYPES, mimeTypes)
            }
            activity.startActivityForResult(intent, REQUEST_PICK_DOCUMENT)
        } catch (e: Exception) {
            pendingPickPromise = null
            promise.reject("PICK_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun exportTextFile(fileName: String, content: String, promise: Promise) {
        val activity = currentActivity
        if (activity == null) {
            promise.reject("ACTIVITY_UNAVAILABLE", "Activity is not available.")
            return
        }

        pendingSavePromise = promise
        pendingSaveContent = content
        try {
            val intent = Intent(Intent.ACTION_CREATE_DOCUMENT).apply {
                addCategory(Intent.CATEGORY_OPENABLE)
                type = "text/plain"
                putExtra(Intent.EXTRA_TITLE, if (fileName.endsWith(".txt")) fileName else "$fileName.txt")
            }
            activity.startActivityForResult(intent, REQUEST_SAVE_DOCUMENT)
        } catch (e: Exception) {
            pendingSavePromise = null
            pendingSaveContent = null
            promise.reject("SAVE_ERROR", e.message, e)
        }
    }

    override fun onActivityResult(activity: Activity?, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == REQUEST_PICK_DOCUMENT) {
            val promise = pendingPickPromise ?: return
            pendingPickPromise = null

            if (resultCode == Activity.RESULT_OK && data?.data != null) {
                try {
                    val uri: Uri = data.data!!
                    val inputStream = reactContext.contentResolver.openInputStream(uri)
                    val reader = BufferedReader(InputStreamReader(inputStream))
                    val stringBuilder = StringBuilder()
                    var line: String? = reader.readLine()
                    while (line != null) {
                        stringBuilder.append(line).append("\n")
                        line = reader.readLine()
                    }
                    reader.close()

                    // Try to extract filename
                    var fileName = "Imported Script"
                    val cursor = reactContext.contentResolver.query(uri, null, null, null, null)
                    cursor?.use {
                        if (it.moveToFirst()) {
                            val nameIndex = it.getColumnIndex(android.provider.OpenableColumns.DISPLAY_NAME)
                            if (nameIndex >= 0) {
                                fileName = it.getString(nameIndex)
                            }
                        }
                    }

                    val result = Arguments.createMap().apply {
                        putString("fileName", fileName)
                        putString("content", stringBuilder.toString().trimEnd())
                    }
                    promise.resolve(result)
                } catch (e: Exception) {
                    promise.reject("READ_ERROR", "Failed to read text file: ${e.message}", e)
                }
            } else {
                promise.reject("CANCELLED", "File selection was cancelled.")
            }
        } else if (requestCode == REQUEST_SAVE_DOCUMENT) {
            val promise = pendingSavePromise ?: return
            val contentToSave = pendingSaveContent ?: ""
            pendingSavePromise = null
            pendingSaveContent = null

            if (resultCode == Activity.RESULT_OK && data?.data != null) {
                try {
                    val uri: Uri = data.data!!
                    val outputStream = reactContext.contentResolver.openOutputStream(uri)
                    outputStream?.use { stream ->
                        stream.write(contentToSave.toByteArray())
                    }
                    promise.resolve(true)
                } catch (e: Exception) {
                    promise.reject("WRITE_ERROR", "Failed to write text file: ${e.message}", e)
                }
            } else {
                promise.reject("CANCELLED", "Export was cancelled.")
            }
        }
    }

    override fun onNewIntent(intent: Intent?) {}
}
