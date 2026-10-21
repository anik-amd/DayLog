package app.daylog

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.ui.Modifier
import app.daylog.core.designsystem.theme.DayLogTheme

/**
 * The app's only activity.
 *
 * The UI is Compose, so there is no layout XML and no view hierarchy to inflate. The theme comes
 * from the design system rather than from a platform theme, which is why the window background is
 * painted by Compose instead of by the system.
 */
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        setContent {
            DayLogTheme {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(DayLogTheme.colors.background),
                )
            }
        }
    }
}
