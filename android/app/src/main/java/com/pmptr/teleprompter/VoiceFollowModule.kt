package com.pmptr.teleprompter

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.util.Locale

class VoiceFollowModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), RecognitionListener {

    companion object {
        const val MODULE_NAME = "VoiceFollowModule"
    }

    private var speechRecognizer: SpeechRecognizer? = null
    private var isListening: Boolean = false
    private var isContinuous: Boolean = true
    private var selectedLanguage: String = "en-US"
    private val mainHandler = Handler(Looper.getMainLooper())

    override fun getName(): String = MODULE_NAME

    private fun sendEvent(eventName: String, params: WritableMap?) {
        if (reactContext.hasActiveReactInstance()) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
        }
    }

    @ReactMethod
    fun isAvailable(promise: Promise) {
        val available = SpeechRecognizer.isRecognitionAvailable(reactContext)
        promise.resolve(available)
    }

    @ReactMethod
    fun isOnDeviceAvailable(promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            val onDevice = SpeechRecognizer.isOnDeviceRecognitionAvailable(reactContext)
            promise.resolve(onDevice)
        } else {
            // Pre-Android 13 device; on-device availability cannot be determined programmatically
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun startListening(options: ReadableMap, promise: Promise) {
        val hasPermission = ContextCompat.checkSelfPermission(
            reactContext,
            Manifest.permission.RECORD_AUDIO
        ) == PackageManager.PERMISSION_GRANTED

        if (!hasPermission) {
            promise.reject("MIC_PERMISSION_DENIED", "Microphone permission is required for voice follow.")
            return
        }

        if (options.hasKey("language")) {
            selectedLanguage = options.getString("language") ?: "en-US"
        }
        if (options.hasKey("continuous")) {
            isContinuous = options.getBoolean("continuous")
        }

        isListening = true

        mainHandler.post {
            try {
                initRecognizer()
                startRecognitionIntent()
                promise.resolve(true)
            } catch (e: Exception) {
                isListening = false
                promise.reject("SPEECH_START_ERROR", e.message, e)
            }
        }
    }

    @ReactMethod
    fun stopListening(promise: Promise) {
        isListening = false
        mainHandler.post {
            try {
                speechRecognizer?.stopListening()
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("SPEECH_STOP_ERROR", e.message, e)
            }
        }
    }

    @ReactMethod
    fun destroy(promise: Promise) {
        isListening = false
        mainHandler.post {
            try {
                speechRecognizer?.destroy()
                speechRecognizer = null
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("SPEECH_DESTROY_ERROR", e.message, e)
            }
        }
    }

    private fun initRecognizer() {
        if (speechRecognizer == null) {
            speechRecognizer = SpeechRecognizer.createSpeechRecognizer(reactContext).apply {
                setRecognitionListener(this@VoiceFollowModule)
            }
        }
    }

    private fun startRecognitionIntent() {
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(
                RecognizerIntent.EXTRA_LANGUAGE_MODEL,
                RecognizerIntent.LANGUAGE_MODEL_FREE_FORM
            )
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, selectedLanguage)
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
            putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3)
            // Enable offline recognition where supported
            putExtra("android.speech.extra.PREFER_OFFLINE", true)
        }
        speechRecognizer?.startListening(intent)
    }

    // RecognitionListener Callbacks
    override fun onReadyForSpeech(params: Bundle?) {
        sendEvent("onSpeechReady", Arguments.createMap())
    }

    override fun onBeginningOfSpeech() {
        sendEvent("onSpeechStarted", Arguments.createMap())
    }

    override fun onRmsChanged(rmsdB: Float) {
        val map = Arguments.createMap().apply {
            putDouble("value", rmsdB.toDouble())
        }
        sendEvent("onSpeechRmsChanged", map)
    }

    override fun onBufferReceived(buffer: ByteArray?) {}

    override fun onEndOfSpeech() {
        sendEvent("onSpeechEnded", Arguments.createMap())
        // Auto-restart if continuous mode is enabled
        if (isListening && isContinuous) {
            mainHandler.postDelayed({
                if (isListening) {
                    try {
                        startRecognitionIntent()
                    } catch (_: Exception) {}
                }
            }, 250)
        }
    }

    override fun onError(error: Int) {
        val errorMsg = when (error) {
            SpeechRecognizer.ERROR_AUDIO -> "Audio recording error"
            SpeechRecognizer.ERROR_CLIENT -> "Client side error"
            SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "Insufficient permissions"
            SpeechRecognizer.ERROR_NETWORK -> "Network error"
            SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> "Network timeout"
            SpeechRecognizer.ERROR_NO_MATCH -> "No speech recognized"
            SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> "Recognition service busy"
            SpeechRecognizer.ERROR_SERVER -> "Server error"
            SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> "No speech input"
            else -> "Speech recognition error ($error)"
        }

        val map = Arguments.createMap().apply {
            putInt("code", error)
            putString("message", errorMsg)
        }
        sendEvent("onSpeechError", map)

        val isRecoverable = error == SpeechRecognizer.ERROR_NO_MATCH ||
                            error == SpeechRecognizer.ERROR_SPEECH_TIMEOUT ||
                            error == SpeechRecognizer.ERROR_CLIENT ||
                            error == SpeechRecognizer.ERROR_RECOGNIZER_BUSY ||
                            error == SpeechRecognizer.ERROR_NETWORK_TIMEOUT

        // For recoverable recognition pauses or transitions in continuous mode, restart listening
        if (isListening && isContinuous && isRecoverable) {
            val delay = if (error == SpeechRecognizer.ERROR_RECOGNIZER_BUSY) 450L else 180L
            mainHandler.postDelayed({
                if (isListening) {
                    try {
                        if (error == SpeechRecognizer.ERROR_CLIENT || error == SpeechRecognizer.ERROR_RECOGNIZER_BUSY) {
                            try { speechRecognizer?.destroy() } catch (_: Exception) {}
                            speechRecognizer = null
                            initRecognizer()
                        }
                        startRecognitionIntent()
                    } catch (_: Exception) {}
                }
            }, delay)
        }
    }

    override fun onResults(results: Bundle?) {
        val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
        if (!matches.isNullOrEmpty()) {
            val map = Arguments.createMap().apply {
                putString("transcript", matches[0])
            }
            sendEvent("onSpeechResults", map)
        }
    }

    override fun onPartialResults(partialResults: Bundle?) {
        val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
        if (!matches.isNullOrEmpty()) {
            val map = Arguments.createMap().apply {
                putString("partialTranscript", matches[0])
            }
            sendEvent("onSpeechPartialResults", map)
        }
    }

    override fun onEvent(eventType: Int, params: Bundle?) {}

    @ReactMethod
    fun addListener(eventName: String) {}

    @ReactMethod
    fun removeListeners(count: Int) {}
}
