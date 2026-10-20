package com.pmptr.teleprompter

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.util.TypedValue
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.widget.*
import androidx.core.app.NotificationCompat

class FloatingTeleprompterService : Service() {

    companion object {
        const val CHANNEL_ID = "pmptr_floating_teleprompter_channel"
        const val NOTIFICATION_ID = 1001

        const val EXTRA_SCRIPT_ID = "script_id"
        const val EXTRA_TITLE = "title"
        const val EXTRA_CONTENT = "content"
        const val EXTRA_SPEED = "speed"
        const val EXTRA_FONT_SIZE = "font_size"
        const val EXTRA_OPACITY = "opacity"
        const val EXTRA_BACKGROUND_COLOR = "bg_color"
        const val EXTRA_TEXT_COLOR = "text_color"
        const val EXTRA_MIRROR_MODE = "mirror_mode"
        const val EXTRA_SCROLL_POS = "scroll_pos"
        const val EXTRA_WIDTH = "width"
        const val EXTRA_HEIGHT = "height"

        const val ACTION_STOP = "com.pmptr.teleprompter.ACTION_STOP"
        const val ACTION_UPDATE = "com.pmptr.teleprompter.ACTION_UPDATE"

        var isRunning: Boolean = false
        var currentScrollPosition: Int = 0
        var activeScriptId: String? = null
    }

    private var windowManager: WindowManager? = null
    private var overlayView: View? = null
    private var windowParams: WindowManager.LayoutParams? = null

    // UI elements inside floating window
    private var titleView: TextView? = null
    private var collapseBtn: TextView? = null
    private var scrollView: ScrollView? = null
    private var scriptTextView: TextView? = null
    private var playPauseBtn: TextView? = null
    private var speedText: TextView? = null
    private var contentContainer: LinearLayout? = null
    private var isCollapsed: Boolean = false
    private var isExpanded: Boolean = false
    private var lastNonCollapsedHeight: Int = 0
    private var currentPresetIndex: Int = 1

    // State
    private var isPlaying: Boolean = false
    private var currentSpeed: Int = 5
    private var currentFontSize: Float = 22f
    private var currentOpacity: Float = 0.88f
    private var currentMirrorMode: Boolean = false
    private var currentBgColor: Int = Color.parseColor("#161B22")
    private var currentTextColor: Int = Color.WHITE

    private val scrollHandler = Handler(Looper.getMainLooper())
    private var scrollRunnable: Runnable? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        isRunning = true
        createNotificationChannel()
        startForeground(NOTIFICATION_ID, buildNotification("Ready to prompt"))
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent == null) return START_NOT_STICKY

        if (intent.action == ACTION_STOP) {
            closeOverlay()
            return START_NOT_STICKY
        }

        activeScriptId = intent.getStringExtra(EXTRA_SCRIPT_ID) ?: activeScriptId
        val title = intent.getStringExtra(EXTRA_TITLE) ?: "Teleprompter"
        val content = intent.getStringExtra(EXTRA_CONTENT) ?: ""
        currentSpeed = intent.getIntExtra(EXTRA_SPEED, currentSpeed)
        currentFontSize = intent.getFloatExtra(EXTRA_FONT_SIZE, currentFontSize)
        currentOpacity = intent.getFloatExtra(EXTRA_OPACITY, currentOpacity)
        val bgHex = intent.getStringExtra(EXTRA_BACKGROUND_COLOR)
        if (!bgHex.isNullOrEmpty()) {
            try { currentBgColor = Color.parseColor(bgHex) } catch (_: Exception) {}
        }
        val textHex = intent.getStringExtra(EXTRA_TEXT_COLOR)
        if (!textHex.isNullOrEmpty()) {
            try { currentTextColor = Color.parseColor(textHex) } catch (_: Exception) {}
        }
        ensureReadableContrast()
        currentMirrorMode = intent.getBooleanExtra(EXTRA_MIRROR_MODE, currentMirrorMode)
        val initialScroll = intent.getIntExtra(EXTRA_SCROLL_POS, 0)
        val intentWidth = intent.getIntExtra(EXTRA_WIDTH, -1)
        val intentHeight = intent.getIntExtra(EXTRA_HEIGHT, -1)

        if (overlayView == null) {
            initOverlayView(title, content, initialScroll, intentWidth, intentHeight)
        } else {
            updateContent(title, content)
        }

        return START_STICKY
    }

    private fun ensureReadableContrast() {
        val r = Color.red(currentBgColor)
        val g = Color.green(currentBgColor)
        val b = Color.blue(currentBgColor)
        val bgBrightness = (r * 299 + g * 587 + b * 114) / 1000

        val tr = Color.red(currentTextColor)
        val tg = Color.green(currentTextColor)
        val tb = Color.blue(currentTextColor)
        val textBrightness = (tr * 299 + tg * 587 + tb * 114) / 1000

        if (Math.abs(bgBrightness - textBrightness) < 80) {
            currentTextColor = if (bgBrightness < 128) Color.WHITE else Color.parseColor("#202631")
        }
    }

    private fun initOverlayView(title: String, content: String, initialScroll: Int, intentWidth: Int, intentHeight: Int) {
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager

        val layoutFlag = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        val displayMetrics = resources.displayMetrics
        val prefs = getSharedPreferences("cueflow_floating_prefs", Context.MODE_PRIVATE)
        val savedWidth = prefs.getInt("window_width", -1)
        val savedHeight = prefs.getInt("window_height", -1)

        val initialWidth = when {
            intentWidth > 0 -> dpToPx(intentWidth)
            savedWidth > dpToPx(200) -> savedWidth
            else -> (displayMetrics.widthPixels * 0.90f).toInt().coerceAtMost(dpToPx(400))
        }.coerceIn(dpToPx(220), displayMetrics.widthPixels)

        val initialHeight = when {
            intentHeight > 0 -> dpToPx(intentHeight)
            savedHeight > dpToPx(150) -> savedHeight
            else -> dpToPx(320)
        }.coerceIn(dpToPx(160), (displayMetrics.heightPixels * 0.85f).toInt())

        lastNonCollapsedHeight = initialHeight

        windowParams = WindowManager.LayoutParams(
            initialWidth,
            initialHeight,
            layoutFlag,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                    WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = ((displayMetrics.widthPixels - initialWidth) / 2).coerceAtLeast(0)
            y = dpToPx(90)
        }

        // Build floating window layout programmatically
        val rootLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            val bgDrawable = GradientDrawable().apply {
                setColor(currentBgColor)
                cornerRadius = dpToPx(16).toFloat()
                setStroke(dpToPx(1), Color.parseColor("#38445A"))
            }
            background = bgDrawable
            alpha = currentOpacity
            elevation = dpToPx(10).toFloat()
        }

        // 1. Header / Drag bar
        val headerBar = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(dpToPx(12), dpToPx(8), dpToPx(8), dpToPx(8))
            val headerBg = GradientDrawable().apply {
                setColor(Color.parseColor("#222B3A"))
                cornerRadii = floatArrayOf(
                    dpToPx(16).toFloat(), dpToPx(16).toFloat(),
                    dpToPx(16).toFloat(), dpToPx(16).toFloat(),
                    0f, 0f, 0f, 0f
                )
            }
            background = headerBg
        }

        titleView = TextView(this).apply {
            text = title
            setTextColor(Color.WHITE)
            textSize = 14f
            typeface = Typeface.DEFAULT_BOLD
            maxLines = 1
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1.0f)
        }
        headerBar.addView(titleView)

        // Collapse / Expand button
        collapseBtn = createHeaderIconBtn("–") {
            toggleCollapse()
        }
        headerBar.addView(collapseBtn)

        // Return to main app button
        val returnBtn = createHeaderIconBtn("↗") {
            returnToApp()
        }
        headerBar.addView(returnBtn)

        // Close button
        val closeBtn = createHeaderIconBtn("✕") {
            closeOverlay()
        }
        headerBar.addView(closeBtn)

        // Drag listener on title text handle so buttons remain fully clickable
        setupDragListener(titleView!!)

        rootLayout.addView(headerBar)

        // 2. Main content container (collapsible)
        contentContainer = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                0,
                1.0f
            )
        }

        // Script ScrollView & Reading Guide inside FrameLayout
        val textFrame = FrameLayout(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                0,
                1.0f
            )
        }

        scrollView = ScrollView(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
            isVerticalScrollBarEnabled = true
            isFillViewport = true
            setPadding(dpToPx(16), dpToPx(8), dpToPx(16), dpToPx(8))
            clipToPadding = false
        }

        val displayContent = if (content.isNotBlank()) {
            content
        } else {
            "Welcome to CueFlow.\n\nOpen a script from your library and tap 'Start Prompter' to read it here."
        }

        scriptTextView = TextView(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.WRAP_CONTENT
            )
            this.text = displayContent
            setTextColor(currentTextColor)
            textSize = currentFontSize
            typeface = Typeface.DEFAULT
            gravity = Gravity.CENTER_HORIZONTAL
            setLineSpacing(dpToPx(6).toFloat(), 1.3f)
            if (currentMirrorMode) {
                scaleX = -1f
            }
            // Add top and bottom breathing room
            setPadding(0, dpToPx(36), 0, dpToPx(160))
        }

        scrollView?.addView(scriptTextView)
        textFrame.addView(scrollView)

        // Reading Guide Indicator Line
        val guideLine = View(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                dpToPx(2)
            ).apply {
                topMargin = dpToPx(48)
            }
            setBackgroundColor(Color.parseColor("#CF5418"))
            alpha = 0.65f
            isClickable = false
            isFocusable = false
        }
        textFrame.addView(guideLine)

        contentContainer?.addView(textFrame)

        // 3. Floating Bottom Controls Bar wrapped in HorizontalScrollView + Dedicated Resize Grip
        val bottomBarWrapper = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setBackgroundColor(Color.parseColor("#1B2230"))
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
        }

        val bottomControlsScroll = HorizontalScrollView(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                0,
                LinearLayout.LayoutParams.WRAP_CONTENT,
                1.0f
            )
            isFillViewport = false
            isHorizontalScrollBarEnabled = false
        }

        val bottomControls = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(dpToPx(8), dpToPx(6), dpToPx(4), dpToPx(8))
            setBackgroundColor(Color.parseColor("#1B2230"))
        }

        // Play/Pause button
        playPauseBtn = TextView(this).apply {
            text = "▶ Play"
            setTextColor(Color.WHITE)
            textSize = 13f
            typeface = Typeface.DEFAULT_BOLD
            gravity = Gravity.CENTER
            val btnBg = GradientDrawable().apply {
                setColor(Color.parseColor("#CF5418"))
                cornerRadius = dpToPx(8).toFloat()
            }
            background = btnBg
            layoutParams = LinearLayout.LayoutParams(dpToPx(80), dpToPx(36))
            isClickable = true
            isFocusable = true
            setOnClickListener {
                togglePlayPause()
            }
        }
        bottomControls.addView(playPauseBtn)

        // Rewind to top button
        val rewindBtn = createControlIconBtn("⏮") {
            scrollView?.smoothScrollTo(0, 0)
            currentScrollPosition = 0
        }
        bottomControls.addView(rewindBtn)

        // Speed controls: [-] [Speed] [+]
        val speedDecBtn = createControlIconBtn("–") {
            if (currentSpeed > 1) {
                currentSpeed--
                updateSpeedDisplay()
            }
        }
        bottomControls.addView(speedDecBtn)

        speedText = TextView(this).apply {
            text = "${currentSpeed}x"
            setTextColor(Color.WHITE)
            textSize = 13f
            typeface = Typeface.DEFAULT_BOLD
            gravity = Gravity.CENTER
            setPadding(dpToPx(4), 0, dpToPx(4), 0)
        }
        bottomControls.addView(speedText)

        val speedIncBtn = createControlIconBtn("+") {
            if (currentSpeed < 20) {
                currentSpeed++
                updateSpeedDisplay()
            }
        }
        bottomControls.addView(speedIncBtn)

        // Font size control
        val fontDecBtn = createControlIconBtn("A-") {
            if (currentFontSize > 16f) {
                currentFontSize -= 2f
                scriptTextView?.textSize = currentFontSize
            }
        }
        bottomControls.addView(fontDecBtn)

        val fontIncBtn = createControlIconBtn("A+") {
            if (currentFontSize < 48f) {
                currentFontSize += 2f
                scriptTextView?.textSize = currentFontSize
            }
        }
        bottomControls.addView(fontIncBtn)

        // Opacity toggle button
        val opacityBtn = createControlIconBtn("🌓") {
            cycleOpacity(rootLayout)
        }
        bottomControls.addView(opacityBtn)

        // Mirror mode toggle
        val mirrorBtn = createControlIconBtn("⇄") {
            currentMirrorMode = !currentMirrorMode
            scriptTextView?.scaleX = if (currentMirrorMode) -1f else 1f
        }
        bottomControls.addView(mirrorBtn)

        // Size presets cycler (Compact, Standard, Large, Full Width)
        val expandBtn = createControlIconBtn("⤢") {
            cycleWindowPresets()
        }
        bottomControls.addView(expandBtn)

        bottomControlsScroll.addView(bottomControls)
        bottomBarWrapper.addView(bottomControlsScroll)

        // Corner Resize Grip Handle on the bottom-right (↘)
        val resizeHandle = TextView(this).apply {
            text = "↘"
            setTextColor(Color.parseColor("#CF5418"))
            textSize = 17f
            typeface = Typeface.DEFAULT_BOLD
            gravity = Gravity.CENTER
            val handleBg = GradientDrawable().apply {
                setColor(Color.parseColor("#252E3E"))
                cornerRadius = dpToPx(8).toFloat()
                setStroke(dpToPx(1), Color.parseColor("#CF5418"))
            }
            background = handleBg
            val handleSize = dpToPx(34)
            layoutParams = LinearLayout.LayoutParams(handleSize, handleSize).apply {
                marginEnd = dpToPx(8)
                marginStart = dpToPx(4)
                topMargin = dpToPx(4)
                bottomMargin = dpToPx(4)
            }
            isClickable = true
            isFocusable = true
        }
        setupResizeListener(resizeHandle)
        bottomBarWrapper.addView(resizeHandle)

        contentContainer?.addView(bottomBarWrapper)

        rootLayout.addView(contentContainer)

        overlayView = rootLayout
        windowManager?.addView(overlayView, windowParams)

        // Scroll to initial position if requested and valid
        if (initialScroll > 0) {
            scrollView?.post {
                val maxScroll = if (scriptTextView != null && scrollView != null) {
                    (scriptTextView!!.bottom - scrollView!!.height).coerceAtLeast(0)
                } else initialScroll
                // Don't scroll past the bottom or start in empty space
                val safeScroll = if (initialScroll >= maxScroll - dpToPx(30)) {
                    0
                } else {
                    initialScroll.coerceAtMost(maxScroll)
                }
                scrollView?.scrollTo(0, safeScroll)
                currentScrollPosition = safeScroll
            }
        }

        // Setup smooth auto-scroll loop
        setupScrollLoop()
    }

    private fun updateContent(title: String, content: String) {
        val displayContent = if (content.isNotBlank()) {
            content
        } else {
            "Welcome to CueFlow.\n\nOpen a script from your library and tap 'Start Prompter' to read it here."
        }
        titleView?.text = title
        scriptTextView?.text = displayContent
        scriptTextView?.setTextColor(currentTextColor)
        scrollView?.post {
            scrollView?.scrollTo(0, 0)
            currentScrollPosition = 0
        }
    }

    private fun setupDragListener(dragHandle: View) {
        var initialX = 0
        var initialY = 0
        var initialTouchX = 0f
        var initialTouchY = 0f

        dragHandle.setOnTouchListener { _, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    initialX = windowParams?.x ?: 0
                    initialY = windowParams?.y ?: 0
                    initialTouchX = event.rawX
                    initialTouchY = event.rawY
                    true
                }
                MotionEvent.ACTION_MOVE -> {
                    windowParams?.x = initialX + (event.rawX - initialTouchX).toInt()
                    windowParams?.y = initialY + (event.rawY - initialTouchY).toInt()
                    windowManager?.updateViewLayout(overlayView, windowParams)
                    true
                }
                else -> false
            }
        }
    }

    private fun setupResizeListener(resizeHandle: View) {
        var initialW = 0
        var initialH = 0
        var initialTouchX = 0f
        var initialTouchY = 0f

        resizeHandle.setOnTouchListener { view, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    initialW = windowParams?.width ?: dpToPx(340)
                    initialH = windowParams?.height ?: dpToPx(320)
                    initialTouchX = event.rawX
                    initialTouchY = event.rawY
                    view.alpha = 0.5f
                    true
                }
                MotionEvent.ACTION_MOVE -> {
                    val deltaX = (event.rawX - initialTouchX).toInt()
                    val deltaY = (event.rawY - initialTouchY).toInt()

                    val displayMetrics = resources.displayMetrics
                    val minWidth = dpToPx(220)
                    val maxWidth = (displayMetrics.widthPixels - (windowParams?.x ?: 0)).coerceAtLeast(minWidth)
                    val minHeight = dpToPx(160)
                    val maxHeight = (displayMetrics.heightPixels - (windowParams?.y ?: 0)).coerceAtLeast(minHeight)

                    val newWidth = (initialW + deltaX).coerceIn(minWidth, maxWidth)
                    val newHeight = (initialH + deltaY).coerceIn(minHeight, maxHeight)

                    windowParams?.width = newWidth
                    windowParams?.height = newHeight
                    lastNonCollapsedHeight = newHeight
                    windowManager?.updateViewLayout(overlayView, windowParams)
                    true
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                    view.alpha = 1.0f
                    saveWindowSize(windowParams?.width ?: 0, windowParams?.height ?: 0)
                    true
                }
                else -> false
            }
        }
    }

    private fun cycleWindowPresets() {
        if (isCollapsed) return
        val displayMetrics = resources.displayMetrics
        val screenW = displayMetrics.widthPixels
        val screenH = displayMetrics.heightPixels

        val presets = listOf(
            Pair(dpToPx(280), dpToPx(220)), // Compact
            Pair(dpToPx(360), dpToPx(320)), // Standard
            Pair(dpToPx(460), dpToPx(420)), // Large
            Pair((screenW - dpToPx(20)).coerceAtLeast(dpToPx(320)), dpToPx(360)) // Full Width
        )
        val presetNames = listOf("Compact", "Standard", "Large", "Full Width")

        currentPresetIndex = (currentPresetIndex + 1) % presets.size
        val chosen = presets[currentPresetIndex]

        val targetW = chosen.first.coerceAtMost(screenW - (windowParams?.x ?: 0)).coerceAtLeast(dpToPx(220))
        val targetH = chosen.second.coerceAtMost(screenH - (windowParams?.y ?: 0)).coerceAtLeast(dpToPx(160))

        windowParams?.width = targetW
        windowParams?.height = targetH
        lastNonCollapsedHeight = targetH
        windowManager?.updateViewLayout(overlayView, windowParams)
        saveWindowSize(targetW, targetH)

        Toast.makeText(this, "Window: ${presetNames[currentPresetIndex]}", Toast.LENGTH_SHORT).show()
    }

    private fun saveWindowSize(width: Int, height: Int) {
        if (width <= 0 || height <= 0) return
        try {
            val prefs = getSharedPreferences("cueflow_floating_prefs", Context.MODE_PRIVATE)
            prefs.edit().putInt("window_width", width).putInt("window_height", height).apply()
        } catch (_: Exception) {}
    }

    private fun toggleCollapse() {
        isCollapsed = !isCollapsed
        if (isCollapsed) {
            contentContainer?.visibility = View.GONE
            collapseBtn?.text = "+"
            windowParams?.height = WindowManager.LayoutParams.WRAP_CONTENT
        } else {
            contentContainer?.visibility = View.VISIBLE
            collapseBtn?.text = "–"
            windowParams?.height = if (lastNonCollapsedHeight > dpToPx(160)) lastNonCollapsedHeight else dpToPx(320)
        }
        windowManager?.updateViewLayout(overlayView, windowParams)
    }

    private fun togglePlayPause() {
        isPlaying = !isPlaying
        if (isPlaying) {
            // If already at or near bottom, rewind to top automatically
            if (scrollView != null && scriptTextView != null) {
                val currentY = scrollView!!.scrollY
                val maxScroll = (scriptTextView!!.bottom - scrollView!!.height).coerceAtLeast(0)
                if (currentY >= maxScroll - dpToPx(20)) {
                    scrollView!!.scrollTo(0, 0)
                    currentScrollPosition = 0
                }
            }

            playPauseBtn?.text = "⏸ Pause"
            val btnBg = GradientDrawable().apply {
                setColor(Color.parseColor("#2E7D32"))
                cornerRadius = dpToPx(8).toFloat()
            }
            playPauseBtn?.background = btnBg
            startAutoScroll()
        } else {
            playPauseBtn?.text = "▶ Play"
            val btnBg = GradientDrawable().apply {
                setColor(Color.parseColor("#CF5418"))
                cornerRadius = dpToPx(8).toFloat()
            }
            playPauseBtn?.background = btnBg
            stopAutoScroll()
        }
    }

    private fun setupScrollLoop() {
        scrollRunnable = object : Runnable {
            override fun run() {
                if (isPlaying && scrollView != null && scriptTextView != null) {
                    val currentY = scrollView!!.scrollY
                    val maxScroll = scriptTextView!!.bottom - scrollView!!.height

                    if (currentY < maxScroll) {
                        // Calculate smooth pixel delta per frame (approx 60fps = 16ms)
                        val pixelsPerFrame = (currentSpeed * 0.45f).coerceAtLeast(0.3f)
                        val nextY = (currentY + pixelsPerFrame).toInt()
                        scrollView!!.scrollTo(0, nextY)
                        currentScrollPosition = nextY
                        FloatingTeleprompterModule.notifyScrollPosition(nextY, maxScroll)
                        scrollHandler.postDelayed(this, 16)
                    } else {
                        // Reached bottom
                        togglePlayPause()
                    }
                }
            }
        }
    }

    private fun startAutoScroll() {
        scrollRunnable?.let {
            scrollHandler.removeCallbacks(it)
            scrollHandler.post(it)
        }
    }

    private fun stopAutoScroll() {
        scrollRunnable?.let {
            scrollHandler.removeCallbacks(it)
        }
    }

    private fun updateSpeedDisplay() {
        speedText?.text = "${currentSpeed}x"
    }

    private fun cycleOpacity(root: View) {
        currentOpacity = when {
            currentOpacity > 0.8f -> 0.65f
            currentOpacity > 0.6f -> 0.45f
            currentOpacity > 0.4f -> 1.0f
            else -> 0.88f
        }
        root.alpha = currentOpacity
    }

    private fun closeOverlay() {
        isRunning = false
        stopAutoScroll()
        if (overlayView != null && windowManager != null) {
            try {
                windowManager?.removeView(overlayView)
            } catch (_: Exception) {}
            overlayView = null
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            stopForeground(STOP_FOREGROUND_REMOVE)
        } else {
            @Suppress("DEPRECATION")
            stopForeground(true)
        }
        stopSelf()
        FloatingTeleprompterModule.notifyOverlayClosed()
    }

    private fun returnToApp() {
        val launchIntent = packageManager.getLaunchIntentForPackage(packageName)?.apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
            putExtra(EXTRA_SCRIPT_ID, activeScriptId)
            putExtra(EXTRA_SCROLL_POS, currentScrollPosition)
        }
        if (launchIntent != null) {
            startActivity(launchIntent)
        }
        closeOverlay()
    }

    private fun createHeaderIconBtn(label: String, onClick: () -> Unit): TextView {
        return TextView(this).apply {
            text = label
            setTextColor(Color.WHITE)
            textSize = 15f
            typeface = Typeface.DEFAULT_BOLD
            gravity = Gravity.CENTER
            val rippleBg = GradientDrawable().apply {
                setColor(Color.parseColor("#334155"))
                cornerRadius = dpToPx(8).toFloat()
            }
            background = rippleBg
            val size = dpToPx(36)
            layoutParams = LinearLayout.LayoutParams(size, size).apply {
                leftMargin = dpToPx(6)
            }
            isClickable = true
            isFocusable = true
            setOnClickListener { onClick() }
        }
    }

    private fun createControlIconBtn(label: String, onClick: () -> Unit): TextView {
        return TextView(this).apply {
            text = label
            setTextColor(Color.WHITE)
            textSize = 13f
            typeface = Typeface.DEFAULT_BOLD
            gravity = Gravity.CENTER
            val btnBg = GradientDrawable().apply {
                setColor(Color.parseColor("#2C3647"))
                cornerRadius = dpToPx(8).toFloat()
            }
            background = btnBg
            val size = dpToPx(34)
            layoutParams = LinearLayout.LayoutParams(size, size).apply {
                leftMargin = dpToPx(4)
                rightMargin = dpToPx(2)
            }
            isClickable = true
            isFocusable = true
            setOnClickListener { onClick() }
        }
    }

    private fun dpToPx(dp: Int): Int {
        return TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_DIP,
            dp.toFloat(),
            resources.displayMetrics
        ).toInt()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Floating Teleprompter Service",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Shows persistent notification while floating teleprompter is active"
            }
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(text: String): Notification {
        val stopIntent = Intent(this, FloatingTeleprompterService::class.java).apply {
            action = ACTION_STOP
        }
        val stopPendingIntent = PendingIntent.getService(
            this,
            0,
            stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val openAppIntent = packageManager.getLaunchIntentForPackage(packageName)?.apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val openAppPendingIntent = PendingIntent.getActivity(
            this,
            1,
            openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("CueFlow Floating Teleprompter")
            .setContentText(text)
            .setSmallIcon(android.R.drawable.ic_menu_slideshow)
            .setContentIntent(openAppPendingIntent)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Stop Overlay", stopPendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    override fun onDestroy() {
        super.onDestroy()
        isRunning = false
        stopAutoScroll()
        if (overlayView != null && windowManager != null) {
            try {
                windowManager?.removeView(overlayView)
            } catch (_: Exception) {}
            overlayView = null
        }
        FloatingTeleprompterModule.notifyOverlayClosed()
    }
}
